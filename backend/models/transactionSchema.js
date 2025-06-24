const { default: mongoose } = require("mongoose");

module.exports = mongoose.Schema(
  {
    date: {
      required: true,
      type: Date,
    },
    amount: {
      required: true,
      type: Number,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meet: { type: mongoose.Schema.Types.ObjectId, ref: "Meet" },
    avaliable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avaliable",
      required: true,
    },
    uuid: {
      required: true,
      type: String,
    },
    success: {
      default: false,
      type: Boolean,
    },
  },
  { timestamps: true }
);
