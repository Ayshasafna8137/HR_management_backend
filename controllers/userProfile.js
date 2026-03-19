const UserModel = require("../models/User");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");


// GET EMPLOYEE PROFILE
exports.getUserProfile = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // ID validation
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID"
    });
  }

  const user = await UserModel.findById(id)
    .select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Employee not found"
    });
  }

  const profileData = {
    _id: user._id,
    name: `${user.firstName?.trim() || ""} ${user.lastName?.trim() || ""}`.trim(),
    designation: user.designation?.trim(),
    department: user.department?.trim(),
    email: user.email?.trim(),
    mobile: user.mobile?.trim(),
    address: user.address?.trim(),
    about: user.about?.trim() || "",
    education: user.education?.trim() || "",
    experience: user.experience?.trim() || "",
    skills: user.skills || [],
    image: user.image || ""
  };

  res.status(200).json({
    success: true,
    data: profileData
  });

});