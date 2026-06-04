import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const SECRET_KEY = process.env.SECRET_KEY;

export function authMiddleware(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
