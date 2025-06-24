const { default: mongoose } = require("mongoose");

const photoSchema = mongoose.Schema(
  {
    url: String,
    key: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
