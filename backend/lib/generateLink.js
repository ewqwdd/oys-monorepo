require("dotenv").config();
const jwt = require("jsonwebtoken");

const { APP_ID, APP_SECRET, JITSI_DOMAIN, JITSI_URL } = process.env;

const generateLinkTeacher = (room, name) => {
  const token = jwt.sign(
    {
      aud: "jitsi",
      iss: APP_ID,
      sub: JITSI_DOMAIN,
      room: room,
      exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30, // 1 час
      context: {
        user: {
          name,
        },
      },
    },
    APP_SECRET,
    { algorithm: "HS256" }
  );
  return `${JITSI_URL}/${room}?jwt=${token}`;
};

const generateLink = (room) => {
  return `${JITSI_URL}/${room}`;
};

module.exports = {
  generateLinkTeacher,
  generateLink,
};
