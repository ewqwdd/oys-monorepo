const { default: mongoose } = require("mongoose");
const userMiddleware = require("../middleware/userMiddleware");
const User = require("../models/User");
const { generateApiKey } = require("../services/apiKey");
const {
  generateAccessToken,
  generateRefreshToken,
  defineRefreshSecret,
} = require("../services/generateTokens");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const combinedMiddleware = require("../middleware/combinedMiddleware");


const router = require("express").Router();

router.use(require('./crm/teachers'));
router.use(require('./crm/meets'));
router.use(require('./crm/avaliable'));
router.use(require('./crm/clients'));
router.use(require('./crm/photos'));

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send("Email и пароль обязательны");
    }

    const emailRegExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegExp.test(email)) {
      return res.status(400).send("Некорректный email");
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("Пользователь с таким email уже существует");
    }
    const newUser = new User({ email, username: "user" + Date.now() });

    const apiKey = generateApiKey();
    newUser.apiKey = apiKey;
    const access_token = generateAccessToken(newUser, "user");
    const refresh_token = generateRefreshToken(newUser, "user");
    newUser.refresh_token = bcrypt.hashSync(refresh_token, 10);
    newUser.password = bcrypt.hashSync(password, 10);

    await newUser.save();
    res.json({ access_token, refresh_token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Ошибка сервера" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send("Email и пароль обязательны");
    }

    const user = await User.findOne({ email });

    if (user) {
      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(400).send("Неверный пароль");
      }

      const access_token = generateAccessToken(user, "user");
      const refresh_token = generateRefreshToken(user, "user");

      user.refresh_token = bcrypt.hashSync(refresh_token, 10);
      await user.save();

      res.json({ access_token, refresh_token });
      return;
    }
    const teacher = await Teacher.findOne({ email });
    if (teacher) {
      const validPassword = password === teacher.password;

      if (!validPassword) {
        return res.status(400).send("Неверный пароль");
      }

      const access_token = generateAccessToken(teacher, "teacher");
      const refresh_token = generateRefreshToken(teacher, "teacher");

      teacher.refresh_token = bcrypt.hashSync(refresh_token, 10);
      await teacher.save();

      res.json({ access_token, refresh_token });
      return;
    }
    if (!user && !teacher) {
      return res.status(400).send("Пользователь с таким email не существует");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Ошибка сервера" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token, role = "user" } = req.body;
    if (!refresh_token) {
      return res.status(400).send("Токен обновления не найден");
    }
    const decoded = jwt.verify(refresh_token, defineRefreshSecret(role));
    let user;
    if (role === "user") {
      user = await User.findById(decoded.id);
    } else if (role === "teacher") {
      user = await Teacher.findById(decoded.id);
    }
    if (!user) {
      return res.status(400).send("Пользователь не найден");
    }
    const validRefreshToken = bcrypt.compareSync(
      refresh_token,
      user.refresh_token
    );
    if (!validRefreshToken) {
      return res.status(400).send("Токен обновления не валиден");
    }
    const access_token = generateAccessToken(user, role);

    res.json({ access_token });
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Ошибка сервера" });
  }
});

router.get("/init", combinedMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === "user") {
      const user = await User.findById(id, {
        password: 0,
        refresh_token: 0,
      })
        .populate("teachers")
        .populate("clients");
      res.json(user);
      return;
    } else if (role === "teacher") {
      const user = await Teacher.findOne({ _id: new mongoose.Types.ObjectId(id) }, {
        password: 0,
        refresh_token: 0,
      }).populate("meets")
      .populate("avaliable");
      res.json(user);
      return;
    }
    return res.status(401).send("Не авторизован");
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Ошибка сервера" });
  }
});


module.exports = router;
