const dayjs = require("dayjs");
const Teacher = require("../../models/Teacher");
const { default: mongoose } = require("mongoose");
const Avaliable = require("../../models/Avaliable");
const Meet = require("../../models/Meet");


const router = require("express").Router();


router.get("/avaliable", async (req, res) => {
    try {
      const { teacherId, date } = req.query;
      const userId = req.user._id;
  
      const find = {
        disabled: { $ne: true },
      };
  
      if (date) {
        const day = dayjs(date).day() - 1;
        find.day = day;
      }
  
      if (teacherId) {
        find.teacher = new mongoose.Types.ObjectId(teacherId);
      }
      const teachers = await Teacher.find(
        { user: new mongoose.Types.ObjectId(userId) },
        "_id"
      );
      find.teacher = { $in: teachers.map((t) => t._id) };
  
      const avaliables = await Avaliable.find(find);
  
      res.json(avaliables);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
  router.get("/avaliable/:id", async (req, res) => {
    try {
      const avaliable = await Avaliable.findById(req.params.id).populate("teacher");
      res.json(avaliable);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
  router.get("/avaliableMonth", async (req, res) => {
    try {
      const { teacherId, month, places } = req.query;
  
      if (!teacherId || !month) {
        return res
          .status(400)
          .json({ message: "Необходимо указать teacherId и month." });
      }
  
      const monthStart = dayjs().add(2, 'hour');
      const monthEnd = dayjs().set("month", month).endOf("month")

      const filter = { 
        teacher: teacherId, 
        $or: [
          { date: { $exists: false } }, 
          {date: { $eq: null }},
          { date: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() } }
        ] 
      };
  
      if (places && places == 1) {
        filter.places = {$eq: 1};
      } else if (places && Number(places) > 1) {
        filter.places = { $gt: 1 };
      }
  
      // Найти все Avaliable для указанного teacherId
      const foundAvaliables = await Avaliable.find(filter);
  
      // Найти все Meet, которые соответствуют диапазону дат
      const meets = await Meet.find({
        tutor: new mongoose.Types.ObjectId(teacherId),
        date: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
      });
  
  
      // Сгруппировать встречи по плану (avaliable)
      const meetsByPlan = meets.reduce((acc, meet) => {
        const key = meet.plan.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(meet);
        return acc;
      }, {});
  
      // Добавить встречи к каждой доступности
      const result = foundAvaliables.map((avaliable) => ({
        ...avaliable.toObject(),
        meets: meetsByPlan[avaliable._id.toString()] || [],
      }));
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  module.exports = router;