const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {

        // companyId : {
        //     type : mongoose.Schema.Types.ObjectId,
        //     ref:"Company",
        // },
    
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String
    },

    website: {
      type: String
    },

    logo: {
      type: String
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },

    industry: {
      type: String
    },
    
    mainBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },

  isDelete: {
  type: Boolean,
  default: false
},

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);