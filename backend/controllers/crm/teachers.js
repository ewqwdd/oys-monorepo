
const express = require('express');
const userMiddleware = require('../../middleware/userMiddleware');
const Teacher = require('../../models/Teacher');
const { default: mongoose } = require('mongoose');
const combinedMiddleware = require('../../middleware/combinedMiddleware');
const { default: slugify } = require('slugify');
const User = require('../../models/User');
const path = require('path');
const fs = require('fs');
const { deleteImageFromS3, uploadImageToS3 } = require('../../lib/aws');
const multer = require('multer');
require('dotenv').config();

const router = express.Router()


const upload = multer({
    dest: path.join(__dirname, "../../public/temp"),
  });
  
  const scheduleFileDeletion = (filePath) => {
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Ошибка при удалении файла ${filePath}:`, err);
        } else {
          console.log(`Файл ${filePath} был успешно удалён.`);
        }
      });
    }, 24 * 60 * 60 * 1000); // 24 часа в миллисекундах
  };


  router.get("/teachers", userMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const user = await Teacher.find({ user: new mongoose.Types.ObjectId(id) })
        .populate("meets")
        .populate("avaliable")
        .sort({ order: -1, createdAt: -1 });
      res.json(user.teachers);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });
  
  router.get("/teachers/:_id", combinedMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { _id } = req.params;
      const user = await Teacher.find({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
      })
        .populate("meets")
        .populate("avaliable");
      res.json(user.teachers);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });
  
  router.post("/teachers", userMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { avaliable, ...data } = req.body;
  
      if (!data.slug) {
        data.slug = slugify(data.name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
          locale: "uk",
        });
      }
  
      const teacher = new Teacher({
        user: new mongoose.Types.ObjectId(id),
        ...data,
      });
  
      const avaliable_ = avaliable
        ? await Promise.all(
            avaliable?.map(async (elem) => {
              const a = new Avaliable({ ...elem, teacher: teacher._id });
              await a.save();
              return a;
            })
          )
        : [];
  
      teacher.avaliable = avaliable_.map(
        (elem) => new mongoose.Types.ObjectId(elem._id)
      );
      await teacher.save();
  
      await User.findByIdAndUpdate(id, { $push: { teachers: teacher._id } });
  
      res.json(teacher);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });
  
  router.post("/teachers/:_id", combinedMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { _id } = req.params;
  
      const query = {_id: new mongoose.Types.ObjectId(_id)}
      if (req.user.role === "teacher") {
        if (id !== _id) {
          return res.status(403).json({ message: "Нет доступа" });
        }
      } else {
        query.user = new mongoose.Types.ObjectId(id)
      }
  
      const teacher = await Teacher.findOne(query);
  
      if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
      }
  
      const { pictures, ...data } = req.body;
      const image = data.photo;
  
      if (image && image !== teacher.photo) {
        if (teacher.photo) {
          const key = teacher.photo.split("amazonaws.com/").pop();
          await deleteImageFromS3(key);
        }
  
        const filePath = path.join(__dirname, "../../public/temp", image);
        const location = await uploadImageToS3(filePath, image, "teachers");
        data.photo = location;
      }
  
      const imagesToDelete = teacher.pictures?.filter(
        (elem) => !pictures.find((e) => elem._id.toString() === e._id.toString())
      );
      await Promise.all(
        imagesToDelete.map(async (elem) => {
          const key = elem.url.split("amazonaws.com/").pop();
          await deleteImageFromS3(key);
        })
      );
  
      const promises = pictures.map(async (elem) => {
        const found = teacher.pictures?.find(
          (e) => e._id.toString() === elem._id.toString()
        );
        if (found?.url && found.url !== elem.url) {
          const key = found.url.split("amazonaws.com/").pop();
          await deleteImageFromS3(key);
        }
        if (elem.url && elem.url.includes("/public/temp")) {
          const fileName = elem.url.split("/").pop();
          const filePath = path.join(__dirname, "../../public/temp", fileName);
          const location = await uploadImageToS3(filePath, fileName, "teachers");
          delete elem._id;
          return {
            x: elem.x,
            x2: elem.x2,
            y: elem.y,
            y2: elem.y2,
            url: location,
          };
        }
        return elem;
      });
  
      data.pictures = await Promise.all(promises);
  
      if (!data.slug) {
        data.slug = slugify(data.name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
          locale: "uk",
        });
      }
  
      teacher.set(data);
      await teacher.save();
  
      res.json(teacher);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });
  
  router.delete("/teachers/:_id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { _id } = req.params;
      const teacher = await Teacher.findOne({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
      });
  
      if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
      }
  
      await Teacher.deleteOne({ _id: new mongoose.Types.ObjectId(_id) });
  
      res.json(teacher);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });
  
  router.post(
    "/teachers/image/:id",
    combinedMiddleware,
    upload.single("image"),
    async (req, res) => {
      try {
        const { id } = req.user;
        const { id: _id } = req.params;
  
        if (!req.file) {
          return res.status(400).send({ message: "Файл не был загружен" });
        }
  
        const fileExtension = path.extname(req.file.originalname);
  
        const newFileName = `${id}_${Date.now()}${fileExtension}`;
        const newFilePath = path.join(path.dirname(req.file.path), newFileName);
        scheduleFileDeletion(newFilePath);
  
        fs.rename(req.file.path, newFilePath, (err) => {
          if (err) {
            console.error("Ошибка при переименовании файла:", err);
            return res
              .status(500)
              .send({ message: "Ошибка сервера при обработке файла" });
          }
  
          res.status(200).send({
            message: "Файл успешно загружен",
            file: newFileName,
          });
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Ошибка сервера" });
      }
    }
  );

  router.post("/teachers/:_id/publish", userMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { _id } = req.params;
      const { published } = req.body;
  
      const teacher = await Teacher.findOne({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
      });
      if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
      }
      teacher.published = published;
      await teacher.save();
      res.json(teacher);
      
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });

  router.post("/teachers/:_id/sliderPublish", userMiddleware, async (req, res) => {
    try {
      const { id } = req.user;
      const { _id } = req.params;
      const { published } = req.body;
  
      const teacher = await Teacher.findOne({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
      });
      if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
      }
      teacher.sliderVisible = published;
      await teacher.save();
      res.json(teacher);
      
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Ошибка сервера" });
    }
  });

  router.post('/teachers/:_id/order', userMiddleware, async (req, res) => {
    try {
    const { id } = req.user;
    const { _id } = req.params;
    const { order } = req.body;

    const teacher = await Teacher.findOne({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
    });
    if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
    }

    teacher.order = order;
    await teacher.save();
    res.json(teacher);

    } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Ошибка сервера" });
    }
  }
  )

  router.post('/teachers/:_id/beginnerPublished', userMiddleware, async (req, res) => {
    try {
    const { id } = req.user;
    const { _id } = req.params;
    const { published } = req.body;

    const teacher = await Teacher.findOne({
        user: new mongoose.Types.ObjectId(id),
        _id: new mongoose.Types.ObjectId(_id),
    });
    if (!teacher) {
        return res.status(404).json({ message: "Преподаватель не найден" });
    }

    teacher.beginnerPublished = published;
    await teacher.save();
    res.json(teacher);

    } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Ошибка сервера" });
    }
  }
  )

module.exports = router