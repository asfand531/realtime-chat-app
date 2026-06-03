import express from "express";
import cors from "cors";
import { sql } from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import http from "http";
import { authMiddleware } from "./authMiddleware.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "./authMiddleware.js";
import { setupSocket } from "./socket.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3020",
    credentials: true,
  }),
);

app.use(cookieParser());
const PORT = 4000;

const server = http.createServer(app);
setupSocket(server);

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

const upload = multer({ storage: storage });

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
          if (err.code === "ER_DUP_ENTRY") {
            if (err.sqlMessage.includes("phoneNo")) {
              return res
                .status(400)
                .json({ message: "Phone number is already used" });
            }
            if (err.sqlMessage.includes("email")) {
              return res.status(400).json({ message: "Email is already used" });
            }
          }
          return res
            .status(500)
            .json({ message: "Server error. Please try again." });
        }
        return res.json({ success: true, message: "Registration successful" });
      },
    );
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const getInfo = `SELECT * FROM users WHERE email = ?`;

  sql.query(getInfo, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Server error. Please try again." });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Email required!" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email };

    const token = jwt.sign(userPayload, SECRET_KEY, { expiresIn: "1h" });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ message: "Success", token });
  });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    res.json({
      authenticated: true,
      user: decoded,
    });
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
    last_seen TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

sql.query(createUserQuery, (err) => {
  if (err) console.log("Users table creation error", err);
  else console.log("Users table ready!");
});

const conversationsTableQuery = `
  CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    is_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

sql.query(conversationsTableQuery, (err) => {
  if (err) console.error("Conversations table creation error: ", err);
  else console.log("Conversations table ready!");
});

const conversationMembersTableQuery = `
  CREATE TABLE IF NOT EXISTS conversation_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    userId INT NOT NULL,
    role ENUM('member','admin') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY conversation_user_unique (conversationId, userId)
  )
`;

sql.query(conversationMembersTableQuery, (err) => {
  if (err) console.error("Conversation members table creation error: ", err);
  else console.log("Conversation members table ready!");
});

const createMsgQuery = `
  CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    senderId INT NOT NULL,
    content TEXT,
    type ENUM('text','image','file','audio') DEFAULT 'text',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (conversationId, created_at)
  )
`;

sql.query(createMsgQuery, (err) => {
  if (err) console.error("Message table creation error: ", err);
  else console.log("Messages table ready!");
});

const messageReceiptsTableQuery = `
  CREATE TABLE IF NOT EXISTS message_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    messageId BIGINT NOT NULL,
    userId INT NOT NULL,
    delivered_at TIMESTAMP NULL,
    seen_at TIMESTAMP NULL,
    FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY message_user_unique (messageId, userId)
  )
`;

sql.query(messageReceiptsTableQuery, (err) => {
  if (err) console.error("Message receipts table creation error: ", err);
  else console.log("Message receipts table ready!");
});

app.post("/api/conversations", authMiddleware, (req, res) => {
  const { userId } = req.body;
  const currentUser = req.user.id;

  const findExistingQuery = `
    SELECT cm1.conversationId
    FROM conversation_members cm1
    JOIN conversation_members cm2 ON cm1.conversationId = cm2.conversationId
    JOIN conversations c ON c.id = cm1.conversationId
    WHERE cm1.userId = ?
      AND cm2.userId = ?
      AND c.is_group = FALSE
    LIMIT 1
  `;

  sql.query(findExistingQuery, [currentUser, userId], (err, existing) => {
    if (err) return res.status(500).json(err);

    if (existing.length > 0) {

      return res.json({ conversationId: existing[0].conversationId });
    }

    sql.query(
      "INSERT INTO conversations (is_group) VALUES (false)",
      (err, convoResult) => {
        if (err) return res.status(500).json(err);

        const convoId = convoResult.insertId;

        sql.query(
          `INSERT INTO conversation_members (conversationId, userId)
           VALUES (?, ?), (?, ?)`,
          [convoId, currentUser, convoId, userId],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ conversationId: convoId });
          },
        );
      },
    );
  });
});

app.get("/api/conversations", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.*
    FROM conversations c
    JOIN conversation_members cm ON cm.conversationId = c.id
    WHERE cm.userId = ?
  `;

  sql.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/conversations/:id/messages", authMiddleware, (req, res) => {
  const conversationId = req.params.id;

  const query = `
    SELECT m.*, u.name AS senderName
    FROM messages m
    JOIN users u ON u.id = m.senderId
    WHERE m.conversationId = ?
    ORDER BY m.created_at ASC
  `;

  sql.query(query, [conversationId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
});

app.get("/api/users", authMiddleware, (req, res) => {
  sql.query(
    "SELECT id, name, phoneNo, profileImage, email, last_seen, created_at FROM users",
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(result);
    },
  );
});

app.get("/api/user-images/:uid/:filename", (req, res) => {
  const { uid, filename } = req.params;
  const filePath = path.join(uploadRoot, uid, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(path.resolve(filePath));
});

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(500)
      .json({ message: "Error while uploading required file!" });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const { name, phoneNo } = req.body;

  const publicUrl = `${req.protocol}://${req.get("host")}/images/${req.fileUid}/${fileName}`;

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
          name,
          phoneNo,
          profileImage: publicUrl,
          message: "New user added!",
        });
      },
    );
  });
});

server.listen(PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${PORT}`);
});
