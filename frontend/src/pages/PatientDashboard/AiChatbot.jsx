import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getAiChatResponse } from '../../services/apiService'; // Import our new function
import './AiChatbot.css';

const AiChatbot = () => {
  const { currentUser, prescriptions, medicinesDB } = useAppContext();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Hello, ${currentUser?.name}! As an AI assistant, I can provide general information. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to show a "thinking" message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Get the patient's current prescription details to send as context
    const userPrescriptions = prescriptions
      .filter(p => p.patientId === currentUser.id)
      .map(p => ({
        ...p,
        medicines: p.medicines.map(m => ({...m, name: medicinesDB.find(dbMed => dbMed.id === m.medicineId)?.name}))
      }));

    // Call the real API
    const botResponse = await getAiChatResponse(input, userPrescriptions);
    setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="chatbot-container">
      <h2>AI Assistant</h2>
      <div className="messages-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
};

export default AiChatbot;