import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../../hooks/useAppContext';
import { FaRobot, FaPaperPlane, FaUser, FaBrain, FaInfoCircle } from 'react-icons/fa';

const AiChatbot = () => {
  const { currentUser } = useAppContext();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'there'}! I am your MediSure Health Assistant. How can I help you today?`,
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message to UI
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Send Request to YOUR Backend (MediSure Server)
      // Note: We point to /api/chat now
      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send the conversation history + new message
          conversation: [
            ...messages.filter(m => m.sender === 'user'), // Send only user context to save tokens, or send all if you want chat memory
            userMsg
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Server Error");

      // 3. Add AI Response to UI
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.answer || "I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMsg = {
        id: Date.now() + 2,
        sender: 'ai',
        text: "I am having trouble connecting to the server. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!currentUser) return <div style={{padding:'20px'}}>Loading...</div>;

  // --- STYLES (Your Original MediSure Styles) ---
  const styles = {
    pageContainer: { height: 'calc(100vh - 60px)', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px', fontFamily: "'Poppins', sans-serif" },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px', fontSize: '24px', display:'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },
    contentPanel: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    messagesWindow: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' },
    messageRow: { display: 'flex', gap: '12px', maxWidth: '80%', alignItems: 'flex-end' },
    userRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    botRow: { alignSelf: 'flex-start' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    botAvatar: { backgroundColor: '#e0f2fe', color: '#0284c7' },
    userAvatar: { backgroundColor: '#f1f5f9', color: '#475569' },
    bubble: { padding: '14px 18px', borderRadius: '18px', fontSize: '0.95rem', lineHeight: '1.5' },
    userBubble: { backgroundColor: '#0f172a', color: 'white', borderBottomRightRadius: '4px' },
    botBubble: { backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px' },
    inputArea: { padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#fff' },
    form: { display: 'flex', gap: '12px' },
    input: { flexGrow: 1, padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' },
    sendBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', width: '55px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
    disclaimer: { fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' },
    typingDot: { height: '6px', width: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', margin: '0 2px' },
  };

  return (
    <>
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .typing-dot { animation: wave 1.3s infinite; }
        .typing-dot:nth-child(2) { animation-delay: -1.1s; }
        .typing-dot:nth-child(3) { animation-delay: -0.9s; }
        @keyframes wave {
            0%, 60%, 100% { transform: initial; }
            30% { transform: translateY(-5px); }
        }
      `}</style>
    <div style={styles.pageContainer}>
      <div style={styles.topRow}>
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}><FaBrain /></div>
          <div>
            <h1 style={styles.headerTitle}>AI Health Assistant</h1>
            <p style={styles.headerSubtitle}>Ask questions about your medication and health</p>
          </div>
        </div>
      </div>

      <div style={styles.contentPanel}>
        <div style={styles.messagesWindow}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ ...styles.messageRow, ...(msg.sender === 'user' ? styles.userRow : styles.botRow) }}>
              <div style={{ ...styles.avatar, ...(msg.sender === 'ai' ? styles.botAvatar : styles.userAvatar) }}>
                {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
              </div>
              <div style={{ ...styles.bubble, ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble) }}>
                {msg.sender === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ ...styles.messageRow, ...styles.botRow }}>
              <div style={{ ...styles.avatar, ...styles.botAvatar }}><FaRobot /></div>
              <div style={{ ...styles.bubble, ...styles.botBubble, display:'flex', alignItems:'center', padding:'15px' }}>
                <span className="typing-dot" style={styles.typingDot}></span>
                <span className="typing-dot" style={styles.typingDot}></span>
                <span className="typing-dot" style={styles.typingDot}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <form onSubmit={handleSend} style={styles.form}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health question..."
              style={styles.input}
              disabled={isTyping}
            />
            <button type="submit" style={styles.sendBtn} disabled={isTyping}>
              <FaPaperPlane />
            </button>
          </form>

          <div style={styles.disclaimer}>
            <FaInfoCircle /> AI responses are for informational purposes only. Consult a doctor for advice.
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AiChatbot;