const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
{
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  firstIn: {
    type: String,
    required: true
  },

  lastOut: {
    type: String,
    default: null
  },

  totalHours: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Half Day"],
    default: "Present"
  },

  shift: {
    type: String,
    default: "General"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);