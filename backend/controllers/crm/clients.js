const { default: mongoose } = require("mongoose");
const userMiddleware = require("../../middleware/userMiddleware");
const Client = require("../../models/Client");
const User = require("../../models/User");


const router = require("express").Router();


router.post("/clients", userMiddleware, async (req, res) => {
    try {
      const { name, phone, email } = req.body;
  
      if (!name || !phone || !email) {
        return res.status(400).json({ message: "Не всі поля заповнені" });
      }
  
      const user = await User.findById(req.user.id);
  
      const client = new Client({
        user: new mongoose.Types.ObjectId(req.user.id),
        name,
        phone,
        email,
      });
      user.clients.push(client);
  
      await Promise.all([client.save(), user.save()]);
  
      res.json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Помилка сервера" });
    }
  });
  
  router.put("/clients/:_id", userMiddleware, async (req, res) => {
    try {
      const { _id } = req.params;
      const { name, phone, email } = req.body;
  
      const client = await Client.findOne({
        _id: new mongoose.Types.ObjectId(_id),
        user: new mongoose.Types.ObjectId(req.user.id),
      });
  
      if (!client) {
        return res.status(404).json({ message: "Клієнт не знайдений" });
      }
  
      client.set({ name, phone, email });
      await client.save();
  
      res.json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Помилка сервера" });
    }
  });
  
  router.delete("/clients/:_id", userMiddleware, async (req, res) => {
    try {
      const { _id } = req.params;
  
      const client = await Client.findOne({
        _id: new mongoose.Types.ObjectId(_id),
        user: new mongoose.Types.ObjectId(req.user.id),
      });
      const user = await User.findById(req.user.id);
  
      if (!client) {
        return res.status(404).json({ message: "Клієнт не знайдений" });
      }
  
      user.clients = user.clients.filter(
        (elem) => elem.toString() !== client._id.toString()
      );
  
      await Promise.all([
        Client.deleteOne({ _id: new mongoose.Types.ObjectId(_id) }),
        user.save(),
      ]);
  
      res.json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Помилка сервера" });
    }
  });

  router.delete('/clients', userMiddleware, async (req, res) => {
    try {
      const { ids } = req.body;
      await Client.deleteMany({
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
        user: new mongoose.Types.ObjectId(req.user.id),
      });
      res.json({ message: 'Клієнти видалені' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Помилка сервера' });
    }
  });


  module.exports = router;