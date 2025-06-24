const dayjs = require("dayjs");
const apiMiddleware = require("../middleware/apiMiddleware");
const Avaliable = require("../models/Avaliable");
const Client = require("../models/Client");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const { default: mongoose } = require("mongoose");

dayjs.extend(utc);
dayjs.extend(timezone);


const router = require("express").Router();
router.use(apiMiddleware);
router.use(require("./api/clients"));
router.use(require("./api/meets"));
router.use(require("./api/avaliable"));
router.use(require("./api/teachers"));


router.get("/", (req, res) => {
  res.send("API работает");
});


router.post("/transaction", async (req, res) => {
  try {
    const {
      client: clientId,
      avaliable: avaliableId,
      amount,
      status,
      uuid,
      meetId,
      date,
    } = req.body;
    const userId = req.user._id;

    // Проверяем существование клиента и доступности
    const client = await Client.findOne({ _id: new mongoose.Types.ObjectId(clientId), user: new mongoose.Types.ObjectId(userId) });
    const avaliable = await Avaliable.findById(avaliableId);

    if (!client || !avaliable) {
      return res
        .status(400)
        .json({ message: "Клиент или доступность не найдены" });
    }

    // Создаём новую транзакцию
    const transaction = {
      _id: new mongoose.Types.ObjectId(), // уникальный идентификатор
      date,
      amount,
      status,
      user: userId,
      meet: meetId,
      avaliable: avaliableId,
      uuid,
      success: status === "success",
    };

    // Добавляем транзакцию в массив клиента
    client.transactions.push(transaction);

    // Сохраняем изменения
    await client.save();

    res.status(201).json({ message: "Транзакция успешно добавлена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
router.get("/transaction/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({
      user: new mongoose.Types.ObjectId(userId),
      "transactions.uuid": uuid,
    });
    if (!client) {
      return res.status(404).json({ message: "Транзакция не найдена" });
    }
    const transaction = client.transactions.find((t) => t.uuid === uuid);
    transaction.clientId = client._id;

    res.json({ transaction, clientId: client._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
