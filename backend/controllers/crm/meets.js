const { default: mongoose } = require("mongoose");
const combinedMiddleware = require("../../middleware/combinedMiddleware");
const Teacher = require("../../models/Teacher");
const dayjs = require("dayjs");
const Meet = require("../../models/Meet");
const userMiddleware = require("../../middleware/userMiddleware");
const TeacherLink = require("../../models/TeacherLink");
const {
  sendMeetingDetailsTeacher,
  sendMeetingDetails,
} = require("../../lib/mailer");
const { generateLinkTeacher } = require("../../lib/generateLink");
const Avaliable = require("../../models/Avaliable");
const Client = require("../../models/Client");
const createMeet = require("../../services/createMeet");

const router = require("express").Router();

router.get("/meets", combinedMiddleware, async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { date } = req.query;

    let find = {};
    if (role === "user") {
      const teachers = await Teacher.find({
        user: new mongoose.Types.ObjectId(userId),
      });

      find = { tutor: { $in: teachers.map((e) => e._id) } };
    } else {
      find = { tutor: new mongoose.Types.ObjectId(userId) };
    }
    if (date) {
      find.date = {
        $gte: dayjs(date).startOf("day").toDate(),
        $lte: dayjs(date).endOf("day").toDate(),
      };
    }

    const meets = await Meet.find(find)
      .populate("tutor")
      .populate("plan")
      .populate({
        path: "clients",
        select: "-password -refresh_token", // Исключаем поля
      });

    res.json(meets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/meets/:meetId", userMiddleware, async (req, res) => {
  try {
    const { meetId } = req.params;

    const meet = await Meet.findById(meetId)
      .populate("tutor")
      .populate("plan")
      .populate({
        path: "clients",
        select: "-password -refresh_token",
      });

    if (!meet) {
      return res.status(404).json({ message: "Встреча не найдена" });
    }

    res.json(meet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/meets", userMiddleware, async (req, res) => {
  try {
    const { client: clientId, date, avaliable: avaliableId } = req.body;

    if (!clientId || !date || !avaliableId) {
      return res.status(400).json({ message: "Не все поля заполнены" });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Клиент не найден" });
    }

    const avaliable = await Avaliable.findById(avaliableId);

    if (!avaliable) {
      return res.status(404).json({ message: "Доступное время не найдено" });
    }

    const teacher = await Teacher.findOne({
      _id: avaliable.teacher,
      user: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!teacher) {
      return res.status(404).json({ message: "Преподаватель не найден" });
    }

    const day = new Date(date).getDay() - 1;

    if ((!avaliable.day || avaliable.day !== day) && (!avaliable.date || !dayjs(avaliable.date).isSame(date, "day"))) {
      return res.status(400).json({ message: "Неверный день недели" });
    }
    const meet = await createMeet(
      res,
      avaliableId,
      client,
      new Date(date),
      avaliable,
      req.user.id
    );

    if (!meet) return;

    // Обновление связанных записей
    client.meets.push(meet);
    teacher.meets.push(meet);

    await Promise.all([meet.save(), teacher.save(), client.save()]);
    await sendMeetingDetails(meet, avaliable, client.email);

    const teacherLink = generateLinkTeacher(meet._id, teacher.name);
    await TeacherLink.create({ meet: meet._id, link: teacherLink });

    await sendMeetingDetailsTeacher(meet, avaliable, teacher.email, teacherLink);
    res.json(meet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/meetLink/:id", combinedMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const data = await TeacherLink.findOne({
      meet: new mongoose.Types.ObjectId(id),
    });

    return res.json({ link: data?.link });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/meets/:meetId/clients/:id", userMiddleware, async (req, res) => {

  try {
    const { meetId, id } = req.params;
    const meet = await Meet.findById(meetId);
    const client = await Client.findById(id);
    if (!meet || !client) {
      return res.status(404).json({ message: "Зустріч або клієнт не знайдені" });
    }
    meet.clients = meet.clients.filter((c) => c.toString() !== id);
    client.meets = client.meets.filter((m) => m.toString() !== meetId);

    await Promise.all([meet.save(), client.save()]);
    res.json(meet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

module.exports = router;
