const UserModel = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");


//get user

exports.getUsers = asyncHandler(async (req, res) => {

  const users = await UserModel.find({ isActive: true })
    .select("-password")
    .sort({ createdAt: -1 });

  const formattedUsers = users.map(user => ({
    _id: user._id,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    gender: user.gender,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation,
    address: user.address,
    workLocation: user.workLocation,
    joiningDate: user.joiningDate
      ? user.joiningDate.toISOString().split("T")[0]
      : null,
    status: user.status
  }));

  res.status(200).json({
    success: true,
    data: formattedUsers
  });

});

//create user
exports.createUsers = asyncHandler(async (req, res) => {
 console.log("Skills from request:", req.body.skills);
  const {
    firstName,
    lastName,
    gender,
    mobile,
    email,
    password,
    role,
    department,
    designation,
    address,
    dateOfBirth,
    education,
    salary,
    joiningDate,
    lastPromotionDate,
    workLocation,
    status,
    skills
  } = req.body;


  // Validation
  if (!firstName || !mobile || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "firstName, mobile, email and password are required"
    });
  }


  // Check email exists
  const emailExists = await UserModel.findOne({ email });

  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }


  // Check mobile exists
  const mobileExists = await UserModel.findOne({ mobile });

  if (mobileExists) {
    return res.status(400).json({
      success: false,
      message: "Mobile already exists"
    });
  }


  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);


  // Create employee
  const user = new UserModel({
  firstName,
  lastName,
  gender,
  mobile,
  email,
  password: hashedPassword,
  role,
  department,
  designation,
  address,
  dateOfBirth,
  education,
  salary,
  joiningDate,
  lastPromotionDate,
  workLocation,
  status,
  skills: skills || []
});

  const savedUser = await user.save();


  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: savedUser
  });

});

//update user
exports.updateUsers = asyncHandler(async (req, res) => {

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Employee not found"
    });
  }

  let updateData = { ...req.body };


  // Convert name → firstName + lastName
  if (req.body.name) {
    const parts = req.body.name.trim().split(" ");
    updateData.firstName = parts[0];
    updateData.lastName = parts.slice(1).join(" ");
    delete updateData.name;
  }


  const updatedUser = await UserModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-password");


  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: updatedUser
  });

});

//delete user

exports.deleteUsers = asyncHandler(async (req, res) => {

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Employee not found"
    });
  }

  user.isActive = false;
  user.status = "Inactive";

  await user.save();

  res.status(200).json({
    success: true,
    message: "Employee deleted successfully"
  });

});