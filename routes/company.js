const express = require("express");
const router = express.Router();

const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyById
} = require("../controllers/company");

// GET all companies
router.get("/", getCompanies);

// GET company by ID
router.get("/:id", getCompanyById);

// CREATE company
router.post("/", createCompany);

// UPDATE company
router.put("/:id", updateCompany);

// DELETE company
router.delete("/:id", deleteCompany);

module.exports = router;