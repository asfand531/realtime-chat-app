import express from "express";
import cors from "cors";
import mysql from "mysql";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcrypt";
import path from "path";

const app = express();
const PORT = 2030;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uniqueId = Date.now().toString("16");

    // const folder = path.join("uploads", uniqueId);
    const folder = `uploads/${uniqueId}`;

    try {
      await fs.promises.mkdir(folder, { recursive: true });

      req.savedFolder = folder; // Save for later use (DB)
      req.fileUid = uniqueId;

      cb(null, folder);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bilal",
  database: "testDB",
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const getInfo = `SELECT * from sign_up where email = ?`;

  db.query(getInfo, [email, password], async (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });

    if (result.length === 0)
      return res.status(500).json({ error: "Record not found!" });
    const hashedPassword = result.find((item) => item.email === email);
    if (hashedPassword) {
      const comparePassword = await bcrypt.compare(
        password,
        hashedPassword.password
      );
      if (comparePassword) {
        res.json({ message: "success" });
      } else {
        res.json({ message: "Info not matched" });
      }
    }
  });
});

const registerTable = `
  CREATE TABLE IF NOT EXISTS sign_up (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(registerTable, (err) => {
  if (err) console.log("Table creation error:", err.message);
});

app.post("/api/sign_up", async (req, res) => {
  const { name, phone_no, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSignUpData = `
  INSERT INTO sign_up (name, phone_no, email, password) VALUES (?, ?, ?, ?)
  `;

    db.query(
      insertSignUpData,
      [name, phone_no, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err.sqlMessage });
        }
        return res.json({ success: true });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/table", (req, res, next) => {
  const query = `CREATE TABLE IF NOT EXISTS table_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error: ", err);
      return;
    }
    res.json({ message: "Table created successfully", result });
  });
});

app.post("/api/upload", upload.single("file"), (req, res, next) => {
  if (!req.file) {
    return res.json({ message: "Error" });
  }
  const filePath = req.file.path;
  console.log("File path: ", filePath);

  fs.readFile(filePath, (err) => {
    if (err) {
      return res.status(500).send("Error reading file" + err.message);
    }

    db.query(
      "INSERT INTO table_image (image) values (?)",
      [filePath],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .send("Error in saving the image file" + err.message);
        }
        res.send("Image uploaded to DB successfully!");
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Connected @ http://localhost:${PORT}`);
});
