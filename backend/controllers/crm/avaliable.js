const { default: mongoose } = require("mongoose");
const combinedMiddleware = require("../../middleware/combinedMiddleware");
const Avaliable = require("../../models/Avaliable");
const timeToMinutes = require("../../services/timeToMinutes");
const dayjs = require("dayjs");
const getUTC = require("../../lib/getUtc");

const router = require("express").Router();

router.get("/avaliable", combinedMiddleware, async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (req.user.role === "teacher") {
      if (req.user.id !== teacherId) {
        return res.status(403).json({ message: "Нет доступа" });
      }
    }

    const avaliables = await Avaliable.find({
      teacher: new mongoose.Types.ObjectId(teacherId),
      disabeled: { $ne: true },
    });

    res.json(avaliables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/avaliable", combinedMiddleware, async (req, res) => {
  try {
    const { teacher, day, timeTo, timeFrom, price, places, date } = req.body;

    // Проверка на заполненность всех полей
    if (!teacher || (!day && !date) || !timeTo || !timeFrom || !price || !places) {
      return res.status(400).json({ message: "Не все поля заполнены" });
    }
    if (req.user.role === "teacher") {
      if (req.user.id !== teacher) {
        return res.status(403).json({ message: "Нет доступа" });
      }
    }

    // Преобразование времени в минуты
    const timeToMins = timeToMinutes(timeTo);
    const timeFromMins = timeToMinutes(timeFrom);

    if (timeFromMins >= timeToMins) {
      return res.status(400).json({
        message:
          "Время начала не может быть больше или равно времени окончания",
      });
    }

    console.log(timeToMins, timeFromMins);

    // Проверка на пересечение времени
    const overlapping = date ? null : await Avaliable.findOne({
      teacher: new mongoose.Types.ObjectId(teacher),
      day,
      $or: [
        {
          // Новый интервал начинается внутри существующего
          timeFrom: { $lte: timeFromMins },
          timeTo: { $gte: timeFromMins },
        },
        {
          // Новый интервал заканчивается внутри существующего
          timeFrom: { $lte: timeToMins },
          timeTo: { $gte: timeToMins },
        },
        {
          // Новый интервал полностью покрывает существующий
          timeFrom: { $gte: timeFromMins },
          timeTo: { $lte: timeToMins },
        },
      ],
      disabled: { $ne: true },
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ message: "Время пересекается с уже существующим" });
    }

    // Создание новой записи
    const avaliable = new Avaliable({
      teacher,
      day: date ? null : day,
      timeTo: timeToMins,
      timeFrom: timeFromMins,
      price,
      places,
      date: date ? getUTC(dayjs(date)).startOf("day") : null,
    });
    await avaliable.save();

    res.json(avaliable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/avaliable/:_id", combinedMiddleware, async (req, res) => {
  try {
    const { _id } = req.params;

    const avaliable = await Avaliable.findById(_id);

    if (!avaliable) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    if (req.user.role === "teacher") {
      if (req.user.id !== String(avaliable.teacher)) {
        return res.status(403).json({ message: "Нет доступа" });
      }
    }

    await Avaliable.deleteOne({ _id: new mongoose.Types.ObjectId(_id) });

    res.json(avaliable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/avaliable", combinedMiddleware, async (req, res) => {
  try {
    const { teacher, day, timeTo, timeFrom, price, places, _id, date } = req.body;

    if (req.user.role === "teacher") {
      if (req.user.id !== teacher) {
        return res.status(403).json({ message: "Нет доступа" });
      }
    }

    // Преобразование времени в минуты
    const timeToMins = timeToMinutes(timeTo);
    const timeFromMins = timeToMinutes(timeFrom);

    if (timeFromMins >= timeToMins) {
      return res.status(400).json({
        message:
          "Время начала не может быть больше или равно времени окончания",
      });
    }

    // Проверка на пересечение времени
    const overlapping = date ? null : await Avaliable.findOne({
      teacher: new mongoose.Types.ObjectId(teacher),
      day,
      $or: [
        {
          // Новый интервал начинается внутри существующего
          timeFrom: { $lte: timeFromMins },
          timeTo: { $gte: timeFromMins },
        },
        {
          // Новый интервал заканчивается внутри существующего
          timeFrom: { $lte: timeToMins },
          timeTo: { $gte: timeToMins },
        },
        {
          // Новый интервал полностью покрывает существующий
          timeFrom: { $gte: timeFromMins },
          timeTo: { $lte: timeToMins },
        },
      ],
      disabled: { $ne: true },
      _id: { $ne: new mongoose.Types.ObjectId(_id) },
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ message: "Время пересекается с уже существующим" });
    }

    // Создание новой записи
    const avaliable = await Avaliable.findOneAndUpdate(
      { _id },
      {
        teacher,
        day: date ? null : day,
        timeTo: timeToMins,
        timeFrom: timeFromMins,
        price,
        places,
        date: date ? getUTC(dayjs(date)).startOf("day") : null,
      },
      { new: true }
    );

    res.json(avaliable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


module.exports = router;