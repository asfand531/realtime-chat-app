import mysql from "mysql";

export const sql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bilal",
  database: "demo_chat",
});
