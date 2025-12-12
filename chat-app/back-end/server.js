import express from "express";
import cors from "cors";
import { sql } from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import http from "http";
import { authMiddleware } from "./authMiddleware.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "./authMiddleware.js";
import { setupWebSocket } from "./ws.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
const PORT = 4000;

const server = setupWebSocket(app);

const uploadRoot = path.join(process.cwd(), "uploadedImages");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot);
}

app.get("/api/check-auth", authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

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
  const { name, phone_no, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSignUpData = `
  INSERT INTO users (name, phoneNo, email, password) VALUES (?, ?, ?, ?)
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

  const getInfo = `SELECT * FROM users WHERE email = ?`;

  sql.query(getInfo, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(400).json({ error: "Email and password not found!" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

    // Send it as HTTP-ONLY COOKIE
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // Make true when using  HTTPS
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ message: "Success" });
  });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies.authToken;

  jwt.verify(token, SECRET_KEY, function (err, decoded) {
    if (err) {
      res.status(500).json({ message: "Token expired!" });
    }
    res.json({ message: "Success", decoded });
  });
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logged out" });
});

const createUserQuery = `
  CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phoneNo VARCHAR(50) UNIQUE NOT NULL,
  profileImage VARCHAR(500) DEFAULT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
  `;

sql.query(createUserQuery, (err, result) => {
  if (err) {
    console.log("Users table creation error", err);
    return;
  }
  console.log("Users table created successfully!");
});

const createMsgQuery = `
CREATE TABLE IF NOT EXISTS messages (
id INT AUTO_INCREMENT PRIMARY KEY,
senderId INT NOT NULL,
receiverId INT NOT NULL,
message TEXT,
type ENUM('text','image','file','audio') DEFAULT 'text',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
seen_at TIMESTAMP NULL DEFAULT NULL,
FOREIGN KEY (senderId) REFERENCES users(id),
FOREIGN KEY (receiverId) REFERENCES users(id)
)
`;

sql.query(createMsgQuery, (err, result) => {
  if (err) {
    console.error("Message table creation error: ", err);
  }
  console.log("Messages table created successfully!");
});

app.get("/api/messages/:userId", (req, res, next) => {
  const selectQuery = `
    SELECT * FROM messages
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    ORDER BY created_at ASC
  `;

  const { userId } = req.params;
  const currentUser = req.query.currentUserId;

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
  const { senderId, receiverId, message, type, created_at, seen_at } = req.body;

  const mysqlDate = created_at || new Date();

  const date = new Date(mysqlDate);

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  console.log("msg body>>> ", req);

  if (!senderId || !receiverId || !message)
    return res.status(400).json({ message: "Missing fields" });

  const sqlQuery = `
    INSERT INTO messages (senderId, receiverId, message, type)
    VALUES (?, ?, ?, ?)
  `;

  sql.query(
    sqlQuery,
    [senderId, receiverId, message, type, created_at, seen_at],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.json({
        success: true,
        result: { ...req.body, time: formattedTime, id: result.insertId },
      });
    }
  );
});

app.get("/api/users", authMiddleware, (req, res) => {
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

app.post("/api/upload", uplaod.single("file"), (req, res, next) => {
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

server.listen(PORT, () => {
  console.log(`Server + WebSocket running on the http://localhost:${PORT}`);
});
