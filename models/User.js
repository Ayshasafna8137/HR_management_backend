const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company ID is required"]
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ""
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    default: null
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    default: "Employee"
  },
  department: {
    type: String,
    default: ""
  },
  designation: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  about: {
    type: String,
    default: ""
  },
  education: {
    type: String,
    default: ""
  },
  experience: {
    type: String,
    default: ""
  },
  skills: [{
    type: String
  }],
  dateOfBirth: {
    type: Date,
    default: null
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    default: null
  },
  lastPromotionDate: {
    type: Date,
    default: null
  },
  workLocation: {
    type: String,
    enum: ["Office", "Work from Home", "Hybrid"],
    default: "Office"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "On Leave"],
    default: "Active"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);