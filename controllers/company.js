const CompanyModel = require("../models/Company");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");


// GET companies
exports.getCompany = asyncHandler(async (req, res) => {

  const companies = await CompanyModel
    .find({ isDelete: false })
    .populate("mainBranch")  //population
    .sort({ createdAt: -1 });

  res.status(200).json(companies);

});


// ADD company
exports.addCompany = asyncHandler(async (req, res) => {

  const { name, email, phone, website, logo, address, industry, mainBranch } = req.body;

  // name validation
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Company name is required" });
  }

  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  // check duplicate email
  const existingCompany = await CompanyModel.findOne({ email });
  if (existingCompany) {
    return res.status(400).json({ message: "Company with this email already exists" });
  }

  // phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Phone must be 10 digits" });
  }

  // website validation
  const websiteRegex = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\.-]*)*\/?$/;
  if (website && !websiteRegex.test(website)) {
    return res.status(400).json({ message: "Invalid website URL" });
  }

  // logo validation
  if (logo && typeof logo !== "string") {
    return res.status(400).json({ message: "Logo must be a string URL or filename" });
  }

  // address validation
  if (address && address.length < 5) {
    return res.status(400).json({ message: "Address must be at least 5 characters" });
  }

  // industry validation
  if (industry && industry.trim().length < 2) {
    return res.status(400).json({ message: "Industry must be at least 2 characters" });
  }

  // mainBranch validation
  if (mainBranch && !mongoose.Types.ObjectId.isValid(mainBranch)) {
    return res.status(400).json({ message: "Invalid mainBranch ID" });
  }

  const company = new CompanyModel({
    name,
    email,
    phone,
    website,
    logo,
    address,
    industry,
    mainBranch
  });

  const savedCompany = await company.save();

  res.status(201).json(savedCompany);

});


// UPDATE company
exports.updateCompany = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // id validation
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  const company = await CompanyModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  res.status(200).json(company);

});


// DELETE company (Soft Delete)
exports.deleteCompany = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // id validation
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid company ID" });
  }

  const company = await CompanyModel.findByIdAndUpdate(
    id,
    {
      isDelete: true,
      isActive: false
    },
    { new: true }
  );

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  res.status(200).json({
    message: "Company deleted successfully ",
    data: company
  });

});