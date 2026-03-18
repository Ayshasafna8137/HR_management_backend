const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  firstIn: {
    type: String
  },

  lastOut: {
    type: String
  },

  totalHours: {
    type: String
  },

  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Half Day"],
    default: "Present"
  },

  punch: {
    type: Boolean,
    default: false
  },

  todayActivity: [
    {
      time: {
        type: String,
        required: true
      },
      punch: {
        type: String,
        enum: ["Punched In", "Punched Out"],
        required: true
      }
    }
  ],

  shift: {
    type: String,
    enum: ["General", "Day Shift", "Night Shift"],
    default: "General"
  }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);