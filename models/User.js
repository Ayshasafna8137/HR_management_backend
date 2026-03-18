const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
  firstName: {
    type: String,
    required: true,
    trim: true
  },

  lastName: {
    type: String,
    trim: true
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "Employee"
  },

  department: String,
  designation: String,

  address: String,

  about: String,

  education: String,

  experience: String,

  skills: [
    {
      type: String
    }
  ],

  dateOfBirth: Date,

  joiningDate: Date,

  salary: Number,

  workLocation: {
    type: String,
    enum: ["Office", "Work from Home"]
  },

  status: {
    type: String,
    enum: ["Active", "Inactive", "On Leave"],
    default: "Active"
  },

  // image: String,

  isActive: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);