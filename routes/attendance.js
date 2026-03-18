const express = require("express")
const router = express.Router()

const {
 getAttendance,
 addAttendance,
 updateAttendance,
 deleteAttendance,
 getSingleAttendance
} = require("../controllers/attendance")

router.get("/", getAttendance)

router.get("/:id", getSingleAttendance)

router.post("/", addAttendance)

router.put("/:id", updateAttendance)

router.delete("/:id", deleteAttendance)

module.exports = router