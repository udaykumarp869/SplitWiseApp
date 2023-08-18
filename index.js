var express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");

const port = 2000;

var app = express();

const db = require("./models/index");
const User = require("./models/User");
const Group = require("./models/Group");
const Expense = require("./models/Expense");
const UserGroup = require("./models/UserGroup");
const UserExpense = require("./models/UserExpense");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("syncing db");
  })
  .catch((err) => {
    console.log("error", err);
  });

app.use("/", router);

app.listen(port, () => {
  console.log("server started");
});
