const { Sequelize, DataTypes } = require('sequelize');
const db = require("./index");

const Group = db.sequelize.define('Group', {
  // Model attributes are defined here
  GroupId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  GroupName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  }
});

module.exports = Group;