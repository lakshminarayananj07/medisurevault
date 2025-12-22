import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
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

  if (!currentUser) return <div style={{padding:'20px'}}>Loading...</div>;

  // --- INTERNAL STYLES ---
  const styles = {
    // 1. Page Container
    pageContainer: { 
        height: 'calc(100vh - 60px)', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        boxSizing: 'border-box', 
        fontFamily: "'Poppins', sans-serif", 
        gap: '20px', 
        overflow: 'hidden',
        paddingBottom: '20px'
    },
    
    // 2. Header
    topRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        flexShrink: 0,
        boxSizing: 'border-box'
    },
    
    headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    headerIcon: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '12px', borderRadius: '12px', fontSize: '24px', display: 'flex' },
    headerTitle: { margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' },
    headerSubtitle: { margin: 0, fontSize: '14px', color: '#64748b' },

    // 3. Content Panel (The Chat Window)
    contentPanel: { 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden', 
        width: '100%',
        backgroundColor: '#ffffff', 
        borderRadius: '20px',       
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
    },

    // 4. Messages Area
    messagesWindow: {
        flex: 1,
        overflowY: 'auto',
        padding: '30px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },

    // 5. Message Bubbles
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        maxWidth: '80%'
    },
    userRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    botRow: { alignSelf: 'flex-start' },

    avatar: {
        width: '40px', height: '40px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
        flexShrink: 0
    },
    botAvatar: { backgroundColor: '#e0f2fe', color: '#0284c7' },
    userAvatar: { backgroundColor: '#f1f5f9', color: '#475569' },

    bubble: {
        padding: '14px 18px', borderRadius: '18px', fontSize: '0.95rem',
        lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'relative'
    },
    userBubble: {
        backgroundColor: '#0f172a', color: 'white', borderBottomRightRadius: '4px'
    },
    botBubble: {
        backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px'
    },

    // 6. Input Area
    inputArea: {
        padding: '20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    form: { display: 'flex', gap: '12px' },
    input: {
        flexGrow: 1, padding: '15px', backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1', color: '#334155', borderRadius: '12px',
        fontSize: '1rem', outline: 'none'
    },
    sendBtn: {
        backgroundColor: '#2563eb', color: 'white', border: 'none', width: '55px',
        borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.2rem', transition: 'background-color 0.3s'
    },
    disclaimer: {
        fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
    },

    // Typing Animation Dots
    typingDot: {
        height: '6px', width: '6px', backgroundColor: '#94a3b8', borderRadius: '50%',
        display: 'inline-block', margin: '0 2px'
    }
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
        
        {/* HEADER */}
        <div style={styles.topRow}>
          <div style={styles.headerContent}>
            <div style={styles.headerIcon}><FaBrain /></div>
            <div>
              <h1 style={styles.headerTitle}>AI Health Assistant</h1>
              <p style={styles.headerSubtitle}>Ask questions about your medication and health</p>
            </div>
          </div>
        </div>

        {/* CHAT INTERFACE */}
        <div style={styles.contentPanel}>
            
            {/* MESSAGES */}
            <div style={styles.messagesWindow}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{...styles.messageRow, ...(msg.sender === 'user' ? styles.userRow : styles.botRow)}}>
                        <div style={{...styles.avatar, ...(msg.sender === 'ai' ? styles.botAvatar : styles.userAvatar)}}>
                            {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                        </div>
                        <div style={{...styles.bubble, ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)}}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div style={{...styles.messageRow, ...styles.botRow}}>
                        <div style={{...styles.avatar, ...styles.botAvatar}}><FaRobot /></div>
                        <div style={{...styles.bubble, ...styles.botBubble, padding: '10px 16px', display:'flex', alignItems:'center'}}>
                            <span style={styles.typingDot} className="typing-dot"></span>
                            <span style={styles.typingDot} className="typing-dot"></span>
                            <span style={styles.typingDot} className="typing-dot"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div style={styles.inputArea}>
                <form onSubmit={handleSend} style={styles.form}>
                    <input 
                        type="text" 
                        placeholder="Type your health question..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.sendBtn}>
                        <FaPaperPlane />
                    </button>
                </form>
                <div style={styles.disclaimer}>
                    <FaInfoCircle /> AI responses are for informational purposes only. Consult a doctor for medical advice.
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default AiChatbot;