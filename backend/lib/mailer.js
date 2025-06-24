const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const { createEvent } = require("ics");
const MinutesToTime = require("../services/MinutesToTime");
require("dotenv").config();

const mailer = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

const sendMeetingDetails = async (meeting, plan, to) => {
  const date = dayjs(meeting.date);
  const { timeFrom, timeTo } = plan;

  // Генерация ICS-файла
  const event = {
    start: [
      date.year(),
      date.month() + 1,
      date.date(),
      Math.floor(timeFrom / 60),
      timeFrom % 60,
    ],
    end: [
      date.year(),
      date.month() + 1,
      date.date(),
      Math.floor(timeTo / 60),
      timeTo % 60,
    ],
    title: `Зустріч ${date.format("DD.MM.YYYY")}`,
    description: ``,
    location: "Online Yoga Service",
    url: meeting.url,
    status: "CONFIRMED",
    organizer: {
      name: "Organizer Name",
      email: process.env.GOOGLE_EMAIL,
    },
  };

  createEvent(event, (error, value) => {
    if (error) {
      console.log(error);
      return;
    }

    mailer.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to,
      subject: `Зустріч ${date.format("DD.MM.YYYY")} ${MinutesToTime(
        timeFrom
      )}-${MinutesToTime(timeTo)}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;text-align: center;">
      <h2 style="max-width:560px;margin:30px auto;">Вітаємо! Дякуємо, що користуєтеся нашим сервісом! Ви успішно забронювали онлайн-практику. Будемо раді бачити вас!
Заняття проходить у зазначені дату та час в онлайн-форматі за посиланням нижче. </h2>
      <p><b>Дата:</b> ${date.format("DD.MM.YYYY")} ${MinutesToTime(
        timeFrom
      )} до ${MinutesToTime(timeTo)}</p>
      <a href="${meeting.url}">Доєдантись до практики</a>
      </div>`,
      attachments: [
        {
          filename: "meeting.ics",
          content: value,
        },
      ],
    });
  });
};

const sendMeetingDetailsTeacher = async (meeting, plan, to, url) => {
  const date = dayjs(meeting.date);
  const { timeFrom, timeTo } = plan;
  console.log(to);

  // Генерация ICS-файла
  const event = {
    start: [
      date.year(),
      date.month() + 1,
      date.date(),
      Math.floor(timeFrom / 60) - 2,
      timeFrom % 60,
    ],
    end: [
      date.year(),
      date.month() + 1,
      date.date(),
      Math.floor(timeTo / 60) - 2,
      timeTo % 60,
    ],
    title: `У вас новий запис на ${date.format("DD.MM.YYYY")}`,
    description: ``,
    location: "Online Yoga Service",
    url,
    status: "CONFIRMED",
    organizer: {
      name: "Organizer Name",
      email: process.env.GOOGLE_EMAIL,
    },
  };

  createEvent(event, (error, value) => {
    if (error) {
      console.log(error);
      return;
    }

    mailer.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to,
      subject: `У вас новий запис на ${date.format(
        "DD.MM.YYYY"
      )} ${MinutesToTime(timeFrom)}-${MinutesToTime(timeTo)}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;text-align: center;">
      <h1>від ${MinutesToTime(timeFrom)} до ${MinutesToTime(timeTo)}</h1>
      <p><b>Дата:</b> ${date.format("DD.MM.YYYY")}</p>
      <a href="${url}">Відкрити трансляцію</a>
      </div>`,
      attachments: [
        {
          filename: "meeting.ics",
          content: value,
        },
      ],
    });
  });
};

module.exports = { mailer, sendMeetingDetails, sendMeetingDetailsTeacher };
