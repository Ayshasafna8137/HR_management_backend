const User = require("../models/User");


// GET USERS
exports.getUsers = async (req, res) => {
  try {

    const users = await User.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error while fetching users"
    });

  }
};



// CREATE USER
exports.createUser = async (req, res) => {

  try {

    let {
      name,
      role,
      department,
      mobile,
      joiningDate,
      email,
      gender,
      address,
      status
    } = req.body;


    // TRIM VALUES
    name = name?.trim();
    role = role?.trim();
    department = department?.trim();
    mobile = mobile?.trim();
    email = email?.trim().toLowerCase();
    gender = gender?.trim();
    address = address?.trim();


    // REQUIRED VALIDATION
    if (
      !name ||
      !role ||
      !department ||
      !mobile ||
      !joiningDate ||
      !email ||
      !gender ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }


    // NAME VALIDATION
    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
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


    // MOBILE VALIDATION
    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits"
      });
    }


    // CHECK DUPLICATE EMAIL
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }


    // CHECK DUPLICATE MOBILE
    const mobileExists = await User.findOne({ mobile });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists"
      });
    }


    const user = new User({
      name,
      role,
      department,
      mobile,
      joiningDate,
      email,
      gender,
      address,
      status
    });

    const savedUser = await user.save();


    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating user"
    });

  }
};



// UPDATE USER
exports.updateUser = async (req, res) => {

  try {

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error while updating user"
    });

  }
};



// SOFT DELETE
exports.deleteUser = async (req, res) => {

  try {

    const deletedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        status: "Inactive"
      },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error while deleting user"
    });

  }
};