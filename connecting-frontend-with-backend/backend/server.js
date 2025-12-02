import mysql from "mysql";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors());

app.get("/v1/api/message", (req, res) => {
  res.json({ message: "Hello, from Express backend!" });
});

// app.use((req, res) => {
//   res
//     .status(404)
//     .json({ error: "Wrong path. Please watch your URL and try again!" });
// });

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bilal",
  database: "testDB",
});

app.get("/table", (req, res) => {
  const createQuery = `
 CREATE TABLE IF NOT EXISTS person (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  age INT
)
  `;
  connection.query(createQuery, (err, result) => {
    if (err) {
      console.error("Error: ", err);
      return;
    }
    res.json({ message: "Table created successfully", result });
  });
});

connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected Successfully!");
});

app.post("/table", (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Content-Type is invalid",
      req: req.get("Content-Type"),
    });
  }

  const { name, dob, age } = req.body;

  connection.query(
    "INSERT INTO person (name, dob, age) VALUES (?, ?, ?)",
    [name, dob, age],
    (err, result) => {
      if (err) {
        console.log("Error : ", err);
        return res.status(500).json({ message: err.sqlMessage });
      }
    }
  );
  connection.query("select * from person", (err, result) => {
    if (err) {
      console.log("Error : ", err);
      return res.status(500).json({ message: err.sqlMessage });
    }
    return res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
