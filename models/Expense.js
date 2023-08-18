const { Sequelize, DataTypes, INTEGER } = require('sequelize');
const Group = require('./Group');
const db = require("./index");

const Expense = db.sequelize.define('Expense', {
  // Model attributes are defined here
  ExpenseId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Title: {
    type: DataTypes.STRING
  },
  Amount: {
    type: DataTypes.FLOAT
  },
  GroupId: {
    type: DataTypes.INTEGER,
    references: {
        model: Group,
        key: 'GroupId'
      }
  },
  paidBy: {
    type: DataTypes.INTEGER,
  }
});


module.exports = Expense;