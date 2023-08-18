const express = require("express");
const {
  getUserDetails,
  userSignin,
  userSignup,
} = require("../controllers/user_controllers");
const {
  createGroup,
  getGroupList,
} = require("../controllers/group_controller");
const {
  CreateExpense,
  getExpenseDetails,
} = require("../controllers/expense_controller");

const router = express.Router();

// user routes
router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.get("/UserDetails/:userId", getUserDetails);

// Group routes
router.post("/createGroup", createGroup);
router.get("/GroupDetails/:userId", getGroupList);

// Expense routes
router.post("/createExpense", CreateExpense);
router.get("/ExpenseDetails/:userId/:groupId", getExpenseDetails);

module.exports = router;
