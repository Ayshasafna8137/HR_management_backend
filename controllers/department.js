const Department = require("../models/Department");
const Company = require("../models/Company");
const asyncHandler = require("express-async-handler");


// CREATE DEPARTMENT
exports.createDepartment = asyncHandler(async (req, res) => {

  let {
    companyId,
    departmentName,
    headOfDepartment,
    phone,
    email,
    establishedYear,
    employeeCapacity,
    totalEmployees
  } = req.body;


  // TRIM STRING VALUES
  departmentName = departmentName?.trim();
  headOfDepartment = headOfDepartment?.trim();
  phone = phone?.trim();
  email = email?.trim();


  /* REQUIRED VALIDATION */

  if (
    !companyId ||
    !departmentName ||
    !headOfDepartment ||
    !phone ||
    !email ||
    !establishedYear ||
    !employeeCapacity ||
    !totalEmployees
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }


  /* COMPANY EXISTS */

  const company = await Company.findById(companyId);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found"
    });
  }


  /* PHONE VALIDATION */

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits"
    });
  }


  /* EMAIL VALIDATION */

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }


  /* DUPLICATE DEPARTMENT CHECK */

  const duplicate = await Department.findOne({
    companyId,
    departmentName,
    isActive: true
  });

  if (duplicate) {
    return res.status(400).json({
      success: false,
      message: "Department already exists for this company"
    });
  }


  const department = new Department({
    companyId,
    departmentName,
    headOfDepartment,
    phone,
    email,
    establishedYear,
    employeeCapacity,
    totalEmployees
  });

  const savedDepartment = await department.save();

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: savedDepartment
  });

});


// GET ALL DEPARTMENTS
exports.getDepartments = asyncHandler(async (req, res) => {

  const departments = await Department.find({ isActive: true })
    .populate("companyId", "name")
    .sort({ createdAt: -1 });

  const formatted = departments.map(dep => ({
    _id: dep._id,
    departmentName: dep.departmentName?.trim(),
    headOfDepartment: dep.headOfDepartment?.trim(),
    phone: dep.phone?.trim(),
    email: dep.email?.trim(),
    employeeCapacity: dep.employeeCapacity,
    establishedYear: dep.establishedYear,
    totalEmployees: dep.totalEmployees
  }));

  res.status(200).json({
    success: true,
    data: formatted
  });

});


// GET DEPARTMENT BY ID
exports.getDepartmentById = asyncHandler(async (req, res) => {

  const department = await Department.findById(req.params.id)
    .populate("companyId", "name");

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found"
    });
  }

  const formattedDepartment = {
    _id: department._id,
    departmentName: department.departmentName?.trim(),
    headOfDepartment: department.headOfDepartment?.trim(),
    phone: department.phone?.trim(),
    email: department.email?.trim(),
    employeeCapacity: department.employeeCapacity,
    establishedYear: department.establishedYear,
    totalEmployees: department.totalEmployees
  };

  res.status(200).json({
    success: true,
    data: formattedDepartment
  });

});


// GET DEPARTMENTS BY COMPANY
exports.getDepartmentsByCompany = asyncHandler(async (req, res) => {

  const departments = await Department.find({
    companyId: req.params.companyId,
    isActive: true
  })
  .populate("companyId", "name email")
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: departments
  });

});


// UPDATE DEPARTMENT
exports.updateDepartment = asyncHandler(async (req, res) => {

  let { companyId, departmentName } = req.body;

  if (departmentName) departmentName = departmentName.trim();

  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found"
    });
  }


  /* PREVENT DUPLICATE NAME */

  if (departmentName) {

    const duplicate = await Department.findOne({
      companyId: companyId || department.companyId,
      departmentName,
      _id: { $ne: req.params.id },
      isActive: true
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Department already exists for this company"
      });
    }

    req.body.departmentName = departmentName;
  }


  const updatedDepartment = await Department.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("companyId", "name email");


  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: updatedDepartment
  });

});


// DELETE DEPARTMENT
exports.deleteDepartment = asyncHandler(async (req, res) => {

  const department = await Department.findById(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: "Department not found"
    });
  }

  department.isActive = false;

  await department.save();

  res.status(200).json({
    success: true,
    message: "Department deleted successfully"
  });

});