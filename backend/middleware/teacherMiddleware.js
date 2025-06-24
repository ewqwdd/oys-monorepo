require('dotenv').config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('Не авторизован');
    }
    const decoded = jwt.verify(token, process.env.JWT_TEACHER_SECRET);
    req.user = decoded;
    next();
    } catch (error) {
        console.log(error)
        res.status(401).send('Не авторизован');
    }
}