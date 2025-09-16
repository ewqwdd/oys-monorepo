const dayjs = require("dayjs");
const getUTC = require("../../lib/getUtc");
const Avaliable = require("../../models/Avaliable");
const Client = require("../../models/Client");
const Meet = require("../../models/Meet");
const { default: mongoose } = require("mongoose");
const { sendMeetingDetails, sendMeetingDetailsTeacher } = require("../../lib/mailer");
const Teacher = require("../../models/Teacher");
const { generateLinkTeacher, generateLink } = require("../../lib/generateLink");
const TeacherLink = require("../../models/TeacherLink");


const router = require("express").Router();



router.post("/meets", async (req, res) => {
    try {
      const { clientId, plan, date, uuid } = req.body;
      const userId = req.user._id;
  
      const dateUTC = getUTC(dayjs(date)).startOf("day");
      // Проверка доступности
      const planExists = await Avaliable.findById(plan);
      if (!planExists) {
        return res.status(400).send("Плана не існує");
      }
  
      // Проверка клиента
      const client = await Client.findOne({ _id: clientId, user: userId });
      if (!client) {
        return res.status(400).send("Клієнта не існує");
      }
  
      // Проверка существующей встречи
      const existingMeet = await Meet.findOne({
        plan: new mongoose.Types.ObjectId(plan),
        date: dateUTC.toDate(),
      }).populate("plan");
      if (existingMeet) {
        const isClientInMeet = existingMeet.clients.includes(client._id);
        const isMeetFull =
          existingMeet.plan.places <= existingMeet.clients.length;
  
        if (isClientInMeet) {
          return res.status(400).send("Встреча уже существует");
        } else if (isMeetFull) {
          return res.status(400).send("Зустріч заповнена");
        }
  
        // Добавляем клиента к существующей встрече
        existingMeet.clients.push(client._id);
        await existingMeet.save();
        await sendMeetingDetails(existingMeet, planExists, client.email);
        return res.json(existingMeet);
      }
      // Проверка соответствия дня недели
      let day = dateUTC.day() - 1;
      if (day === -1) {
        day = 6;
      }

      console.log(day, planExists.day, planExists.date, dateUTC)
  
      if ((!planExists.day || day !== planExists.day) && (!planExists.date || !dateUTC.isSame(planExists.date, "day"))) {
        return res.status(400).send("Не вірний день");
      }
  
      // Проверка преподавателя
      const teacher = await Teacher.findOne({
        user: userId,
        _id: planExists.teacher,
      });
      if (!teacher) {
        return res.status(400).send("Вчитель не знайден");
      }
  
      const timezoneUkraine = "Europe/Kyiv";
  
      // Создание новой встречи
      const newMeet = new Meet({
        tutor: teacher._id,
        plan: new mongoose.Types.ObjectId(plan),
        date: dateUTC.toDate(),
        clients: [client._id],
      });
  
      const teacherUrl = generateLinkTeacher(newMeet._id, teacher.name)
      await TeacherLink.create({ meet: newMeet._id, link: teacherUrl });
      const url = generateLink(newMeet._id);
      newMeet.url = url;
  
      // Обновление связанных записей
      client.meets.push(newMeet);
      teacher.meets.push(newMeet);
      if (uuid) {
        const index = client.transactions.findIndex((t) => t.uuid === uuid);
        if (index !== -1) {
          client.transactions[index].meet = newMeet._id;
          client.transactions[index].success = true;
        }
      }
      teacher.balance += planExists.price;
  
      await Promise.all([newMeet.save(), teacher.save(), client.save()]);
      await sendMeetingDetails(newMeet, planExists, client.email);
      await sendMeetingDetailsTeacher(newMeet, planExists, teacher.email, teacherUrl);
      res.json(newMeet);
    } catch (error) {
      console.error("Ошибка создания встречи:", error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  router.get("/meetByDate", async (req, res) => {
    try {
      const { date, avaliable } = req.query;
  
      if (!date || !avaliable) {
        return res.status(400).send("Необходимо указать date и avaliable");
      }
  
      const dateUTC = getUTC(dayjs(date)).startOf("day");
      const meet = await Meet.findOne({
        date: dateUTC.toDate(),
        plan: avaliable,
      });
  
      res.json(meet);
    } catch (error) {
      console.error(error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  router.get("/meets/:id", async (req, res) => {
    try {
      const meet = await Meet.findById(req.params.id).populate('tutor');
      res.json(meet);
    } catch (error) {
      console.error(error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  module.exports = router;