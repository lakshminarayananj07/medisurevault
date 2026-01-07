const express = require('express');
const router = express.Router();
const { ChatGroq } = require("@langchain/groq");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Initialize Groq Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

router.post('/', async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: "Invalid conversation format" });
    }

    // 1. Define the AI Persona
    const systemInstruction = new SystemMessage(
      "You are a helpful medical assistant for an app called MediSure. " +
      "Keep answers concise (max 3 sentences). " +
      "Always advise users to consult a real doctor for medical advice."
    );

    // 2. Convert history to LangChain format
    // We filter out any previous AI messages to prevent confusion, or you can map them too.
    // For simplicity here, we map user text to HumanMessage.
    const messages = [
        systemInstruction,
        ...conversation.map(msg => new HumanMessage(msg.text)) 
    ];

    // 3. Get Response
    const result = await model.invoke(messages);

    res.json({ answer: result.content });
  } catch (err) {
    console.error("AI Server Error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

module.exports = router;