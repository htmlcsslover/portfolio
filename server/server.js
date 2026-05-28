import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolioData.json");

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173",
  credentials: true
}));

// API: Get portfolio details
app.get("/api/portfolio", async (req, res) => {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);
  } catch (error) {
    console.error("Error reading portfolio data:", error);
    res.status(500).json({ error: "Failed to read portfolio details" });
  }
});

// Serve frontend assets in production environment
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Portfolio Express backend running in development mode.");
  });
}

app.listen(PORT, () => {
  console.log(`Server executing at http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});
