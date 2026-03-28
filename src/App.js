import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Landing from './screens/Landing';
import Home from './screens/Home';
import Questionnaire from './screens/Questionnaire';
import Solidarity from './screens/Solidarity';
import Support from './screens/Support';
import LetterToSelf from './screens/LetterToSelf';
import SupportGroups from './screens/SupportGroups';
import Chat from './screens/Chat';
import Library from './screens/Library';
import Profile from './screens/Profile';
import { supabase } from './supabaseClient';
import './i18n';
import './styles/design-tokens.css';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Anonymous auth failed. Please ensure "Anonymous Sign-Ins" is enabled in Supabase Authentication -> Providers:', error.message);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };
    initAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/check-in" element={<Questionnaire />} />
        <Route path="/solidarity" element={<Solidarity />} />
        <Route path="/support" element={<Support />} />
        <Route path="/letter" element={<LetterToSelf />} />
        <Route path="/groups" element={<SupportGroups />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
