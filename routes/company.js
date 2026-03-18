const express = require("express");
const router = express.Router();

const {
  getCompany,
  addCompany,
  updateCompany,
  deleteCompany
} = require("../controllers/company");

router.get("/", getCompany);
router.post("/", addCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

module.exports = router;