module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "Uk@1234567",
  DB: "splitwisedb",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
