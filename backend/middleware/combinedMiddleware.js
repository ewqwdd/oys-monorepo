const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('Не авторизован');
    }
    let decoded = jwt.decode(token, process.env.JWT_TEACHER_SECRET);
    if (!decoded) {
        decoded = jwt.decode(token, process.env.JWT_USER_SECRET);
    }
    req.user = decoded;
    next();
    } catch (error) {
        console.log(error)
        return res.status(401).send('Не авторизован');
    }
}