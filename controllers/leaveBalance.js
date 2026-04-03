const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const LeaveBalance = require("../models/leaveBalance");
const LeaveRequest = require("../models/leaveRequest");

// GET ALL - Calculate dynamically from leave requests
exports.getLeaveBalances = asyncHandler(async (req, res) => {
    try {
        const companyId = req.user?.companyId || req.query.companyId;
        
        // Get all users for this company
        const User = require("../models/User");
        const users = await User.find(companyId ? { companyId: companyId } : {});
        
        if (users.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: "No users found"
            });
        }
        
        const balances = [];
        const currentYear = new Date().getFullYear();
        
        for (const user of users) {
            // Get all years where user has leave requests (plus current year)
            const yearsWithRequests = await LeaveRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) })
                    }
                },
                {
                    $group: {
                        _id: { $year: "$leaveFrom" }
                    }
                },
                {
                    $sort: { _id: -1 }
                }
            ]);
            
            const years = yearsWithRequests.map(y => y._id);
            if (!years.includes(currentYear)) {
                years.push(currentYear);
            }
            
            // Get previous year's carry over balance
            let previousYearCarryOver = 0;
            const previousYear = currentYear - 1;
            
            // Calculate previous year's unused leave to carry over
            const previousYearUsedResult = await LeaveRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "Approved",
                        ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                        leaveFrom: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lte: new Date(`${previousYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$noOfDays" }
                    }
                }
            ]);
            
            const previousYearUsed = previousYearUsedResult.length > 0 ? previousYearUsedResult[0].total : 0;
            const totalAnnualLeave = 12; // Default 12 days per year
            previousYearCarryOver = Math.max(0, totalAnnualLeave - previousYearUsed);
            
            for (const year of years) {
                // Calculate Approved Leaves (Used Leave)
                const approvedResult = await LeaveRequest.aggregate([
                    {
                        $match: {
                            userId: user._id,
                            status: "Approved",
                            ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                            leaveFrom: {
                                $gte: new Date(`${year}-01-01`),
                                $lte: new Date(`${year}-12-31`)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$noOfDays" }
                        }
                    }
                ]);
                
                // Calculate Rejected Leaves
                const rejectedResult = await LeaveRequest.aggregate([
                    {
                        $match: {
                            userId: user._id,
                            status: "Rejected",
                            ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                            leaveFrom: {
                                $gte: new Date(`${year}-01-01`),
                                $lte: new Date(`${year}-12-31`)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$noOfDays" }
                        }
                    }
                ]);
                
                // Calculate Expired Leaves (leaves that were approved but not taken within validity period)
                // For this example, we'll consider leaves from previous year that weren't used
                let expiredLeave = 0;
                if (year === currentYear) {
                    // Calculate expired from previous year (if any)
                    const previousYearApproved = await LeaveRequest.aggregate([
                        {
                            $match: {
                                userId: user._id,
                                status: "Approved",
                                ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                                leaveFrom: {
                                    $gte: new Date(`${previousYear}-01-01`),
                                    $lte: new Date(`${previousYear}-12-31`)
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$noOfDays" }
                            }
                        }
                    ]);
                    
                    const previousYearApprovedTotal = previousYearApproved.length > 0 ? previousYearApproved[0].total : 0;
                    // If carry over limit is 5 days, any carry over beyond that expires
                    const maxCarryOver = 5;
                    expiredLeave = Math.max(0, previousYearCarryOver - maxCarryOver);
                }
                
                // Calculate values
                const usedLeave = approvedResult.length > 0 ? approvedResult[0].total : 0;
                const rejectedLeave = rejectedResult.length > 0 ? rejectedResult[0].total : 0;
                
                // Total Balance = Annual Allocation + Carry Over from previous year
                let totalBalance = 12; // Default annual allocation
                let carryOverBalance = 0;
                
                if (year === currentYear) {
                    // For current year, add carry over from previous year (limited to max 5 days)
                    carryOverBalance = Math.min(previousYearCarryOver, 5);
                    totalBalance = 12 + carryOverBalance;
                } else if (year > currentYear) {
                    // For future years, no carry over yet
                    carryOverBalance = 0;
                    totalBalance = 12;
                } else {
                    // For past years, calculate carry over to next year
                    const remaining = Math.max(0, 12 - usedLeave);
                    carryOverBalance = Math.min(remaining, 5);
                    totalBalance = 12;
                }
                
                // Current Balance = Total Balance - Used Leave
                const currentBalance = Math.max(0, totalBalance - usedLeave);
                
                // Create balance object
                const balance = {
                    _id: `${user._id}_${year}`,
                    userId: user._id,
                    companyId: companyId || user.companyId,
                    year: year,
                    previousBalance: year === currentYear ? previousYearCarryOver : 0,
                    currentBalance: currentBalance,
                    totalBalance: totalBalance,
                    usedLeave: usedLeave,
                    acceptedLeave: usedLeave,
                    rejectedLeave: rejectedLeave,
                    expiredLeave: expiredLeave,
                    carryOverBalance: carryOverBalance,
                    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    employeeId: user.employeeId || '-',
                    department: user.department || '-'
                };
                
                balances.push(balance);
            }
        }
        
        // Sort by year (descending) and then by user name
        balances.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return (a.userName || '').localeCompare(b.userName || '');
        });
        
        res.json({
            success: true,
            data: balances,
            count: balances.length,
            message: "Leave balances calculated dynamically from leave requests"
        });
        
    } catch (error) {
        console.error("Error in getLeaveBalances:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leave balances",
            error: error.message
        });
    }
});

// GET SINGLE LEAVE BALANCE FOR A USER
exports.getLeaveBalanceByUser = asyncHandler(async (req, res) => {
    try {
        const { userId, year } = req.params;
        const companyId = req.user?.companyId || req.query.companyId;
        const targetYear = parseInt(year) || new Date().getFullYear();
        
        // Calculate Approved Leaves (Used Leave)
        const approvedResult = await LeaveRequest.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    status: "Approved",
                    ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                    leaveFrom: {
                        $gte: new Date(`${targetYear}-01-01`),
                        $lte: new Date(`${targetYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$noOfDays" }
                }
            }
        ]);
        
        // Calculate Rejected Leaves
        const rejectedResult = await LeaveRequest.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    status: "Rejected",
                    ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                    leaveFrom: {
                        $gte: new Date(`${targetYear}-01-01`),
                        $lte: new Date(`${targetYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$noOfDays" }
                }
            }
        ]);
        
        // Calculate previous year's carry over
        const previousYear = targetYear - 1;
        const previousYearApproved = await LeaveRequest.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    status: "Approved",
                    ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                    leaveFrom: {
                        $gte: new Date(`${previousYear}-01-01`),
                        $lte: new Date(`${previousYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$noOfDays" }
                }
            }
        ]);
        
        const usedLeave = approvedResult.length > 0 ? approvedResult[0].total : 0;
        const rejectedLeave = rejectedResult.length > 0 ? rejectedResult[0].total : 0;
        const previousYearUsed = previousYearApproved.length > 0 ? previousYearApproved[0].total : 0;
        
        // Calculate carry over from previous year (max 5 days)
        const previousYearRemaining = Math.max(0, 12 - previousYearUsed);
        const carryOverBalance = Math.min(previousYearRemaining, 5);
        
        // Calculate expired leaves
        const maxCarryOver = 5;
        const expiredLeave = Math.max(0, previousYearRemaining - maxCarryOver);
        
        // Total Balance = Annual Allocation + Carry Over
        const totalBalance = 12 + carryOverBalance;
        
        // Current Balance = Total Balance - Used Leave
        const currentBalance = Math.max(0, totalBalance - usedLeave);
        
        // Get user details
        const User = require("../models/User");
        const user = await User.findById(userId);
        
        res.json({
            success: true,
            data: {
                userId: userId,
                year: targetYear,
                previousBalance: previousYearRemaining,
                currentBalance: currentBalance,
                totalBalance: totalBalance,
                usedLeave: usedLeave,
                acceptedLeave: usedLeave,
                rejectedLeave: rejectedLeave,
                expiredLeave: expiredLeave,
                carryOverBalance: carryOverBalance,
                userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                employeeId: user?.employeeId || '-',
                department: user?.department || '-'
            }
        });
        
    } catch (error) {
        console.error("Error in getLeaveBalanceByUser:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leave balance",
            error: error.message
        });
    }
});

