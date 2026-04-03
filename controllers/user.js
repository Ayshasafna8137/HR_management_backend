// const UserModel = require("../models/User");
// const asyncHandler = require("express-async-handler");
// const bcrypt = require("bcrypt");

// // GET USERS - Include companyId in the response
// exports.getUsers = asyncHandler(async (req, res) => {

//   const users = await UserModel.find({ isActive: true })
//     .populate("companyId") // This will populate company details
//     .select("-password")
//     .sort({ createdAt: -1 });

//   const formattedUsers = users.map(user => ({
//     _id: user._id,
//     name: `${user.firstName} ${user.lastName || ""}`.trim(),
//     firstName: user.firstName, // Add firstName for dropdown
//     lastName: user.lastName,   // Add lastName for dropdown
//     gender: user.gender,
//     mobile: user.mobile,
//     email: user.email,
//     role: user.role,
//     department: user.department,
//     designation: user.designation,
//     address: user.address,
//     workLocation: user.workLocation,
//     joiningDate: user.joiningDate
//       ? user.joiningDate.toISOString().split("T")[0]
//       : null,
//     status: user.status,
//     companyId: user.companyId?._id || user.companyId // Include companyId
//   }));

//   console.log("Formatted users with companyIds:", formattedUsers.map(u => ({
//     name: u.name,
//     companyId: u.companyId
//   })));

//   res.status(200).json({
//     success: true,
//     data: formattedUsers
//   });

// });

// // CREATE USER - Fix to include companyId
// exports.createUsers = asyncHandler(async (req, res) => {

//   let {
//     firstName,
//     lastName,
//     gender,
//     mobile,
//     email,
//     password,
//     role,
//     department,
//     designation,
//     address,
//     dateOfBirth,
//     education,
//     salary,
//     joiningDate,
//     lastPromotionDate,
//     workLocation,
//     status,
//     skills,
//     companyId  // Add companyId to destructuring
//   } = req.body;

//   // TRIM STRING VALUES
//   firstName = firstName?.trim();
//   lastName = lastName?.trim();
//   mobile = mobile?.trim();
//   email = email?.trim();
//   role = role?.trim();
//   department = department?.trim();
//   designation = designation?.trim();
//   address = address?.trim();
//   education = education?.trim();
//   workLocation = workLocation?.trim();
//   status = status?.trim();

//   // REQUIRED VALIDATION
//   if (!firstName || !mobile || !email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "firstName, mobile, email and password are required"
//     });
//   }

//   // Validate companyId
//   if (!companyId) {
//     return res.status(400).json({
//       success: false,
//       message: "companyId is required"
//     });
//   }

//   // EMAIL EXISTS
//   const emailExists = await UserModel.findOne({ email });

//   if (emailExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Email already exists"
//     });
//   }

//   // MOBILE EXISTS
//   const mobileExists = await UserModel.findOne({ mobile });

//   if (mobileExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Mobile already exists"
//     });
//   }

//   // HASH PASSWORD
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // CREATE USER
//   const user = new UserModel({
//     companyId,  // Add companyId here
//     firstName,
//     lastName,
//     gender,
//     mobile,
//     email,
//     password: hashedPassword,
//     role,
//     department,
//     designation,
//     address,
//     dateOfBirth,
//     education,
//     salary,
//     joiningDate,
//     lastPromotionDate,
//     workLocation,
//     status,
//     skills: skills || []
//   });

//   const savedUser = await user.save();

//   res.status(201).json({
//     success: true,
//     message: "Employee created successfully",
//     data: savedUser
//   });

// });

// // UPDATE USER
// exports.updateUsers = asyncHandler(async (req, res) => {

//   const user = await UserModel.findById(req.params.id);

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "Employee not found"
//     });
//   }

//   let updateData = { ...req.body };

//   // TRIM STRING FIELDS
//   const trimFields = [
//     "firstName",
//     "lastName",
//     "mobile",
//     "email",
//     "role",
//     "department",
//     "designation",
//     "address",
//     "education",
//     "workLocation",
//     "status"
//   ];

//   trimFields.forEach(field => {
//     if (updateData[field]) {
//       updateData[field] = updateData[field].trim();
//     }
//   });

//   // CONVERT NAME → FIRST + LAST
//   if (req.body.name) {
//     const parts = req.body.name.trim().split(" ");
//     updateData.firstName = parts[0];
//     updateData.lastName = parts.slice(1).join(" ");
//     delete updateData.name;
//   }

