const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const LeaveRequest = require("../models/leaveRequest");

// GET ALL LEAVE REQUESTS
exports.getAllLeaveRequests = asyncHandler(async (req, res) => {
  const leaveRequests = await LeaveRequest.find()
    .populate({
      path: "userId",
      select: "firstName lastName employeeId department"
    })
    .populate({
      path: "manageId", 
      select: "firstName lastName firstname lastname employeeId role email"
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: leaveRequests
  });
});

// GET SINGLE LEAVE REQUEST
exports.getLeaveRequestById = asyncHandler(async (req, res) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id)
    .populate({
      path: "userId",
      select: "firstName lastName employeeId department email"
    })
    .populate({
      path: "manageId",
      select: "firstName lastName"
    });

  if (!leaveRequest) {
    res.status(404);
    throw new Error("Leave request not found");
  }

  res.status(200).json({
    success: true,
    data: leaveRequest
  });
});

// CREATE LEAVE REQUEST
exports.createLeaveRequest = asyncHandler(async (req, res) => {
  const {
    userId,
    companyId,
    leaveType,
    leaveFrom,
    leaveTo,
    noOfDays,
    reason
  } = req.body;

  if (!userId || !companyId || !leaveType || !leaveFrom || !leaveTo || !noOfDays || !reason) {
    res.status(400);
    throw new Error("All required fields must be provided");
  }

  const leave = await LeaveRequest.create({
    userId,
    companyId,
    leaveType,
    leaveFrom,
    leaveTo,
    noOfDays,
    reason,
    status: "Pending"
  });

  const populatedLeave = await LeaveRequest.findById(leave._id)
    .populate({
      path: "userId",
      select: "firstName lastName employeeId department email"
    });

  res.status(201).json({
    success: true,
    message: "Leave request created successfully",
    data: populatedLeave
  });
});

// UPDATE LEAVE REQUEST
exports.updateLeaveRequest = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error("Leave request not found");
  }

  const { leaveType, leaveFrom, leaveTo, noOfDays, reason } = req.body;

  if (leaveType) leave.leaveType = leaveType;
  if (leaveFrom) leave.leaveFrom = leaveFrom;
  if (leaveTo) leave.leaveTo = leaveTo;
  if (noOfDays) leave.noOfDays = noOfDays;
  if (reason) leave.reason = reason;

  await leave.save();

  const populatedLeave = await LeaveRequest.findById(leave._id)
    .populate({
      path: "userId",
      select: "firstName lastName employeeId department email"
    });

  res.status(200).json({
    success: true,
    message: "Leave request updated successfully",
    data: populatedLeave
  });
});

// UPDATE LEAVE REQUEST STATUS (APPROVE/REJECT) - NO MANUAL BALANCE UPDATE NEEDED
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, manageId, manageRole } = req.body;

    const leave = await LeaveRequest.findById(id);
    
    if (!leave) {
        res.status(404);
        throw new Error("Leave request not found");
    }

    if (leave.status !== "Pending") {
        res.status(400);
        throw new Error(`Leave request is already ${leave.status}`);
    }

    leave.status = status;
    leave.manageId = manageId;
    leave.manageRole = manageRole;
    leave.approvedDate = new Date();
    
    await leave.save();

    // Populate before returning
    const updatedLeave = await LeaveRequest.findById(id)
        .populate({
            path: "userId",
            select: "firstName lastName firstname lastname employeeId department email"
        })
        .populate({
            path: "manageId",
            select: "firstName lastName firstname lastname employeeId role email"
        });

    res.status(200).json({
        success: true,
        message: `Leave request ${status} successfully`,
        data: updatedLeave
    });
});

// DELETE LEAVE REQUEST
exports.deleteLeaveRequest = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error("Leave request not found");
  }

  if (leave.status !== "Pending") {
    res.status(400);
    throw new Error("Cannot delete leave request that is already processed");
  }

  await LeaveRequest.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Leave request deleted successfully"
  });
});