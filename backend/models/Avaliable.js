const mongoose = require("mongoose");

const avaliableSchema = mongoose.Schema(
  {
    timeFrom: {
      required: true,
      type: Number,
    },
    timeTo: {
      required: true,
      type: Number,
    },
    disabled: Boolean,
    day: {
      type: Number,
      required: false,
    },
    places: Number,
    price: Number,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      required: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Avaliable", avaliableSchema);
