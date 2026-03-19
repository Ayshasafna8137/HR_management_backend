const Holiday = require("../models/Holidays");
const asyncHandler = require("express-async-handler");

//get all holiday
exports.getHolidays = asyncHandler(async (req, res) => {

  const holidays = await Holiday.find({ isActive: true })
  .sort({ date: 1 });

  res.status(200).json({
    success: true,
    data: holidays
  });

});

//get holiday by id
exports.getHolidayById = asyncHandler(async (req, res) => {

  const holiday = await Holiday.findById(req.params.id);

  if(!holiday){
    return res.status(404).json({
      success:false,
      message:"Holiday not found"
    });
  }

  res.status(200).json({
    success:true,
    data:holiday
  });

});

//create holiday
exports.createHoliday = asyncHandler(async (req,res)=>{

  const holiday = await Holiday.create(req.body);

  res.status(201).json({
    success:true,
    message:"Holiday created successfully",
    data:holiday
  });

});

//update holiday
exports.updateHoliday = async (req, res) => {
  try {

    console.log("ID:", req.params.id);
    console.log("BODY:", req.body);

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Holiday updated successfully",
      data: holiday
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

//delete holiday
exports.deleteHoliday = asyncHandler(async (req,res)=>{

  const holiday = await Holiday.findById(req.params.id);

  if(!holiday){
    return res.status(404).json({
      success:false,
      message:"Holiday not found"
    });
  }

  holiday.isActive = false;

  await holiday.save();

  res.status(200).json({
    success:true,
    message:"Holiday deleted successfully"
  });

});