const express = require("express");
const router = express.Router();

const departmentHeadController = require("../controllers/departmenthead");

router.post("/",departmentHeadController.createDepartmentHead);

router.get("/",departmentHeadController.getDepartmentHeads);

router.get("/:id",departmentHeadController.getDepartmentHeadById);

router.put("/:id",departmentHeadController.updateDepartmentHead);

router.delete("/:id",departmentHeadController.deleteDepartmentHead);

module.exports = router;