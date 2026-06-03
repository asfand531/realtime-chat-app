import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "./authMiddleware.js";
import { sql } from "./db.js";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3020",
      credentials: true,
    },
  });

  const onlineUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`User ${userId} connected`);

    onlineUsers.set(userId, socket.id);

    socket.join(`user_${userId}`);

    sql.query("UPDATE users SET last_seen = NULL WHERE id = ?", [userId]);

    io.emit("user_online", { userId });

    sql.query(
      `SELECT conversationId FROM conversation_members WHERE userId = ?`,
      [userId],
      (err, rows) => {
        if (!err) {
          rows.forEach((row) => {
            socket.join(`conversation_${row.conversationId}`);
          });
        }
      },
    );

    socket.on("send_message", (payload) => {
      const {
        conversationId,
        content,
        type = "text",
        metadata = null,
      } = payload;

      if (!conversationId || !content) return;

      sql.query(
        `SELECT userId FROM conversation_members WHERE conversationId = ? AND userId = ?`,
        [conversationId, userId],
        (err, membership) => {
          if (err || membership.length === 0) {
            return socket.emit("error", {
              message: "Not a member of this conversation",
            });
          }

          const insertMessage = `
            INSERT INTO messages (conversationId, senderId, content, type, metadata)
            VALUES (?, ?, ?, ?, ?)
          `;

          sql.query(
            insertMessage,
            [
              conversationId,
              userId,
              content,
              type,
              metadata ? JSON.stringify(metadata) : null,
            ],
            (err, result) => {
              if (err) return console.error("Message insert error", err);

              const messageId = result.insertId;

              sql.query(
                `SELECT userId FROM conversation_members WHERE conversationId = ?`,
                [conversationId],
                (err, members) => {
                  if (err) return;

                  members.forEach((m) => {
                    sql.query(
                      `INSERT INTO message_receipts (messageId, userId) VALUES (?, ?)`,
                      [messageId, m.userId],
                    );
                  });

                  io.to(`conversation_${conversationId}`).emit("new_message", {
                    id: messageId,
                    conversationId,
                    senderId: userId,
                    senderName: socket.user.name,
                    content,
                    type,
                    metadata,
                    created_at: new Date(),
                  });
                },
              );
            },
          );
        },
      );
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit("typing", {
        userId,
        isTyping,
      });
    });

    socket.on("message_seen", ({ messageId, conversationId }) => {
      sql.query(
        `UPDATE message_receipts SET seen_at = ? WHERE messageId = ? AND userId = ?`,
        [new Date(), messageId, userId],
        (err) => {
          if (err) return console.error("message_seen update error", err);

          socket.to(`conversation_${conversationId}`).emit("message_seen", {
            messageId,
            seenBy: userId,
          });
        },
      );
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);

      onlineUsers.delete(userId);

      const lastSeen = new Date();
      sql.query("UPDATE users SET last_seen = ? WHERE id = ?", [
        lastSeen,
        userId,
      ]);

      io.emit("user_offline", { userId, lastSeen });
    });
  });

  return io;
}
