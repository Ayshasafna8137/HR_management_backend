const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    
    
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    website: {
      type: String,
      trim: true,
      default: ""
    },

    logo: {
      type: String,
      default: ""
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      zipCode: { type: String, default: "" }
    },

    industry: {
      type: String,
      default: ""
    },
    
    // This is for multi-branch companies - parent company reference (optional)
    mainBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
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

// Remove the companyId field if it exists (safety check)
if (companySchema.path('companyId')) {
  companySchema.remove('companyId');
}

module.exports = mongoose.model("Company", companySchema);