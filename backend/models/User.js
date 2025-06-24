const mongoose = require("mongoose");
const transactionSchema = require("./transactionSchema");

const userSchema = mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    username: {
      required: true,
      type: String,
    },
    phone: String,

    teachers: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: [] },
      ],
    },
    clients: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: [] },
      ],
    },
    apiKey: {
      type: String,
    },
    transactions: [transactionSchema],
    balance: {
      type: Number,
      default: 0,
    },
    refresh_token: String,
    apiKey: String,
    role: {
      type: String,
      default: 'user',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
