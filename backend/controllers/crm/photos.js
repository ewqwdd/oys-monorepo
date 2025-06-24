const path = require("path");
const userMiddleware = require("../../middleware/userMiddleware");
const fs = require("fs");
const { deleteImageFromS3, uploadImageToS3 } = require("../../lib/aws");
const Photo = require("../../models/Photo");
const { setPhotos, getPhotos } = require("../../lib/photos");
const multer = require("multer");

const router = require("express").Router();

const upload = multer({
    dest: path.join(__dirname, "../../public/temp"),
  });

router.get("/photos", userMiddleware, async (req, res) => {

    try {
        const photos = getPhotos();
    
        res.json(photos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
    }
);

router.delete("/photos", userMiddleware, async (req, res) => {
    try {
      const { key } = req.body;
      await deleteImageFromS3(key);
      await Photo.deleteOne({ key })
      setPhotos(getPhotos().filter((photo) => photo.key !== key));
      res.json({ message: "Image deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/photos", userMiddleware, upload.single("image"), async (req, res) => {
    try {
      const { file } = req;
      const fileName = `${Date.now()}-${file.originalname}`;
      const folderName = "hero";
      console.log(file);
      const url = await uploadImageToS3(file.path, fileName, folderName);
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error deleting file ${file.path}:`, err);
          return;
        }
        console.log(`File ${file.path} deleted`);
      });
      const photo = new Photo({
        key: `${folderName}/${fileName.split(".")[0]}.webp`,
        url,
      });
      await photo.save();
      const photos = getPhotos();
      setPhotos([...photos, photo]);
      res.json({ url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;