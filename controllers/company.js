const CompanyModel = require("../models/Company");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// CREATE COMPANY
exports.createCompany = asyncHandler(async (req, res) => {
  console.log("=== CREATE COMPANY ===");
  console.log("Request body:", req.body);

  const {
    name,
    email,
    phone,
    website,
    logo,
    address,
    industry,
    mainBranch
  } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Company name is required"
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Company email is required"
    });
  }

  // Check if company already exists
  const existingCompany = await CompanyModel.findOne({ 
    email: email.toLowerCase(),
    isDelete: false 
  });
  
  if (existingCompany) {
    return res.status(400).json({
      success: false,
      message: "Company with this email already exists"
    });
  }

  // Create company data
  const companyData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || "",
    website: website || "",
    logo: logo || "",
    address: address || {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    industry: industry || "",
    mainBranch: mainBranch || null,
    isActive: true,
    isDelete: false
  };

  try {
    const company = new CompanyModel(companyData);
    const savedCompany = await company.save();

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: savedCompany
    });
  } catch (error) {
    console.error("Error creating company:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }
    
    throw error;
  }
});

// GET ALL COMPANIES
exports.getCompanies = asyncHandler(async (req, res) => {
  const companies = await CompanyModel.find({ isDelete: false, isActive: true })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

// GET COMPANY BY ID
exports.getCompanyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID format"
    });
  }

  const company = await CompanyModel.findById(id);

  if (!company || company.isDelete) {
    return res.status(404).json({
      success: false,
      message: "Company not found"
    });
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// UPDATE COMPANY
exports.updateCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID format"
    });
  }

  const company = await CompanyModel.findById(id);

  if (!company || company.isDelete) {
    return res.status(404).json({
      success: false,
      message: "Company not found"
    });
  }

  const updateData = { ...req.body };
  delete updateData.companyId; // Remove if exists

  // If updating email, check uniqueness
  if (updateData.email && updateData.email !== company.email) {
    const emailExists = await CompanyModel.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: id },
      isDelete: false
    });
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    updateData.email = updateData.email.toLowerCase();
  }

  const updatedCompany = await CompanyModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Company updated successfully",
    data: updatedCompany
  });
});

// DELETE COMPANY
exports.deleteCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID format"
    });
  }

  const company = await CompanyModel.findById(id);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found"
    });
  }

  company.isDelete = true;
  company.isActive = false;
  await company.save();

  res.status(200).json({
    success: true,
    message: "Company deleted successfully"
  });
});