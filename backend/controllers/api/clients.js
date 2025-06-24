const Client = require("../../models/Client");
const User = require("../../models/User");


const router = require("express").Router();


router.get("/clients", async (req, res) => {
    try {
      const _id = req.user._id;
      const clients = await Client.find({ user: _id });
      res.json(clients);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  router.get("/clients/:id", async (req, res) => {
    try {
      const client = await Client.findById(req.params.id).populate("meets");
      res.json(client);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  router.get("/clients/email/:email", async (req, res) => {
    try {
      const client = await Client.findOne({ email: req.params.email });
      res.json(client);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка сервера");
    }
  });
  
  router.post("/clients", async (req, res) => {
    try {
      const { name, phone, email } = req.body;
      const userId = req.user._id;
      const user = await User.findById(userId);
      const _id = req.user._id;
      const client = new Client({ name, phone, email, user: _id });
      user.clients.push(client);
      await Promise.all[(client.save(), user.save())];
      res.json(client);
    } catch (error) {
      console.log(error);
      res.status(500).send("Ошибка сервера");
    }
  });

  module.exports = router;