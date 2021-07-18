const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  fullname: String,
  school: String,
  program: String,
  branch: String,
  year: String,
  semester: String,
  consentStatus: { type: Boolean, default: false },
});

module.exports = mongoose.model("Student", StudentSchema);
