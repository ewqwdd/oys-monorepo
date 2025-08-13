const { default: mongoose } = require("mongoose");
const Teacher = require("../../models/Teacher");
const Avaliable = require("../../models/Avaliable");
const queryTime = require("../../lib/queryTime");
const dayjs = require("dayjs");

const days = {
  Понеділок: 0,
  Вівторок: 1,
  Середа: 2,
  Четвер: 3,
  "П'ятниця": 4,
  Субота: 5,
  Неділя: 6,
};

const router = require("express").Router();

router.get("/teachers", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 9999,
      level = "[]",
      type = "[]",
      format = "[]",
      time = "[]",
      day = "[]",
      city = "[]",
    } = req.query;

    const lvl = JSON.parse(level);
    const typeParsed = JSON.parse(type);
    const formatParsed = JSON.parse(format);
    const timeParsed = JSON.parse(time);
    const dayParsed = JSON.parse(day);
    const cityParsed = JSON.parse(city);
    console.log(format)

    const filter = {
      user: new mongoose.Types.ObjectId(userId),
      published: true,
    };

    if (lvl.length > 0) {
      filter.lvl = { $in: lvl };
    }

    if (typeParsed.length > 0) {
      filter.type = { $in: typeParsed };
    }

    if (cityParsed.length > 0) {
      filter.city = { $in: cityParsed };
    }

    const times = timeParsed.map((t) => queryTime(t));
    console.log({
                ...(formatParsed.length > 0
                ? { format: { $elemMatch: { $in: formatParsed } } }
                : {}),
                ...(timeParsed.length > 0
                  ? {
                      timeFrom: {
                        $gte: Math.min(...times.map((t) => t.timeFrom)),
                      },
                      timeTo: { $lte: Math.max(...times.map((t) => t.timeTo)) },
                    }
                  : {}),
                ...(dayParsed.length > 0
                  ? { day: { $in: dayParsed.map((d) => days[d]) } }
                  : {}),
                $or: [
                  { date: { $exists: false } },
                  { date: { $eq: null } },
                  { date: { $gte: dayjs().add(2, "hour").toDate() } },
                ],
              });

    const teachers = await Teacher.aggregate([
      { $match: filter }, // Применение первого фильтра
      {
        $lookup: {
          from: "avaliables", // Имя коллекции для связи
          localField: "_id", // Локальное поле в коллекции Teacher
          foreignField: "teacher", // Поле в коллекции Avaliables
          as: "avaliable", // Имя результирующего массива
          pipeline: [
            {
              $match: {
                ...(formatParsed.length > 0
                ? { format: { $elemMatch: { $in: formatParsed } } }
                : {}),
                ...(timeParsed.length > 0
                  ? {
                      timeFrom: {
                        $gte: Math.min(...times.map((t) => t.timeFrom)),
                      },
                      timeTo: { $lte: Math.max(...times.map((t) => t.timeTo)) },
                    }
                  : {}),
                ...(dayParsed.length > 0
                  ? { day: { $in: dayParsed.map((d) => days[d]) } }
                  : {}),
                $or: [
                  { date: { $exists: false } },
                  { date: { $eq: null } },
                  { date: { $gte: dayjs().add(2, "hour").toDate() } },
                ],
              },
            },
          ],
        },
      },
      // {
      //   $match: {
      //     "avaliable.0": { $exists: true }, // Убедитесь, что у учителя есть доступные слоты
      //   },
      // },
      { $sort: { order: 1, createdAt: -1 } }, // Сортировка по полю order
      { $skip: (page - 1) * limit }, // Пропуск документов для пагинации
      { $limit: Number(limit) }, // Лимит на количество документов
      {
        $project: {
          merchantAccount: 0,
          merchantSecret: 0,
          password: 0,
          refresh_token: 0,
        },
      },
    ]);

    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/teachersMain", async (req, res) => {
  try {
    const userId = req.user._id;

    const [teachers, slider, beginner] = await Promise.all([
      Teacher.find({
        user: new mongoose.Types.ObjectId(userId),
        published: true,
      })
        .limit(2)
        .select({
          merchantAccount: 0,
          merchantSecret: 0,
          password: 0,
          refresh_token: 0,
        }),
      Teacher.find({
        user: new mongoose.Types.ObjectId(userId),
        sliderVisible: true,
      }).select({
        merchantAccount: 0,
        merchantSecret: 0,
        password: 0,
        refresh_token: 0,
      }),
      Teacher.find({
        user: new mongoose.Types.ObjectId(userId),
        beginnerPublished: true,
      }),
    ]);

    res.json({
      teachers,
      slider,
      beginner: beginner.sort(() => Math.random() - 0.5).slice(0, 4),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/teachers/cities", async (req, res) => {
  try {
    const userId = req.user._id;

    const cities = await Teacher.distinct("city", {
      user: new mongoose.Types.ObjectId(userId),
      published: true,
    });

    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/teachers/:slug", async (req, res) => {
  try {
    const userId = req.user._id;
    const slug = req.params.slug;

    const teacher = await Teacher.findOne({
      user: new mongoose.Types.ObjectId(userId),
      slug,
      published: true,
    }).select({
      merchantAccount: 0,
      merchantSecret: 0,
      password: 0,
      refresh_token: 0,
    });
    const avaliable = await Avaliable.find({
      teacher: teacher?._id,
      $or: [
        { date: { $exists: false } },
        { date: { $eq: null } },
        { date: { $gte: dayjs().add(2, "hour").toDate() } },
      ],
    });

    res.json({ teacher, avaliable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/teachersId/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;

    const teacher = await Teacher.findOne({
      user: new mongoose.Types.ObjectId(userId),
      _id: new mongoose.Types.ObjectId(id),
      published: true,
    }).select({
      merchantAccount: 0,
      merchantSecret: 0,
      password: 0,
      refresh_token: 0,
    });
    const avaliable = await Avaliable.find({
      teacher: teacher?._id,
      $or: [
        { date: { $exists: false } },
        { date: { $eq: null } },
        { date: { $gte: dayjs().add(2, "hour").toDate() } },
      ],
    });

    res.json({ teacher, avaliable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/teachersId/:id/merchants", async (req, res) => {
  try {
    const userId = req.user._id;
    const id = req.params.id;

    const teacher = await Teacher.findOne({
      user: new mongoose.Types.ObjectId(userId),
      _id: new mongoose.Types.ObjectId(id),
      published: true,
    }).select({
      merchantAccount: 1,
      merchantSecret: 1,
    });

    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
