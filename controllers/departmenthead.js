const DepartmentHead = require("../models/DepartmentHead");
const Department = require("../models/Department");
const asyncHandler = require("express-async-handler");



/* CREATE DEPARTMENT HEAD */

exports.createDepartmentHead = asyncHandler(async (req, res) => {

 let {
  companyId,
  departmentId,
  name,
  designation,
  phone,
  email,
  joiningDate
 } = req.body;


 // TRIM VALUES
 name = name?.trim();
 designation = designation?.trim();
 phone = phone?.trim();
 email = email?.trim();


 // EMPTY VALIDATION (after trim)
 if (!name || !departmentId || !designation || !phone || !email || !joiningDate) {
  return res.status(400).json({
   success: false,
   message: "All fields are required"
  });
 }


 // PHONE VALIDATION
 const phoneRegex = /^[0-9]{10}$/;

 if (!phoneRegex.test(phone)) {
  return res.status(400).json({
   success: false,
   message: "Phone must be exactly 10 digits"
  });
 }


 // EMAIL VALIDATION
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

 if (!emailRegex.test(email)) {
  return res.status(400).json({
   success: false,
   message: "Invalid email format"
  });
 }


 // CHECK DEPARTMENT EXISTS
 const department = await Department.findById(departmentId);

 if (!department) {
  return res.status(404).json({
   success: false,
   message: "Department not found"
  });
 }


 const departmentHead = new DepartmentHead({
  companyId,
  departmentId,
  name,
  designation,
  phone,
  email,
  joiningDate
 });


 const savedHead = await departmentHead.save();


 res.status(201).json({
  success: true,
  message: "Department head created successfully",
  data: savedHead
 });

});



/* GET ALL DEPARTMENT HEADS */

exports.getDepartmentHeads = asyncHandler(async (req, res) => {

 const heads = await DepartmentHead.find({ isActive: true })
  .populate("departmentId", "departmentName")
  .sort({ createdAt: -1 });


 const formatted = heads.map(head => ({
  _id: head._id,
  name: head.name,
  department: head.departmentId?.departmentName,
  designation: head.designation,
  phone: head.phone,
  email: head.email,
  joiningDate: head.joiningDate
 }));


 res.status(200).json({
  success: true,
  data: formatted
 });

});



/* GET BY ID */

exports.getDepartmentHeadById = asyncHandler(async (req, res) => {

 const head = await DepartmentHead.findById(req.params.id)
  .populate("departmentId", "departmentName");


 if (!head) {
  return res.status(404).json({
   success: false,
   message: "Department head not found"
  });
 }


 res.status(200).json({
  success: true,
  data: head
 });

});



/* UPDATE */

exports.updateDepartmentHead = asyncHandler(async (req, res) => {

 let { name, designation, phone, email } = req.body;


 if (name) name = name.trim();
 if (designation) designation = designation.trim();
 if (phone) phone = phone.trim();
 if (email) email = email.trim();


 if (phone) {
  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phone)) {
   return res.status(400).json({
    success: false,
    message: "Phone must be exactly 10 digits"
   });
  }
 }


 if (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
   return res.status(400).json({
    success: false,
    message: "Invalid email format"
   });
  }
 }


 const updated = await DepartmentHead.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true }
 );


 res.status(200).json({
  success: true,
  message: "Department head updated successfully",
  data: updated
 });

});



/* DELETE */

exports.deleteDepartmentHead = asyncHandler(async (req, res) => {

 const head = await DepartmentHead.findById(req.params.id);

 if (!head) {
  return res.status(404).json({
   success: false,
   message: "Department head not found"
  });
 }

 head.isActive = false;

 await head.save();


 res.status(200).json({
  success: true,
  message: "Department head deleted successfully"
 });

});