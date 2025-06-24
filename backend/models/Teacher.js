const mongoose = require("mongoose");
const transactionSchema = require("./transactionSchema");

const picturesSchema = new mongoose.Schema({
  url: String,
  x: Number,
  y: Number,
  x2: Number,
  y2: Number,
});

const TeacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meet", default: [] }],
    avaliable: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Avaliable", default: [] },
    ],
    name: String,
    phone: String,
    password: String,
    email: String,
    photo: String,
    description: String,
    balance: {
      type: Number,
      default: 0,
    },
    pictures: [picturesSchema],
    transactions: [transactionSchema],
    refresh_token: String,
    zoom_id: String,
    slug: String,
    city: String,
    about: String,
    instagram: String,
    exp: String,
    type: [String],
    published: {
      type: Boolean,
      default: false,
    },
    lvl: {
      type: [String],
      default: [],
    },
    individual_schedule: String,
    group_schedule: String,
    role: {
      type: String,
      default: 'teacher',
    },
    format: [String],
    sliderVisible: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 99,
    },
    beginnerPublished: {
      type: Boolean,
      default: false,
    },
    merchantAccount: {
      type: String,
      },
    merchantSecret: {
      type: String,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", TeacherSchema);
