const mongoose = require("mongoose");

const departmentHeadSchema = new mongoose.Schema(
{
  companyId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Company",
    required:true
  },

  departmentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Department",
    required:true
  },

  name:{
    type:String,
    required:true,
    trim:true
  },

  designation:{
    type:String,
    required:true
  },

  phone:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true
  },

  joiningDate:{
    type:Date,
    required:true
  },

  isActive:{
    type:Boolean,
    default:true
  }

},
{timestamps:true}
);

module.exports = mongoose.model("DepartmentHead",departmentHeadSchema);