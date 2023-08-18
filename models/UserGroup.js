const { Sequelize, DataTypes } = require('sequelize');
const Group = require('./Group');
const db = require("./index");
const User = require('./User');

const UserGroup = db.sequelize.define('UserGroup', {
  // Model attributes are defined here
  UserId: {
    type: DataTypes.INTEGER,
    references: {
        model: User,
        key: 'UserId'
      }
  },
  GroupId: {
    type: DataTypes.INTEGER,
    references: {
        model: Group,
        key: 'GroupId'
      }
  },
});


module.exports = UserGroup;