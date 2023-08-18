const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const UserExpense = require("../models/UserExpense");
const UserGroup = require("../models/UserGroup");
const { Op } = require("sequelize");

/*
This api is used to get the expenses list of a group of a particular user
*/
const getExpenseDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const Expenses = await Expense.findAll({
      where: {
        GroupId: groupId,
      },
      attributes: ["ExpenseId", "Title", "Amount", "GroupId"],
      include: [
        {
          model: UserExpense,
          attributes: ["PaidBy", "paidTo", "amount"], // Include the attributes you need from UserExpense
          include: [
            {
              model: User,
              as: "PaidByUser", // Alias for the relationship
              attributes: ["userId", "userName", "location", "email"],
            },
            {
              model: User,
              as: "PaidToUser", // Alias for the relationship
              attributes: ["userId", "userName", "location", "email"],
            },
          ],
        },
      ],
    });
    const formattedExpenses = Expenses.map((expense) => ({
      ExpenseId: expense.ExpenseId,
      Title: expense.Title,
      Amount: expense.Amount,
      GroupId: expense.GroupId,
      PaidUser: expense.UserExpenses[0].PaidByUser,
      BorrowedUsers: expense.UserExpenses.map((userExpense) => ({
        // Include Amount from UserExpense
        userId: userExpense.PaidToUser?.userId,
        Amount: userExpense.amount,
        userName: userExpense.PaidToUser?.userName,
        location: userExpense.PaidToUser?.location,
        email: userExpense.PaidToUser?.email,
      })),
    }));

    // get user splits on this group

    // Fetch user details
    const user = await User.findByPk(userId);

    // Fetch UserExpenses where the user is either PaidByUser or PaidToUser
    const userExpenses = await UserExpense.findAll({
      where: {
        [Op.or]: [{ PaidBy: userId }, { paidTo: userId }],
        GroupId: groupId,
      },
      include: [
        { model: User, as: "PaidByUser" },
        { model: User, as: "PaidToUser" },
      ],
    });

    // Initialize credits and debts
    const credits = {};
    const debts = {};

    userExpenses.forEach((userExpense) => {
      console.log(userExpense.PaidBy, userExpense.PaidTo, userId);
      if (userExpense.PaidBy == userId) {
        // Credit to other user
        const otherUserId = userExpense.PaidTo;
        const otherUserName = userExpense.PaidToUser.userName;
        const otherUserEmail = userExpense.PaidToUser.email;

        credits[otherUserId] = credits[otherUserId] || {
          userName: otherUserName,
          email: otherUserEmail,
          amount: 0,
        };
        credits[otherUserId].amount += userExpense.amount;
      } else {
        // Debt from other user
        const otherUserId = userExpense.PaidBy;
        const otherUserName = userExpense.PaidByUser.userName;
        const otherUserEmail = userExpense.PaidByUser.email;

        debts[otherUserId] = debts[otherUserId] || {
          userName: otherUserName,
          email: otherUserEmail,
          amount: 0,
        };
        debts[otherUserId].amount += userExpense.amount;
      }
    });

    // Create userstats

    const userStats = {
      userName: user.userName,
      email: user.email,
      location: user.location,
      credits,
      debts,
    };

    response = {
      success: true,
      error: false,
      message: `Successfully Fetched Expense Data`,
      data: {
        Expenselist: formattedExpenses,
        userStatsIngroup: userStats,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("Error", error);
    response = {
      success: true,
      error: false,
      message: `Error while fetching user data ${error}`,
      data: {},
    };
    res.status(500).json(response);
  }
};

/*
This Api is Used to create a Expense
*/
const CreateExpense = async (req, res) => {
  try {
    /*
            Here expense creation takes place in mutiple steps :
            1. insert a expense into the expenses table
            2. Divide the amount among all the given paidusers
            3. map the divided amount (z) in User Expense table like user x paid to user y a z amount
        */
    console.log("uday", req.body);

    // step1
    const newExpense = {
      Title: req.body.Title,
      Amount: req.body.Amount,
      GroupId: req.body.GroupId,
    };

    const createdExpense = await Expense.create(newExpense);

    console.log("createdExpense", createdExpense);

    // step2

    const noOfUsers = req.body.PaidTo.length;
    const ActualAmount = req.body.Amount;

    const splittedAmount = ActualAmount / noOfUsers;

    const paidByUser = req.body.PaidBy;

    // step3

    userExpenseList = [];

    for (let user of req.body.PaidTo) {
      userExpenseList.push({
        ExpenseId: createdExpense.ExpenseId,
        PaidBy: paidByUser,
        PaidTo: user,
        GroupId: req.body.GroupId,
        amount: splittedAmount,
      });
    }

    const createdUserGroup = await UserExpense.bulkCreate(userExpenseList);
    console.log("createdUserGroup", createdUserGroup);
    response = {
      success: true,
      error: false,
      message: `Successfully Created Expense`,
      data: createdExpense,
    };
    res.status(201).json(response);
  } catch (error) {
    console.log("Error", error);
    response = {
      success: true,
      error: false,
      message: `Error while creating Expense ${error}`,
      data: {},
    };
    res.status(500).json(response);
  }
};

module.exports = {
  getExpenseDetails,
  CreateExpense,
};
