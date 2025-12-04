import mysql2 from "mysql2";

export const sql = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "bilal",
  database: "chat-app",
});

sql.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected!");
});
