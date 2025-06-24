const { default: mongoose } = require("mongoose");

const teacherLinkSchema = mongoose.Schema(
  {
    meet: { type: mongoose.Schema.Types.ObjectId, ref: "Meet" },
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeacherLink", teacherLinkSchema);
