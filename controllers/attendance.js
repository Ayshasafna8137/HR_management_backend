const AttendanceModel = require("../models/Attendance");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");


// GET all attendance
exports.getAttendance = asyncHandler(async (req, res) => {

  const data = await AttendanceModel
    .find()
    .populate("userId")
    .sort({ createdAt: -1 });

  res.status(200).json(data);

});


// ADD attendance
exports.addAttendance = asyncHandler(async (req, res) => {

  const { userId, firstIn, lastOut, totalHours, status, shift } = req.body;

  // userId validation
  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid UserId" });
  }

  // firstIn validation
  if (!firstIn) {
    return res.status(400).json({ message: "First In time is required" });
  }

  // status validation
  const validStatus = ["Present", "Absent", "Leave", "Half Day"];
  if (status && !validStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  // prevent duplicate attendance same day
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);

  const existing = await AttendanceModel.findOne({
    userId,
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  if (existing) {
    return res.status(400).json({ message: "Attendance already marked today" });
  }

  const attendance = new AttendanceModel({
    userId,
    firstIn,
    lastOut,
    totalHours,
    status,
    shift
  });

  const saved = await attendance.save();

  res.status(201).json(saved);

});


// GET single attendance
exports.getSingleAttendance = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid attendance ID" });
  }

  const attendance = await AttendanceModel
    .findById(id)
    .populate("userId");

  if (!attendance) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  res.status(200).json(attendance);

});


// UPDATE attendance
exports.updateAttendance = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid attendance ID" });
  }

  const attendance = await AttendanceModel.findById(id);

  if (!attendance) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  const { todayActivity } = req.body;

  // punch activity validation
  if (todayActivity) {

    if (!todayActivity.time || !todayActivity.punch) {
      return res.status(400).json({ 
        message: "Activity must include time and punch type" 
      });
    }

    attendance.punch = !attendance.punch;

    attendance.todayActivity.push(todayActivity);

    await attendance.save();

    return res.status(200).json(attendance);
  }

  const updated = await AttendanceModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(updated);

});


// DELETE attendance
exports.deleteAttendance = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid attendance ID" });
  }

  const deleted = await AttendanceModel.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  res.status(200).json({
    message: "Attendance deleted successfully"
  });

});