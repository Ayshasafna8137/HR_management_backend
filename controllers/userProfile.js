const UserModel = require("../models/User");
const asyncHandler = require("express-async-handler");


// GET EMPLOYEE PROFILE
exports.getUserProfile = asyncHandler(async (req, res) => {

  const user = await UserModel.findById(req.params.id)
    .select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Employee not found"
    });
  }


  const profileData = {
    _id: user._id,
    name: `${user.firstName} ${user.lastName || ""}`.trim(),
    designation: user.designation,
    department: user.department,
    email: user.email,
    mobile: user.mobile,
    address: user.address,
    about: user.about || "",
    education: user.education || "",
    experience: user.experience || "",
    skills: user.skills || [],
    image: user.image || ""
  };


  res.status(200).json({
    success: true,
    data: profileData
  });

});