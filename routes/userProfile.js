const express = require("express");
const router = express.Router();

const userProfileController = require("../controllers/userProfile");

// GET PROFILE
router.get("/profile/:id", userProfileController.getUserProfile);

module.exports = router;