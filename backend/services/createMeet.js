const Meet = require("../models/Meet");
const Teacher = require("../models/Teacher");
const generator = require("generate-password");
const dayjs = require("dayjs");
require("dotenv").config();
const mongoose = require("mongoose");
const { sendMeetingDetails } = require("../lib/mailer");
const { generateLink } = require("../lib/generateLink");

/**
 * Создает встречу или добавляет клиента к существующей.
 *
 * @param {Object} res - Объект ответа Express.js.
 * @param {string} plan - Идентификатор плана.
 * @param {Object} client - Объект клиента, включая _id, email, и name.
 * @param {Date} date - Дата встречи.
 * @param {Object} planExists - Объект существующего плана с полями day, timeFrom, и teacher.
 * @returns {Promise<Object>} Возвращает объект встречи или HTTP-ответ с ошибкой.
 */
const createMeet = async (res, plan, client, date, planExists, userId) => {
  // Проверка существующей встречи
  const existingMeet = await Meet.findOne({
    plan: new mongoose.Types.ObjectId(plan),
    date,
  }).populate("plan");
  if (existingMeet) {
    const isClientInMeet = existingMeet.clients.includes(client._id);
    const isMeetFull = existingMeet.plan.places <= existingMeet.clients.length;

    if (isClientInMeet) {
      res.status(400).json({message: "Встреча уже существует"});
      return false;
    } else if (isMeetFull) {
      res.status(400).json({message: "Зустріч заповнена"});
      return false;
    }
    // Добавляем клиента к существующей встрече
    existingMeet.clients.push(client);
    console.log("existingMeet", existingMeet);
    return existingMeet;
  }
  // Проверка соответствия дня недели
  let day = date.getDay() - 1;

  if (day !== planExists.day) {
    res.status(400).json({message: "Не вірний день"});
    return false;
  }

  // Проверка преподавателя
  const teacher = await Teacher.findOne({
    user: userId,
    _id: planExists.teacher,
  });
  if (!teacher) {
    res.status(400).json({message: "Вчитель не знайден"});
    return false;
  }

  // Создание новой встречи
  const newMeet = new Meet({
    tutor: teacher._id,
    plan: new mongoose.Types.ObjectId(plan),
    date: date,
    clients: [client._id],
  });
  newMeet.url = generateLink(newMeet._id)
  return newMeet;
};

module.exports = createMeet;
