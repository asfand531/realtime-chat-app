import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, "config.yaml");

const config = yaml.load(fs.readFileSync(configPath, "utf8"));

export const SECRET_KEY = config.secrets.key;

export function authMiddleware(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // store user info
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
