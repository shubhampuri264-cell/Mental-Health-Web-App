import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TopBar, BottomNav } from '../components/Navigation';
import '../styles/design-tokens.css';

function Profile() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    try {
      // By using updateUser, we preserve the existing Anon ID and its data!
      const { data, error } = await supabase.auth.updateUser({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      setStatusMsg(isEn ? "Successfully upgraded account! Please check your email to verify." : "खाता सफलतापूर्वक अद्यावधिक भयो! कृपया आफ्नो इमेल जाँच गर्नुहोस्।");
      setUser(data.user);
    } catch (err) {
      console.error(err);
      setStatusMsg(err.message || "Failed to upgrade account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // After sign out, redirect to landing, where app will provision a new anon session
    navigate('/');
  };

  if (loading) return <div className="screen-with-nav" style={{textAlign:'center', padding:'3rem'}}>{isEn?'Loading...':'लोड हुँदैछ...'}</div>;

  const isAnonymous = user && user.is_anonymous;

  return (
    <div className="profile-screen screen-with-nav" style={{ padding: '0 1rem', background: 'var(--color-bg-cream)' }}>
      <TopBar title="Profile Settings" titleEn="Profile Settings" />
      
      <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-deep-indigo)', marginBottom: '0.5rem' }}>
          {isEn ? "Account Status" : "खाताको स्थिति"}
        </h2>
        
        {isAnonymous ? (
          <div>
            <p style={{ color: 'var(--color-primary-sage)', fontWeight: 'bold', marginBottom: '1rem' }}>
              {isEn ? "Browsing Anonymously" : "तपाईंले यो एप नाम नखुलाई प्रयोग गरिरहनुभएको छ।"}
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem', lineHeight: '1.4' }}>
              {isEn ? "You are currently using the app natively without an account. All features are fully unlocked. However, if you clear your browser history or switch phones, you will lose your check-in tracking history." : "सबै सुविधाहरू पूर्ण रूपमा उपलब्ध छन्। तर यदि तपाईंले ब्राउजरको डाटा मेटाउनुभयो भने, तपाईंको प्रगति गुम्न सक्छ। सुरक्षित राख्न खाता बनाउनुहोस्।"}
            </p>
            
            <form onSubmit={handleLinkAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="email" 
                placeholder={isEn ? "Email Address" : "इमेल ठेगाना"} 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '12px', border: '1px solid #EFECE6', borderRadius: '6px' }}
              />
              <input 
                type="password" 
                placeholder={isEn ? "Create Password" : "पासवर्ड"} 
                required
                minLength="6"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '12px', border: '1px solid #EFECE6', borderRadius: '6px' }}
              />
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={loading}
                style={{ background: 'var(--color-warm-terracotta)', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold' }}
              >
                {isEn ? "Save My Data Permanently" : "मेरो प्रगति सुरक्षित राख्नुहोस्"}
              </button>
              {statusMsg && <p style={{ fontSize: '0.85rem', color: statusMsg.includes('Success') ? 'green' : 'red', textAlign: 'center' }}>{statusMsg}</p>}
            </form>
          </div>
        ) : user ? (
          <div>
            <p style={{ color: 'var(--color-deep-indigo)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {isEn ? "Logged In As:" : "लगइन हुनुभयो:"} <span style={{color: 'var(--color-primary-sage)'}}>{user.email}</span>
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>
              {isEn ? "Your data is permanently secured and linked to your account. You can safely access your check-in history from any device." : "तपाईंको प्रगति सफलतापूर्वक सुरक्षित गरिएको छ।"}
            </p>
            
            <button 
              onClick={handleLogout}
              className="primary-btn"
              style={{ background: '#f5f5f5', color: '#B34A30', border: '1px solid #EFECE6', padding: '12px', borderRadius: '6px', width: '100%', fontWeight: 'bold' }}
            >
              {isEn ? "Sign Out" : "साइन आउट"}
            </button>
          </div>
        ) : (
           <p>Initializing...</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default Profile;
