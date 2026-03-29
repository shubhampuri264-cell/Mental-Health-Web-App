import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Landing from './screens/Landing';

// Lazy loading the rest of the app to drastically shrink initial load time
const Home = React.lazy(() => import('./screens/Home'));
const Questionnaire = React.lazy(() => import('./screens/Questionnaire'));
const Solidarity = React.lazy(() => import('./screens/Solidarity'));
const Support = React.lazy(() => import('./screens/Support'));
const LetterToSelf = React.lazy(() => import('./screens/LetterToSelf'));
const SupportGroups = React.lazy(() => import('./screens/SupportGroups'));
const Chat = React.lazy(() => import('./screens/Chat'));
const Library = React.lazy(() => import('./screens/Library'));
const Profile = React.lazy(() => import('./screens/Profile'));

import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './supabaseClient';
import './i18n';
import './styles/design-tokens.css';

function App() {
  const { i18n } = useTranslation();
  const [authReady, setAuthReady] = useState(false);

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
      } finally {
        setAuthReady(true);
      }
    };
    initAuth();
  }, []);

  if (!authReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'Noto Sans Devanagari, sans-serif', color: '#1B1F5E' }}>
        <p className="loading-pulse">मनस्थिति...</p>
      </div>
    );
  }

  // A minimal loading fallback for chunks
  const screenFallback = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#DE6B48', fontWeight: 600 }}>
      {i18n.language === 'en' ? 'Loading...' : 'लोड हुँदैछ...'}
    </div>
  );

  return (
    <ErrorBoundary>
      <Router>
        <React.Suspense fallback={screenFallback}>
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
        </React.Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
