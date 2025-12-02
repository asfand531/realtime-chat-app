import express from "express";
import cors from "cors";
import messageRoutes from "./routes/message.js";
import { sql } from "./db.js";

const app = express();
const PORT = 8052;

// app.use(express.json());
app.use(express.text());
app.use(cors());
app.use("/", messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello there!");
});

app.get("/reset", (req, res) => {
  res.send("Your data has been reset!");
});

app.listen(PORT, () => {
  sql.connect((err) => {
    if (err) {
      console.log("Database connection failed!", err);
    } else {
      console.log("Database connected successfully!");
    }
  });

  console.log(`This app is running on http://localhost:${PORT}`);
});