//   const updatedUser = await UserModel.findByIdAndUpdate(
//     req.params.id,
//     updateData,
//     {
//       new: true,
//       runValidators: true
//     }
//   ).select("-password");

//   res.status(200).json({
//     success: true,
//     message: "Employee updated successfully",
//     data: updatedUser
//   });

// });

// // DELETE USER
// exports.deleteUsers = asyncHandler(async (req, res) => {

//   const user = await UserModel.findById(req.params.id);

//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "Employee not found"
//     });
//   }

//   user.isActive = false;
//   user.status = "Inactive";

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Employee deleted successfully"
//   });

// });

// const UserModel = require("../models/User");
// const asyncHandler = require("express-async-handler");
// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");

// // CREATE USER - Fixed version
// exports.createUsers = asyncHandler(async (req, res) => {

//   console.log("Request body received:", req.body);

//   let {
//     companyId,
//     firstName,
//     lastName,
//     gender,
//     mobile,
//     email,
//     password,
//     role,
//     department,
//     designation,
//     address,
//     dateOfBirth,
//     education,
//     salary,
//     joiningDate,
//     lastPromotionDate,
//     workLocation,
//     status,
//     skills
//   } = req.body;

//   // TRIM STRING VALUES
//   if (firstName) firstName = firstName.trim();
//   if (lastName) lastName = lastName.trim();
//   if (mobile) mobile = mobile.trim();
//   if (email) email = email.trim();
//   if (role) role = role.trim();
//   if (department) department = department.trim();
//   if (designation) designation = designation.trim();
//   if (address) address = address.trim();
//   if (education) education = education.trim();
//   if (workLocation) workLocation = workLocation.trim();
//   if (status) status = status.trim();

//   // REQUIRED VALIDATION
//   if (!firstName) {
//     return res.status(400).json({
//       success: false,
//       message: "firstName is required"
//     });
//   }

//   if (!mobile) {
//     return res.status(400).json({
//       success: false,
//       message: "mobile is required"
//     });
//   }

//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       message: "email is required"
//     });
//   }

//   if (!password) {
//     return res.status(400).json({
//       success: false,
//       message: "password is required"
//     });
//   }

//   // Validate companyId
//   if (!companyId) {
//     return res.status(400).json({
//       success: false,
//       message: "companyId is required"
//     });
//   }

//   // Validate if companyId is a valid MongoDB ObjectId
//   if (!mongoose.Types.ObjectId.isValid(companyId)) {
//     return res.status(400).json({
//       success: false,
//       message: `Invalid companyId format: ${companyId}. Must be a valid MongoDB ObjectId.`
//     });
//   }

//   // Check if email already exists
//   const emailExists = await UserModel.findOne({ email });
//   if (emailExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Email already exists"
//     });
//   }

//   // Check if mobile already exists
//   const mobileExists = await UserModel.findOne({ mobile });
//   if (mobileExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Mobile number already exists"
//     });
//   }

//   // HASH PASSWORD
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // CREATE USER OBJECT
//   const userData = {
//     companyId: new mongoose.Types.ObjectId(companyId), // Convert to ObjectId
//     firstName,
//     lastName: lastName || "",
//     gender: gender || null,
//     mobile,
//     email,
//     password: hashedPassword,
//     role: role || "Employee",
//     department: department || "",
//     designation: designation || "",
//     address: address || "",
//     dateOfBirth: dateOfBirth || null,
//     education: education || "",
//     salary: salary || null,
//     joiningDate: joiningDate || new Date(),
//     lastPromotionDate: lastPromotionDate || null,
//     workLocation: workLocation || "Office",
//     status: status || "Active",
//     skills: skills || [],
//     isActive: true
//   };

//   console.log("Creating user with data:", userData);

//   // CREATE USER
//   const user = new UserModel(userData);

//   try {
//     const savedUser = await user.save();
    
//     // Remove password from response
//     const userResponse = savedUser.toObject();
//     delete userResponse.password;

//     res.status(201).json({
//       success: true,
//       message: "Employee created successfully",
//       data: userResponse
//     });
//   } catch (error) {
//     console.error("Error saving user:", error);
    
//     // Handle validation errors
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: messages.join(", ")
//       });
//     }
    
//     throw error;
//   }
// });

