const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
let genAI = null;
let model = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ Google Gemini AI initialized successfully");
  } else {
    console.warn("⚠️ GEMINI_API_KEY not set - AI features will be disabled");
  }
} catch (err) {
  console.error("❌ Failed to initialize Google Gemini AI:", err.message);
}

// Routes
const loanRoute = require("./routes/loan");
app.use("/loan", loanRoute);

// Gemini AI Chat Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!model) {
      return res.status(503).json({ error: "Google Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables." });
    }

    // Build the prompt with conversation history
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    const errorMessage = err.message || "Unknown Gemini API error";

    // Provide meaningful error messages
    if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("Invalid API key")) {
      return res.status(401).json({ error: "Invalid Google Gemini API key. Please check your GEMINI_API_KEY." });
    }
    if (err.message?.includes("quota") || err.message?.includes("limit")) {
      return res.status(429).json({ error: "Google Gemini API quota exceeded. Please try again later." });
    }
    if (err.message?.includes("blocked")) {
      return res.status(400).json({ error: "Response was blocked by safety filters. Please modify your query." });
    }

    res.status(500).json({ error: `AI service error: ${errorMessage}` });
  }
});

// Health check route
app.get("/api/ai-status", (req, res) => {
  if (model) {
    res.json({ aiEnabled: true, provider: "Google Gemini", model: "gemini-1.5-flash" });
  } else {
    res.json({ aiEnabled: false, provider: "Google Gemini", error: "Not configured - set GEMINI_API_KEY" });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 FinWise AI Backend is Running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});