const { Sequelize, DataTypes } = require('sequelize');
const Group = require('./Group');
const db = require("./index");
const User = require('./User');
const Expense = require('./Expense');

const UserExpense = db.sequelize.define('UserExpense', {
  // Model attributes are defined here
  ExpenseId: {
    type: DataTypes.INTEGER,
  },
  PaidBy: {
    type: DataTypes.INTEGER,
  },
  PaidTo: {
    type: DataTypes.INTEGER,
  },
  GroupId: {
    type: DataTypes.INTEGER,
    references: {
        model: Group,
        key: 'GroupId'
      }
  },
  amount: {
    type: DataTypes.FLOAT
  }
});

Expense.hasMany(UserExpense, { foreignKey: 'ExpenseId' });
UserExpense.belongsTo(Expense, { foreignKey: 'ExpenseId' });
UserExpense.belongsTo(User, { as: 'PaidByUser', foreignKey: 'PaidBy' });
UserExpense.belongsTo(User, { as: 'PaidToUser', foreignKey: 'PaidTo' });


module.exports = UserExpense;