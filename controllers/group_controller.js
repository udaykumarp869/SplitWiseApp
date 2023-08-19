const Group = require("../models/Group");
const User = require("../models/User");
const UserGroup = require("../models/UserGroup");
const { Op } = require("sequelize");

/*
This Api is used to get the groupList of a particular user
*/
const getGroupList = async (req, res) => {
  try {
    const userid = req.params.userId;
    const userGroupList = await UserGroup.findAll({
      where: {
        userId: userid,
      },
    });
    const groupListId = [];
    for (let group of userGroupList) {
      groupListId.push(group.GroupId);
    }
    const groupList = await Group.findAll({
      where: {
        GroupId: {
          [Op.in]: groupListId,
        },
      },
    });
    response = {
      success: true,
      error: false,
      message: `Successfully Fetched Group Data`,
      data: groupList,
    };
    res.status(200).json(response);
  } catch (error) {
    console.log("Error", error);
    response = {
      success: true,
      error: false,
      message: `Error while fetching user data ${error}`,
      data: [],
    };
    res.status(500).json(response);
  }
};

/*
This Api is used to create a group
*/
const createGroup = async (req, res) => {
  try {
    console.log("uday", req.body);
    const newGroup = {
      GroupName: req.body.GroupName,
    };
    const createdGroup = await Group.create(newGroup);
    const userIdList = req.body.users;
    const userGroupList = [];
    for (let id of userIdList) {
      userGroupList.push({
        GroupId: createdGroup.GroupId,
        UserId: id,
      });
    }
    const createdUserGroup = await UserGroup.bulkCreate(userGroupList);
    response = {
      success: true,
      error: false,
      message: `Successfully created Group`,
      response: {
        groupName: createdGroup.groupName,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    console.log("Error", error);
    response = {
      success: true,
      error: false,
      message: `Error while Creating group ${error}`,
      data: {},
    };
    res.status(500).json(response);
  }
};

module.exports = {
  getGroupList,
  createGroup,
};
