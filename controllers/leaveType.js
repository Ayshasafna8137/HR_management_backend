const asyncHandler = require("express-async-handler");
const LeaveType = require("../models/leaveType");


// CREATE LEAVE - WITH DUPLICATE CHECK
exports.createLeaveType = asyncHandler(async (req, res) => {

    const {
        companyId,
        leaveName,
        leaveType,
        leaveUnit,
        status,
        notificationPeriod,
        duration,
        annualLimit,
        createdBy,
        note
    } = req.body;

    // Validate companyId
    if (!companyId) {
        res.status(400);
        throw new Error("Company ID is required");
    }

    // required fields
    if (!leaveName || !leaveType || !leaveUnit) {
        res.status(400);
        throw new Error("leaveName, leaveType and leaveUnit are required");
    }

    // Check for duplicate leave type with same name for the same company
    const existingLeaveType = await LeaveType.findOne({
        companyId: companyId,
        leaveName: { $regex: new RegExp(`^${leaveName}$`, 'i') } // Case-insensitive check
    });

    if (existingLeaveType) {
        res.status(400);
        throw new Error(`Leave type "${leaveName}" already exists for this company`);
    }

    // status validation
    if (status && !["Active", "Inactive"].includes(status)) {
        res.status(400);
        throw new Error("Status must be Active or Inactive");
    }

    // notification period validation
    if (notificationPeriod && notificationPeriod.trim() === "") {
        res.status(400);
        throw new Error("Notification period cannot be empty");
    }

    // number validation
    if (duration && duration < 0) {
        res.status(400);
        throw new Error("Duration cannot be negative");
    }

    if (annualLimit && annualLimit < 0) {
        res.status(400);
        throw new Error("Annual limit cannot be negative");
    }

    const leave = await LeaveType.create({
        companyId,
        leaveName,
        leaveType,
        leaveUnit,
        status: status || "Active",
        notificationPeriod: notificationPeriod || "",
        duration: duration || 0,
        annualLimit: annualLimit || 0,
        createdBy: createdBy || "HR Department",
        note: note || ""
    });

    res.status(201).json({
        success: true,
        message: "Leave type created",
        data: leave
    });

});


// GET ALL LEAVES - Filter by companyId to prevent showing other companies' data
exports.getLeaveTypes = asyncHandler(async (req, res) => {
    const { companyId } = req.query;
    
    const query = {};
    if (companyId) {
        query.companyId = companyId;
    }
    
    const leaves = await LeaveType.find(query).populate("companyId").sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: leaves.length,
        data: leaves
    });

});


// UPDATE LEAVE - WITH DUPLICATE CHECK
exports.updateLeaveType = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { leaveName, companyId } = req.body;

    // If leaveName is being updated, check for duplicates
    if (leaveName) {
        // Get the current leave type
        const currentLeave = await LeaveType.findById(id);
        
        if (!currentLeave) {
            res.status(404);
            throw new Error("Leave type not found");
        }

        // Check if another leave type with same name exists (excluding current one)
        const existingLeaveType = await LeaveType.findOne({
            companyId: companyId || currentLeave.companyId,
            leaveName: { $regex: new RegExp(`^${leaveName}$`, 'i') },
            _id: { $ne: id } // Exclude current record
        });

        if (existingLeaveType) {
            res.status(400);
            throw new Error(`Leave type "${leaveName}" already exists for this company`);
        }
    }

    const leave = await LeaveType.findByIdAndUpdate(
        id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!leave) {
        res.status(404);
        throw new Error("Leave type not found");
    }

    res.status(200).json({
        success: true,
        message: "Leave type updated",
        data: leave
    });

});


// DELETE LEAVE
exports.deleteLeaveType = asyncHandler(async (req, res) => {

    const leave = await LeaveType.findByIdAndDelete(req.params.id);

    if (!leave) {
        res.status(404);
        throw new Error("Leave type not found");
    }

    res.status(200).json({
        success: true,
        message: "Leave type deleted"
    });

});