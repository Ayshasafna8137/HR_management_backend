const express = require("express");
const router = express.Router();

const {
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    getAllLeaveRequests,
    getLeaveRequestById,
    updateLeaveStatus
} = require("../controllers/leaveRequest");

// GET routes
router.get("/", getAllLeaveRequests);
router.get("/:id", getLeaveRequestById);

// POST routes
router.post("/", createLeaveRequest);

// PUT routes
router.put("/:id", updateLeaveRequest);
router.put("/:id/status", updateLeaveStatus);

// DELETE routes
router.delete("/:id", deleteLeaveRequest);

module.exports = router;