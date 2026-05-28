import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Initialize dotenv configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const PORTFOLIO_FILE = path.join(DATA_DIR, "portfolioData.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Ensure directory and messages file exist
async function ensureDataSetup() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(MESSAGES_FILE);
    } catch {
      await fs.writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error("Data setup error:", error);
  }
}
ensureDataSetup();

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

// API: Contact submission
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validations
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message content is required." });
  }

  const newMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Save to local data store (messages.json)
    let messages = [];
    try {
      const messagesData = await fs.readFile(MESSAGES_FILE, "utf-8");
      messages = JSON.parse(messagesData);
    } catch (readError) {
      console.warn("Could not read messages file, resetting layout:", readError);
    }
    
    messages.push(newMessage);
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log(`Saved new contact form message from ${email}`);

    // 2. Send email via SMTP if configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_RECEIVER } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_RECEIVER) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || "587"),
          secure: parseInt(SMTP_PORT || "587") === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"${name}" <${SMTP_USER}>`,
          replyTo: email,
          to: CONTACT_RECEIVER,
          subject: `Portfolio Message from ${name}`,
          text: `You received a message on your portfolio:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="color: #8b5cf6;">New Portfolio Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Email alert dispatched successfully.");
      } catch (mailError) {
        console.error("Nodemailer failed to send notification:", mailError);
        // Do not fail the endpoint response since the local write succeeded
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: "Thank you! Your message has been received successfully." 
    });

  } catch (err) {
    console.error("Error writing contact message:", err);
    return res.status(500).json({ error: "Failed to process your message. Please try again later." });
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
