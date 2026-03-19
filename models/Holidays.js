const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema(
{
  holidayName: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  location: {
    type: String
  },

  shift: {
    type: String,
    enum: ["All Shifts", "Day Shifts", "Night Shifts"],
    default: "All Shifts"
  },

  details: {
    type: String
  },

  holidayType: {
    type: String,
    enum: ["National", "Religious", "Cultural", "Awareness", "Environmental", "Health"]
  },

  createdBy: {
    type: String
  },

  creationDate: {
    type: Date,
    default: Date.now
  },

  approvalStatus: {
    type: String,
    enum: ["Approved", "Rejected", "Pending"],
    default: "Approved"
  },

  isActive: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Holiday", HolidaySchema);