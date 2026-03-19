const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
{
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  departmentName: {
    type: String,
    required: true
  },

  headOfDepartment: String,

  phone: String,

  email: String,

  establishedYear: Number,

  employeeCapacity: Number,

  totalEmployees: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);