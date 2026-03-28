import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav } from '../components/Navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import '../styles/Chat.css';

// Initialize Gemini API Keys
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_KEY_BACKUP = process.env.REACT_APP_GEMINI_API_KEY_BACKUP;

// Strict safety rails and personality tuning
const SYSTEM_PROMPT = `You are Phoenix, a highly compassionate and empathetic mental health companion for youth in Nepal. Your primary goal is to help users get through tough times and uncertainty.
RULES FOR PHOENIX:
1. NO NEGATIVITY: Always steer the conversation toward hope, resilience, and actionable micro-steps. Do not dwell on negativity.
2. EMPATHY FIRST: Provide deep validation and emotional support. Never use cold, clinical diagnosis language. You are a companion.
3. CRISIS PROTOCOL: If a user ever mentions suicide, extreme hopelessness, self-harm, or severe abuse, immediately tell them their safety is priority and give them the TPO Nepal Crisis Hotline: 1660-0102005.
4. LANGUAGE: Speak fluently in whatever language the user speaks to you (English or Nepali). Keep responses warm, concise, and structured.`;

function Chat() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeApiKey, setActiveApiKey] = useState(API_KEY || '');
  
  const recognitionRef = useRef(null);
  
  const lastMsgTime = useRef(0);
  const messagesEndRef = useRef(null);
  const chatSessionRef = useRef(null);

  useEffect(() => {
    // Initialize Gemini Chat Session with System Prompt
    try {
      if (!activeApiKey) {
        console.warn('Gemini API Key is missing. Chat will not function fully.');
      }
      
      const genAI = new GoogleGenerativeAI(activeApiKey || '');
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }]
        }
      });

      const storedHistory = JSON.parse(localStorage.getItem('manasthiti-phoenix-chat') || '[]');
      
      // Map existing history to Gemini structured format (user vs model)
      const geminiHistory = storedHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      chatSessionRef.current = model.startChat({
        history: geminiHistory,
        generationConfig: {
          maxOutputTokens: 250, // Force concise, manageable companion responses
          temperature: 0.7,     // High enough for empathy, low enough to stay on rail
        }
      });

      if (storedHistory.length > 0) {
        setMessages(storedHistory);
      } else {
        const greeting = {
          id: 1,
          sender: 'phoenix',
          text: isEn 
            ? "Namaste! I'm Phoenix. How are you feeling today? I am here to help you navigate whatever is on your mind." 
            : "नमस्ते! म फिनिक्स हुँ। तपाईंलाई कस्तो लागिरहेको छ आज? म तपाईंलाई सुन्न र मद्दत गर्न यहाँ छु।",
          time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
        setMessages([greeting]);
      }
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }, [isEn, activeApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Strict Rate Limiter: Prevent spamming over 3 seconds or sending while it types
    const now = Date.now();
    if (now - lastMsgTime.current < 3000) {
      setRateLimitWarning(true);
      setTimeout(() => setRateLimitWarning(false), 3000);
      return;
    }
    lastMsgTime.current = now;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    localStorage.setItem('manasthiti-phoenix-chat', JSON.stringify(newMessages.slice(-50)));
    
    const promptText = input;
    setInput('');
    setIsTyping(true);
    setRateLimitWarning(false);

    try {
      if (!activeApiKey || !chatSessionRef.current) {
        throw new Error("Missing Gemini API Key or Session not initialized");
      }
      
      let responseText = '';
      
      try {
        const result = await chatSessionRef.current.sendMessage(promptText);
        responseText = result.response.text();
      } catch (geminiError) {
        console.error('Gemini API Error Defaulting:', geminiError);
        
        // Automatic Network Failover Logic
        if (activeApiKey === API_KEY && API_KEY_BACKUP) {
          console.warn("Primary API Key failed. Failing over to Backup Key...");
          setActiveApiKey(API_KEY_BACKUP); // Set hooks for future renders
          
          // Ad-hoc run to save the current message without waiting for useEffect loop
          const backupGenAI = new GoogleGenerativeAI(API_KEY_BACKUP);
          const backupModel = backupGenAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] }});
          
          const rawHistory = JSON.parse(localStorage.getItem('manasthiti-phoenix-chat') || '[]');
          const backupHistory = rawHistory.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
          
          const backupSession = backupModel.startChat({ history: backupHistory, generationConfig: { maxOutputTokens: 250, temperature: 0.7 }});
          const backupResult = await backupSession.sendMessage(promptText);
          responseText = backupResult.response.text();
        } else {
          throw geminiError; // Propagate crash if we are already on backup or don't have one
        }
      }

      const phoenixMsg = {
        id: Date.now() + 1,
        sender: 'phoenix',
        text: responseText,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isCrisis: /1660-?0102005|suicide|self[- ]?harm|आत्महत्या|आत्म[- ]?हानि|crisis|hotline|emergency/i.test(responseText)
      };

      setMessages(prev => {
        const updated = [...prev, phoenixMsg];
        localStorage.setItem('manasthiti-phoenix-chat', JSON.stringify(updated.slice(-50)));
        return updated;
      });
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'phoenix',
        text: isEn ? "I am having trouble connecting to my service right now. Please try again in a moment." : "अहिले प्रणालीमा केही समस्या छ। कृपया केहीछिन पछि प्रयास गर्नुहोस्।",
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = isEn ? 'en-US' : 'ne-NP';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };
    recognition.start();
  };

  return (
    <div className="ai-chat-screen">
      <div className="ai-chat-header">
        <div className="phoenix-avatar">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="ai-chat-title">
          <span className="ai-chat-name-ne">{isEn ? 'Phoenix · Your companion' : 'फिनिक्स'}</span>
        </div>
        <div className="ai-chat-status">
          <span className="online-dot" />
          <span>Online</span>
        </div>
      </div>

      <div className="ai-chat-disclaimer" style={{position: 'relative'}}>
        <span className="disclaimer-ne">{isEn ? 'Phoenix is an AI companion to help you through tough times, not a clinical therapist.' : 'फिनिक्स AI साथी हो, चिकित्सक होइन।'}</span>
        
        {/* Rate Limiting Overlap Banner */}
        {rateLimitWarning && (
           <div style={{position:'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--color-warm-terracotta)', color: 'white', display:'flex', alignItems:'center', justifyContent:'center', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem'}}>
             {isEn ? 'Please wait a moment before sending.' : 'कृपया केही सेकेन्ड पर्खनुहोस्।'}
           </div>
        )}
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg) => (
           <div key={msg.id} className={`ai-msg ${msg.sender === 'user' ? 'ai-msg-user' : 'ai-msg-phoenix'} ${msg.isCrisis ? 'ai-msg-crisis' : ''}`}>
            {msg.sender === 'phoenix' && (
              <div className="ai-msg-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            )}
            <div className="ai-msg-bubble">
              {msg.sender === 'user' ? (
                <p className="ai-msg-text">{msg.text}</p>
              ) : (
                <div className="ai-msg-text-ne phoenix-markdown" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
              {msg.isCrisis && (
                <a href="tel:1660-0102005" className="ai-crisis-btn" style={{marginTop:'8px', display:'block'}}>
                  📞 TPO Nepal: 1660-0102005
                </a>
              )}
              <span className="ai-msg-time">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-msg ai-msg-phoenix">
            <div className="ai-msg-avatar">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
               </svg>
            </div>
            <div className="ai-msg-bubble typing">
              <span className="typing-dots">
                <span /><span /><span />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-bar">
        <button 
          className="ai-chat-mic"
          onClick={toggleListen}
          title={isEn ? "Talk to Phoenix" : "फिनिक्ससँग बोल्नुहोस्"}
          aria-label={isEn ? "Voice input" : "आवाज इनपुट"}
          style={{ background: 'none', border: 'none', color: isListening ? '#C4522A' : '#1B1F5E', cursor: 'pointer', marginRight: '8px', padding: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isListening ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <textarea
          className="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isEn ? "Tell Phoenix..." : "फिनिक्सलाई भन्नुहोस्..."}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isTyping}
        />
        <button
          className={`ai-chat-send ${input.trim() && !isTyping ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default Chat;
