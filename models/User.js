const { Sequelize, DataTypes } = require('sequelize');
const db = require("./index");

const User = db.sequelize.define('User', {
  // Model attributes are defined here
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userName: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  }
});

module.exports = User;