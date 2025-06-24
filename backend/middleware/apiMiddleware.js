const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).send("Не авторизован");
    }
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).send("Не авторизован");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("Не авторизован");
  }
};
