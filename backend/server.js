const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const apiController = require("./controllers/apiController.js");
const crmController = require("./controllers/crmController.js");

const cors = require("cors");
const {
  getPhoto,
} = require("./lib/aws.js");
const { getPhotos, setPhotos } = require("./lib/photos.js");
const Photo = require("./models/Photo.js");


require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to database");
    Photo.find().then((photos) => {
      setPhotos(photos);
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

app.use(bodyParser.json());
app.use("/public", express.static("public"));

app.use("/crm", crmController);
app.use("/api", apiController);

app.get("/hero-image", async (req, res) => {
  try {
    const images = getPhotos();
    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${randomImage.key}"`
    );
    const body = await getPhoto(randomImage.key);
    if (!body) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    res.send(body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
