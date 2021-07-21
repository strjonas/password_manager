let pool;

const mariadb = require("mariadb");
pool = mariadb.createPool({
  host: "server6.febas.net",
  user: "jonas",
  port: 3306,
  password: "#JonasDatabase00",
  database: "react-website-home",
  connectionLimit: 10,
});

module.exports = pool;
