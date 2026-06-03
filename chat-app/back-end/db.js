import mysql2 from "mysql2";

export const sql = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "bilal",
  database: "chat-app",
  port: 3306,
});

sql.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected!");

  sql.query("CREATE DATABASE IF NOT EXISTS `chat-app`", (err) => {
    if (err) throw err;
    console.log("Database chat-app exists or created!");

    sql.changeUser({ database: "chat-app" }, (err) => {
      if (err) throw err;
      console.log("Database switched to chat-app");
    });
  });
});
