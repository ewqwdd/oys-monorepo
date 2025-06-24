const transactionSchema = require("./transactionSchema");
const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    meets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meet", default: [] }],
    name: String,
    phone: String,
    password: String,
    email: String,
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
