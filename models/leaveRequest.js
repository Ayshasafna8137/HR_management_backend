const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({

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

  leaveType: {
    type: String,
    enum: ["Emergency", "Family", "Sick", "Casual"],
    required: true
  },

  leaveFrom: {
    type: Date,
    required: true
  },

  leaveTo: {
    type: Date,
    required: true
  },

  noOfDays: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  manageId :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  manageRole: {
  type: String,
  enum: ["HR", "Manager", "Admin"]
},

  reason: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);