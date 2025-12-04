import express from "express";
import cors from "cors";
import { sql } from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express();
const PORT = 4000;
dotenv.config();

app.use(express.json());
app.use(cors());
const SECRET_KEY = process.env.JWT_SECRET_KEY;
// console.debug("Secret Key: ", SECRET_KEY);

const uploadRoot = path.join(process.cwd(), "uploadedImages");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot);
}

app.use("/images", express.static(uploadRoot));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uniqueId = Date.now().toString("16");

    // const folder = `uploadedImages/${uniqueId}`;
    const folder = path.join(uploadRoot, uniqueId);

    try {
      await fs.promises.mkdir(folder, { recursive: true });
      req.savedFolder = folder;
      req.fileUid = uniqueId;

      cb(null, folder);
    } catch (error) {
      cb(error, null);
    }
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uplaod = multer({ storage: storage });

app.post("/api/sign_up", async (req, res) => {
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

  sql.query(registerTable, (err) => {
    if (err) console.log("Table creation error:", err.message);
  });

  const { name, phone_no, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSignUpData = `
  INSERT INTO sign_up (name, phone_no, email, password) VALUES (?, ?, ?, ?)
  `;

    sql.query(
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

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const getInfo = `SELECT * FROM sign_up WHERE email = ?`;

  sql.query(getInfo, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(400).json({ error: "Email not found!" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        phone_no: user.phone_no,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Success", token });
  });
});

app.get("/api/table", (req, res, next) => {
  const createQuery = `
  CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  phoneNo VARCHAR(50) NOT NULL,
  profileImage VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
  `;

  sql.query(createQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json({ message: "Table created successfully", result });
  });
});

app.get("/api/messages/:userId", (req, res, next) => {
  const createQuery = `
  CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  message TEXT,
  type ENUM('text','image','file','audio') DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (receiverId) REFERENCES users(id)
)
  `;

  const selectQuery = `
    SELECT * FROM messages 
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    ORDER BY created_at ASC
  `;

  const { userId } = req.params;
  const currentUser = req.query.currentUserId;

  sql.query(createQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    // res.json({ message: "Messages table created successfully", result });
  });

  sql.query(
    selectQuery,
    [currentUser, userId, userId, currentUser],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.json(result);
    }
  );
});

app.post("/api/messages", (req, res) => {
  const { senderId, receiverId, message, type } = req.body;
  const insertQuery = `INSERT INTO messages (senderId, receiverId, message, type) VALUES (?, ?, ?, ?)`;
  sql.query(
    insertQuery,
    [senderId, receiverId, message, type],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: result.insertId, senderId, receiverId, message, type });
    }
  );
});

app.get("/api/users", (req, res) => {
  sql.query("SELECT * from users", (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    console.log(result);
    res.json(result);
  });
});

app.get("/api/user-images/:uid/:filename", (req, res) => {
  const { uid, filename } = req.params;
  const filePath = path.join("uploads", uid, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(path.resolve(filePath));
});

app.get("/api/messages", (req, res) => {
  sql.query(`INSERT INTO users`);
});

app.post("/api/upload", uplaod.single("file"), (req, res, next) => {
  axios
    .get("http://localhost:4000/table")
    .then(console.log)
    .catch(console.error);
  if (!req.file) {
    return res
      .status(500)
      .json({ message: "Error while uploading required file!" });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const { name, phoneNo } = req.body;

  const publicUrl = `${req.protocol}://${req.get("host")}/images/${
    req.fileUid
  }/${fileName}`;

  fs.readFile(filePath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: `Error reading file ${err.message}` });
    }

    sql.query(
      "INSERT INTO users (name, phoneNo, profileImage) VALUES (?, ?, ?)",
      [name, phoneNo, publicUrl],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: `Error while saving the image ${err.message}` });
        }
        res.json({
          name: name,
          phoneNo: phoneNo,
          profileImage: publicUrl,
          message: "New user added!",
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`App running on the http://localhost:${PORT}`);
});