// GET SUMMARY FOR DASHBOARD
exports.getLeaveBalanceSummary = asyncHandler(async (req, res) => {
    try {
        const companyId = req.user?.companyId || req.query.companyId;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        
        const User = require("../models/User");
        const users = await User.find(companyId ? { companyId: companyId } : {});
        
        let totalUsedLeave = 0;
        let totalRemaining = 0;
        let totalRejected = 0;
        let totalExpired = 0;
        let totalCarryOver = 0;
        let totalEmployees = users.length;
        let employeesWithLowBalance = 0;
        let employeesWithZeroBalance = 0;
        
        const previousYear = year - 1;
        
        for (const user of users) {
            // Calculate used leaves
            const usedResult = await LeaveRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "Approved",
                        ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                        leaveFrom: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$noOfDays" }
                    }
                }
            ]);
            
            // Calculate rejected leaves
            const rejectedResult = await LeaveRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "Rejected",
                        ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                        leaveFrom: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$noOfDays" }
                    }
                }
            ]);
            
            // Calculate previous year's carry over
            const previousYearResult = await LeaveRequest.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "Approved",
                        ...(companyId && { companyId: mongoose.Types.ObjectId(companyId) }),
                        leaveFrom: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lte: new Date(`${previousYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$noOfDays" }
                    }
                }
            ]);
            
            const usedLeave = usedResult.length > 0 ? usedResult[0].total : 0;
            const rejectedLeave = rejectedResult.length > 0 ? rejectedResult[0].total : 0;
            const previousYearUsed = previousYearResult.length > 0 ? previousYearResult[0].total : 0;
            
            const previousYearRemaining = Math.max(0, 12 - previousYearUsed);
            const carryOver = Math.min(previousYearRemaining, 5);
            const expired = Math.max(0, previousYearRemaining - 5);
            
            const totalBalance = 12 + carryOver;
            const remaining = Math.max(0, totalBalance - usedLeave);
            
            totalUsedLeave += usedLeave;
            totalRemaining += remaining;
            totalRejected += rejectedLeave;
            totalExpired += expired;
            totalCarryOver += carryOver;
            
            if (remaining < 3 && remaining > 0) {
                employeesWithLowBalance++;
            }
            if (remaining === 0) {
                employeesWithZeroBalance++;
            }
        }
        
        res.json({
            success: true,
            data: {
                year,
                totalEmployees,
                totalUsedLeave,
                totalRemaining,
                totalRejected,
                totalExpired,
                totalCarryOver,
                averageRemaining: totalEmployees > 0 ? (totalRemaining / totalEmployees).toFixed(1) : 0,
                employeesWithLowBalance,
                employeesWithZeroBalance,
                totalAvailableDays: totalEmployees * 12,
                utilizationRate: totalEmployees > 0 ? ((totalUsedLeave / (totalEmployees * 12)) * 100).toFixed(1) : 0
            }
        });
        
    } catch (error) {
        console.error("Error in getLeaveBalanceSummary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch leave balance summary",
            error: error.message
        });
    }
});

// GET ONE - Original function (kept for compatibility)
exports.getLeaveBalanceById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    const balance = await LeaveBalance.findById(req.params.id)
        .populate("userId", "firstName lastName email employeeId department")
        .populate("companyId", "name email");

    if (!balance) {
        res.status(404);
        throw new Error("Not found");
    }

    res.json({ success: true, data: balance });
});

// UPDATE - Optional: For manual override if needed
exports.updateLeaveBalance = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error("Invalid ID");
    }

    const balance = await LeaveBalance.findById(req.params.id);

    if (!balance) {
        res.status(404);
        throw new Error("Not found");
    }

    const updated = await LeaveBalance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
});

// DELETE
// DELETE - Handle both ObjectId and custom string IDs
exports.deleteLeaveBalance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    console.log("Delete ID received:", id);
    
    // Case 1: Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
        const balance = await LeaveBalance.findById(id);
        if (balance) {
            await balance.deleteOne();
            return res.json({ 
                success: true, 
                message: "Leave balance deleted successfully" 
            });
        }
    }
    
    // Case 2: Try to parse as custom ID format (userId_year)
    const parts = id.split('_');
    if (parts.length === 2) {
        const userId = parts[0];
        const year = parseInt(parts[1]);
        
        console.log("Attempting to delete custom ID:", { userId, year });
        
        // Find and delete by userId and year from LeaveBalance collection
        const balance = await LeaveBalance.findOneAndDelete({ 
            userId: userId, 
            year: year 
        });
        
        if (balance) {
            return res.json({ 
                success: true, 
                message: "Leave balance deleted successfully" 
            });
        }
        
        // If not found in LeaveBalance collection, we can't delete calculated data
        // Return success anyway since it's just calculated display data
        return res.json({ 
            success: true, 
            message: "Leave balance record removed from view" 
        });
    }
    
    // If we get here, no record was found
    res.status(404);
    throw new Error("Leave balance not found");
});