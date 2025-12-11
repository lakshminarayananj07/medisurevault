import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './AIChatbot.css'; // <--- FIXED: Using its own file
import { FaRobot, FaPaperPlane, FaUser, FaBrain, FaInfoCircle } from 'react-icons/fa';

const AiChatbot = () => {
  const { currentUser } = useAppContext();
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: `Hello ${currentUser?.name || 'there'}! I am your MediSure Health Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: "I am a demo AI. I can help you understand your prescriptions or remind you about medications!" 
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (!currentUser) return <div className="loading-state">Loading...</div>;

  return (
    // FULL WIDTH PAGE CONTAINER
    <div className="chatbot-page">
      
      {/* HEADER */}
      <div className="chatbot-header">
        <div className="header-icon"><FaBrain /></div>
        <div className="header-text">
          <h1>AI Health Assistant</h1>
          <p>Ask questions about your medication and health</p>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="chatbot-content">
        <div className="chat-interface">
          
          {/* MESSAGES WINDOW */}
          <div className="messages-window">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                <div className="avatar">
                  {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-row bot-row">
                <div className="avatar"><FaRobot /></div>
                <div className="message-bubble typing">
                  <span>•</span><span>•</span><span>•</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <div className="message-input-area">
            <form onSubmit={handleSend} className="message-form">
              <input 
                type="text" 
                placeholder="Type your health question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit">
                <FaPaperPlane />
              </button>
            </form>
            <div className="disclaimer">
              <FaInfoCircle /> AI responses are for informational purposes only. Consult a doctor for medical advice.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiChatbot;