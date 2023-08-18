const User = require("../models/User");
const bcrypt = require("bcrypt");
const UserExpense = require("../models/UserExpense");
const { Op } = require("sequelize");

/*
This Api is used to fetch user details along with the information of 
how much money is credited and debited for a given user 
*/
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user details
    const user = await User.findByPk(userId);

    // Fetch UserExpenses where the user is either PaidByUser or PaidToUser
    const userExpenses = await UserExpense.findAll({
      where: {
        [Op.or]: [{ PaidBy: userId }, { paidTo: userId }],
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

    let total_credit = 0;
    let total_debt = 0;

    for (let credit of Object.values(credits)) {
      total_credit = total_credit + credit.amount;
    }

    for (let debt of Object.values(debts)) {
      total_debt = total_debt + debt.amount;
    }
    // Create response
    const response = {
      success: true,
      error: false,
      message: `Successfully Fetched User Data`,
      data: {
        userName: user.userName,
        email: user.email,
        location: user.location,
        total_credit,
        total_debt,
        credits,
        debts,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("Error", error);
    const response = {
      success: false,
      error: true,
      message: `Error while fetching user data ${error}`,
      data: {},
    };
    res.status(500).json(response);
  }
};

/*
This Api is used to perform user signup , 
it also hashes the password before storing in db
*/
const userSignup = async (req, res) => {
  try {
    console.log("uday", req.body);
    // Check if the user already exists by userName
    const user = await User.findOne({
      where: {
        userName: req.body.userName,
      },
    });
    if (user) {
      // User already exists
      response = {
        success: false,
        error: true,
        message: `User already exists`,
        response: {},
      };
      res.status(409).json(response);
    } else {
      // Create a new user
      const salt = await bcrypt.genSalt(10);
      const newuser = {
        userName: req.body.userName,
        location: req.body.location,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
      };
      const created_user = await User.create(newuser);
      response = {
        success: true,
        error: false,
        message: `Successfully signed Up`,
        response: {
          userName: created_user.userName,
          email: created_user.email,
        },
      };
      res.status(201).json(response);
    }
  } catch (error) {
    console.log("Error", error);
    response = {
      success: true,
      error: false,
      message: `Error while signing up ${error}`,
      data: {},
    };
    res.status(500).json(response);
  }
};

/*
This Api is used to login the users by comapring the passwords
*/
const userSignin = async (req, res) => {
  try {
    response = {
      success: false,
      error: true,
    };
    const salt = await bcrypt.genSalt(10);
    const name = req.body.userName;
    const password = req.body.password;
    const user = await User.findOne({
      where: {
        userName: name,
      },
    });
    if (user) {
      console.log("user", user);
      let org_password = user.password;
      const password_valid = await bcrypt.compare(password, org_password);

      if (password_valid) {
        response.success = true;
        response.error = false;
        response.message = `successfully signed in`;
        response.data = {
          userId: user.userId,
          userName: user.userName,
          email: user.email,
        };
        res.status(200).json({ response });
      } else {
        response.message = `Password Incorrect`;
        response.data = {};
        res.status(400).json({ response });
      }
    } else {
      response.message = `User does not exist`;
      response.data = {};
      res.status(404).json(response);
    }
  } catch (error) {
    console.log("Error", error);
    response = {
      success: false,
      error: true,
      message: `Error while signing in ${error}`,
      response: {},
    };
    res.status(500).json(response);
  }
};

module.exports = {
  getUserDetails,
  userSignup,
  userSignin,
};