const UserModel = require("../models/User");
const CompanyModel = require("../models/Company");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// GET ALL USERS
exports.getUsers = asyncHandler(async (req, res) => {
  console.log("=== GET ALL USERS ===");
  
  const users = await UserModel.find({ isActive: true })
    .populate("companyId", "name email")
    .select("-password")
    .sort({ createdAt: -1 });

  const formattedUsers = users.map(user => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    gender: user.gender,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation,
    address: user.address,
    workLocation: user.workLocation,
    joiningDate: user.joiningDate ? user.joiningDate.toISOString().split("T")[0] : null,
    status: user.status,
    companyId: user.companyId?._id || user.companyId,
    companyName: user.companyId?.name || null
  }));

  console.log(`Found ${formattedUsers.length} users`);

  res.status(200).json({
    success: true,
    count: formattedUsers.length,
    data: formattedUsers
  });
});

// GET SINGLE USER
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  const user = await UserModel.findById(id)
    .populate("companyId", "name email phone")
    .select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// CREATE USER
exports.createUsers = asyncHandler(async (req, res) => {
  console.log("=== CREATE USER ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const {
    companyId,
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

  // VALIDATE REQUIRED FIELDS
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "companyId is required"
    });
  }

  if (!firstName) {
    return res.status(400).json({
      success: false,
      message: "firstName is required"
    });
  }

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "mobile is required"
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "email is required"
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "password is required"
    });
  }

  // VALIDATE COMPANY ID
  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid companyId format: ${companyId}. Must be a valid MongoDB ObjectId`
    });
  }

  // CHECK IF COMPANY EXISTS
  const companyExists = await CompanyModel.findById(companyId);
  if (!companyExists) {
    return res.status(400).json({
      success: false,
      message: `Company with ID ${companyId} does not exist`
    });
  }

  console.log("Company exists:", companyExists.name);

  // CHECK IF EMAIL EXISTS
  const emailExists = await UserModel.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }

  // CHECK IF MOBILE EXISTS
  const mobileExists = await UserModel.findOne({ mobile });
  if (mobileExists) {
    return res.status(400).json({
      success: false,
      message: "Mobile number already exists"
    });
  }

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // CREATE USER DATA
  const userData = {
    companyId: new mongoose.Types.ObjectId(companyId),
    firstName: firstName.trim(),
    lastName: lastName ? lastName.trim() : "",
    gender: gender || null,
    mobile: mobile.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || "Employee",
    department: department || "",
    designation: designation || "",
    address: address || "",
    dateOfBirth: dateOfBirth || null,
    education: education || "",
    salary: salary || null,
    joiningDate: joiningDate || new Date(),
    lastPromotionDate: lastPromotionDate || null,
    workLocation: workLocation || "Office",
    status: status || "Active",
    skills: skills || [],
    isActive: true
  };

  console.log("Creating user with data:", JSON.stringify(userData, null, 2));

  // CREATE USER
  try {
    const user = new UserModel(userData);
    const savedUser = await user.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    console.log("User created successfully with ID:", savedUser._id);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: userResponse
    });
  } catch (error) {
    console.error("Error saving user:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
        errors: error.errors
      });
    }
    
    throw error;
  }
});

// UPDATE USER
exports.updateUsers = asyncHandler(async (req, res) => {
  console.log("=== UPDATE USER ===");
  console.log("User ID:", req.params.id);
  console.log("Update data:", req.body);

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Employee not found"
    });
  }

  let updateData = { ...req.body };

  // TRIM STRING FIELDS
  const trimFields = [
    "firstName",
    "lastName",
    "mobile",
    "email",
    "role",
    "department",
    "designation",
    "address",
    "education",
    "workLocation",
    "status"
  ];

  trimFields.forEach(field => {
    if (updateData[field]) {
      updateData[field] = updateData[field].trim();
    }
  });

  // If updating email, check if it already exists
  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await UserModel.findOne({ 
      email: updateData.email.toLowerCase(),
      _id: { $ne: req.params.id }
    });
    
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    updateData.email = updateData.email.toLowerCase();
  }

  // If updating mobile, check if it already exists
  if (updateData.mobile && updateData.mobile !== user.mobile) {
    const mobileExists = await UserModel.findOne({
      mobile: updateData.mobile,
      _id: { $ne: req.params.id }
    });
    
    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists"
      });
    }
  }

  // If updating password, hash it
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  console.log("User updated successfully");

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: updatedUser
  });
});

// DELETE USER (SOFT DELETE)
exports.deleteUsers = asyncHandler(async (req, res) => {
  console.log("=== DELETE USER ===");
  console.log("User ID:", req.params.id);

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

  console.log("User deleted successfully");

  res.status(200).json({
    success: true,
    message: "Employee deleted successfully"
  });
});

// GET USERS BY COMPANY
exports.getUsersByCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID format"
    });
  }

  const users = await UserModel.find({ 
    companyId: companyId,
    isActive: true 
  })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});