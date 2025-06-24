const mongoose = require("mongoose");

const meetSchema = mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avaliable",
      required: true,
    },
    clients: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: [] },
    ],
    date: Date,
    url: String,
    code: String,
    meetingId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meet", meetSchema);
