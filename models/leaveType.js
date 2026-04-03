const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
{
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  leaveName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true   // helps prevent Work From Home vs work from home
  },

  leaveType: {
    type: String,
    enum: ["Paid", "Unpaid"],
    required: true
  },

  leaveUnit: {
    type: String,
    enum: ["Days", "Hours"],
    required: true
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive"
  },

  note: String,

  duration: { type: Number, default: 0 },

  createdBy: {
    type: String,
    enum: ["Manager", "HR Department"],
    default: "HR Department"
  },

  notificationPeriod: String,

  annualLimit: { type: Number, default: 0 }

}, { timestamps: true });

/* Prevent duplicate leaveName per company */
leaveTypeSchema.index(
  { companyId: 1, leaveName: 1 },
  { unique: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);