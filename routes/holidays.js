const express = require("express");
const router = express.Router();

const holidayController = require("../controllers/holidays");


router.get("/", holidayController.getHolidays);

router.get("/:id", holidayController.getHolidayById);

router.post("/", holidayController.createHoliday);

router.put("/:id", holidayController.updateHoliday);

router.delete("/:id", holidayController.deleteHoliday);


module.exports = router;