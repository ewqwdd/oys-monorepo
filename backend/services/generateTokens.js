const jwt = require("jsonwebtoken");

const defineAccessSecret = (role) => {
  if (role === "user") {
    return process.env.JWT_USER_SECRET;
  } else if (role === "teacher") {
    return process.env.JWT_TEACHER_SECRET;
  }
};

const defineRefreshSecret = (role) => {
  if (role === "user") {
    return process.env.JWT_REFRESH_USER_SECRET;
  } else if (role === "teacher") {
    return process.env.JWT_REFRESH_TEACHER_SECRET;
  }
};

const generateAccessToken = (user, role) => {
  return jwt.sign({ id: user._id, email: user.email, role }, defineAccessSecret(role), { expiresIn: "15m" });
};

const generateRefreshToken = (user, role) => {
  return jwt.sign({ id: user._id, email: user.email, role }, defineRefreshSecret(role), { expiresIn: "1h" });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  defineAccessSecret,
  defineRefreshSecret,
};
