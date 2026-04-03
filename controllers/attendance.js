const Attendance = require("../models/Attendance");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");


// CREATE ATTENDANCE
exports.createAttendance = asyncHandler(async (req, res) => {

  const {
    companyId,
    userId,
    firstIn,
    lastOut,
    totalHours,
    status,
    shift
  } = req.body;

  if (!companyId || !userId || !firstIn) {
    return res.status(400).json({
      success: false,
      message: "companyId, userId and firstIn are required"
    });
  }

  const attendance = await Attendance.create({
    companyId,
    userId,
    firstIn,
    lastOut,
    totalHours,
    status,
    shift
  });

  res.status(201).json({
    success: true,
    message: "Attendance created successfully",
    data: attendance
  });

});



// GET ALL ATTENDANCE
exports.getAttendance = asyncHandler(async (req, res) => {

  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "companyId is required"
    });
  }

  const attendance = await Attendance.find({ companyId })
  .populate("userId", "firstName lastName email")
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });

});





// GET TODAY ATTENDANCE
exports.getTodayAttendance = asyncHandler(async (req, res) => {

  const { companyId } = req.params;
  const { date } = req.query;   // optional date

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "companyId is required"
    });
  }

  // Use provided date or today's date
  const targetDate = date ? new Date(date) : new Date();

  const start = new Date(targetDate);
  start.setHours(0,0,0,0);

  const end = new Date(targetDate);
  end.setHours(23,59,59,999);

  const attendance = await Attendance.find({
    companyId,
    date: { $gte: start, $lte: end }
  })
  .populate("userId","firstName lastName email")
  .sort({createdAt:-1});

  res.status(200).json({
    success:true,
    count:attendance.length,
    data:attendance
  });

});

// UPDATE ATTENDANCE
exports.updateAttendance = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid attendance ID"
    });
  }

  const attendance = await Attendance.findById(id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: "Attendance not found"
    });
  }

  const {
    firstIn,
    lastOut,
    totalHours,
    status,
    shift
  } = req.body;

  attendance.firstIn = firstIn || attendance.firstIn;
  attendance.lastOut = lastOut || attendance.lastOut;
  attendance.totalHours = totalHours || attendance.totalHours;
  attendance.status = status || attendance.status;
  attendance.shift = shift || attendance.shift;

  await attendance.save();

  res.status(200).json({
    success: true,
    message: "Attendance updated successfully",
    data: attendance
  });

});


// DELETE ATTENDANCE
exports.deleteAttendance = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID"
    });
  }

  const attendance = await Attendance.findByIdAndDelete(id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: "Attendance not found"
    });
  }

  res.json({
    success: true,
    message: "Attendance deleted"
  });

});