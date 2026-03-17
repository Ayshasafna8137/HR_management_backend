const UserModel = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

require("dotenv").config();





//create user
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password,  phone } = req.body;
  

  if (!name || !email || !password ||!phone) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check  email or phone already exists
  const userExists = await UserModel.findOne({
    $or: [{ email: email }],
  });

  if (userExists) {
    if (userExists.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: "user"
  });

  if (user) {
    return res.status(201).json({ message: "User created", status: 201 });
  } else {
    return res.status(400).json({ message: "User not created" });
  }
});

