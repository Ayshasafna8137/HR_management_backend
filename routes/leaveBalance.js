const express = require("express");
const router = express.Router();

const {
  getLeaveBalances,
  getLeaveBalanceById,
  getLeaveBalanceByUser,
  getLeaveBalanceSummary,
  updateLeaveBalance,
  deleteLeaveBalance
} = require("../controllers/leaveBalance");

router.get("/", getLeaveBalances);
router.get("/summary", getLeaveBalanceSummary);
router.get("/user/:userId/:year", getLeaveBalanceByUser);
router.get("/:id", getLeaveBalanceById);
router.put("/:id", updateLeaveBalance);
router.delete("/:id", deleteLeaveBalance);

module.exports = router;