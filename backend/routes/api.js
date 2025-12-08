const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  try {
    const { message, prescriptions } = req.body;

    // V V V THIS IS THE ONLY LINE YOU NEED TO CHANGE V V V
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

    const prompt = `
      You are a helpful AI assistant for a patient using the MediSure Vault app.
      Your name is MediBot.
      
      IMPORTANT RULE: You must always include this disclaimer at the end of your response: "Disclaimer: I am an AI assistant and not a medical professional. Please consult your doctor for any medical advice."
      
      The patient's current prescriptions are: ${JSON.stringify(prescriptions)}.
      
      The patient's question is: "${message}"

      Please provide a helpful, safe, and general response based on this information.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

module.exports = router;