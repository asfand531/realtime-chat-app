import express from "express";
import { sql } from "../db.js";

const router = express.Router();

router.get("/messages", (req, res) => {
  const query = "SELECT * FROM demo_messages";
  sql.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(results);
  });
});

router.post("/send-message", (req, res) => {
  console.log(req);
  if (!req.body) {
    return res.status(400).json({ error: "Bad Request" });
  }
  const query = "INSERT INTO demo_messages (text) VALUES (?)";
  sql.query(query, [req.body], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else {
      return res.json({ success: true, id: result.insertId });
    }
  });
});

router.delete("/messages/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM demo_messages WHERE id = ?";
  sql.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: "Deleted successfully", id });
  });
});

router.put("/messages/:id", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const query = "UPDATE demo_messages SET text = ? WHERE id = ?";
  sql.query(query, [id, text], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: "Updated successfully", id, updatedText: text });
  });
});

export default router;
