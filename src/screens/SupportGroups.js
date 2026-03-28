import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { useNavigate } from 'react-router-dom';
import { TopBar, BottomNav } from '../components/Navigation';
import { supabase } from '../supabaseClient';
import '../styles/SupportGroups.css';

function generateAnonId() {
  return `साथी #${Math.floor(Math.random() * 400) + 1}`;
}

const formatTime = (isoString) => {
  if (!isoString) return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  return new Date(isoString).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const TOXIC_WORDS = ['stupid', 'idiot', 'dumb', 'hate', 'ugly', 'die', 'kill', 'paagal', 'mula', 'gadha', 'bitch', 'moron', 'worthless'];

function isToxic(text) {
  const normalized = text.toLowerCase();
  return TOXIC_WORDS.some(word => normalized.includes(word));
}

function SupportGroups() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [myAnonId] = useState(() => {
    const stored = localStorage.getItem('manasthiti-anon-id');
    if (stored) return stored;
    const id = generateAnonId();
    localStorage.setItem('manasthiti-anon-id', id);
    return id;
  });
  const messagesEndRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const [groups, setGroups] = useState([]);

  // Fetch Community Topics dynamically from the live Database
  useEffect(() => {
    async function fetchGroups() {
      try {
        const { data, error } = await supabase.from('support_group_topics').select('*');
        if (!error && data) {
          setGroups(data);
        }
      } catch (err) {
        console.error('Failed to fetch topics:', err);
      }
    }
    fetchGroups();
  }, []);

  // Fetch initial messages and subscribe to Realtime broadcast
  useEffect(() => {
    if (!selectedGroup) return;

    const timeoutId = setTimeout(() => {
      setConnectionError(true);
    }, 5000);

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('support_group_messages')
          .select('*')
          .eq('group_id', selectedGroup)
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (error) throw error;
        
        setMessages(data || []);
        clearTimeout(timeoutId);
        setConnectionError(false);
      } catch (err) {
        console.error('Supabase fetch error:', err);
        setConnectionError(true);
      }
    };

    fetchMessages();

    // Subscribe to new messages AND Supabase Presence tracking using Channels
    const channel = supabase.channel(`public:support_groups:${selectedGroup}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Count total unique clients sitting in this room purely dynamically
        setOnlineCount(Object.keys(state).length);
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_group_messages', filter: `group_id=eq.${selectedGroup}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Announce that we just physically entered this group chat
          await channel.track({ user: myAnonId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    if (isToxic(newMessage)) {
      alert(isEn ? "Let's keep this space safe. Please reconsider your wording." : "कृपया सम्मानजनक भाषा प्रयोग गर्नुहोस्।");
      return;
    }

    const optimisticText = newMessage;
    setNewMessage(''); // Clear input for snappy UI response

    const { error } = await supabase
      .from('support_group_messages')
      .insert([
        {
          group_id: selectedGroup,
          text_ne: optimisticText,
          text_en: optimisticText,
          sender_avatar: myAnonId,
        }
      ]);

    if (error) {
      console.error('Error sending message to Supabase:', error);
    }
  };

  // Group Selection View
  if (!selectedGroup) {
    return (
      <div className="groups-screen screen-with-nav">
        <TopBar title={isEn ? "Support Groups" : "सहायता समूह"} titleEn="Support Groups" showBack={false} />

        <div className="groups-intro">
          <h2 className="groups-intro-ne">{isEn ? 'Talk anonymously with peers' : 'तपाईं जस्तै अरूसँग कुरा गर्नुहोस्'}</h2>
          <p className="groups-safety-ne">🔒 {isEn ? 'Safe space · Complete anonymity' : 'सबै गोप्य · कुनै नाम छैन · सुरक्षित ठाउँ'}</p>
        </div>

        <div className="groups-list">
          {groups.map((group) => (
            <button
              key={group.id}
              className="group-card"
              onClick={() => setSelectedGroup(group.id)}
              style={{ borderLeftColor: 'var(--color-primary-sage)' }}
            >
              <div className="group-info">
                <h3 className="group-name-ne">{isEn ? group.title_en : group.title_ne}</h3>
                <p className="group-desc-ne">{group.icon} {isEn ? "Community Support Forum" : "सामुदायिक मञ्च"}</p>
              </div>
              <div className="group-meta">
                <span className="group-online">
                  <span className="online-dot" />
                  {isEn ? "Join Public Room" : "तुरुन्त सामेल हुनुहोस्"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Chat Room View
  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="chat-room-screen">
      <div className="chat-room-header">
        <button className="back-button" onClick={() => setSelectedGroup(null)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="chat-room-title">
          <span className="chat-room-name-ne">{isEn ? currentGroup?.title_en : currentGroup?.title_ne}</span>
        </div>
        <div className="chat-room-online">
          <span className="online-dot" />
          <span>{onlineCount} {isEn && 'online'}</span>
        </div>
      </div>

      <div className="chat-room-safety-banner">
        <span className="safety-banner-ne">{isEn ? 'This is a safe space. Please use respectful language.' : 'यो सुरक्षित ठाउँ हो। कृपया सम्मानजनक भाषा प्रयोग गर्नुहोस्।'}</span>
      </div>

      <div className="chat-messages">
        {connectionError && (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(196, 82, 42, 0.1)', color: 'var(--color-warm-terracotta)', borderRadius: '4px', margin: '1rem' }}>
            {isEn ? "Unable to connect to live messages. You might be offline." : "सन्देशहरू लोड गर्न सकिएन। तपाईं अफलाइन हुनुहुन्छ जस्तो छ।"}
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_avatar === myAnonId;
          return (
            <div key={msg.id} className={`chat-message ${isMe ? 'my-message' : 'peer-message'}`}>
              <div className="message-header">
                <span className="message-anon">{msg.sender_avatar}</span>
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
              <p className="message-text">
                {isEn && msg.text_en ? msg.text_en : msg.text_ne}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isEn ? "Type your message here..." : "यहाँ लेख्नुहोस्..."}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className={`chat-send ${newMessage.trim() ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SupportGroups;
