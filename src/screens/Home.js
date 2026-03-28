import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/Navigation';
import LanguageToggle from '../components/LanguageToggle';
import MoodChart from '../components/MoodChart';
import '../styles/Home.css';

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [letter, setLetter] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('manasthiti-history') || '[]');
    setHistory(h);
    const l = localStorage.getItem('manasthiti-letter');
    if (l) setLetter(JSON.parse(l));
    const r = sessionStorage.getItem('manasthiti-result');
    if (r) setLastResult(JSON.parse(r));
  }, []);

  const hasCheckedIn = history.length > 0;
  const tierNames = {
    1: t('nav.tierSunlit'),
    2: t('nav.tierPartlyCloudy'),
    3: t('nav.tierHeavyClouds'),
    4: t('nav.tierStorm'),
  };

  return (
    <div className="home-screen screen-with-nav">
      <div className="home-header">
        <div className="home-brand">
          <h1 className="home-app-name">{t('appName')}</h1>
          <p className="home-app-sub">{t('appNameRoman')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageToggle />
          <button 
            onClick={() => navigate('/profile')}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary-sage)', cursor: 'pointer', padding: '0.5rem' }}
            title={t('nav.profileAccount')}
            aria-label={t('nav.profileAccount')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="presentation" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="home-greeting">
        <h2 className="greeting-ne">
          {hasCheckedIn ? t('nav.welcomeBack') : t('nav.understandMind')}
        </h2>
      </div>

      {/* Quick Check-in CTA */}
      <button className="home-checkin-cta" onClick={() => navigate('/check-in')}>
        <div className="checkin-cta-content">
          <span className="checkin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="presentation" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </span>
          <div>
            <span className="checkin-cta-ne">
              {hasCheckedIn ? t('nav.checkinAgain') : t('nav.startCheckin')}
            </span>
          </div>
        </div>
        <span className="checkin-arrow">→</span>
      </button>

      {/* Last result summary */}
      {lastResult && (
        <div className={`home-status-card tier-bg-${lastResult.tier}`}>
          <div className="status-tier">
            <span className="status-tier-ne">{tierNames[lastResult.tier]}</span>
          </div>
          <p className="status-message-ne">
            {lastResult.tier <= 2 ? t('nav.takingCare') : t('nav.supportAvailable')}
          </p>
        </div>
      )}

      {/* Mood History Chart */}
      <div className="home-section">
        <h3 className="section-title-ne">{t('nav.moodTrend')}</h3>
        <MoodChart />
      </div>

      {/* Quick Actions Grid */}
      <div className="home-actions">
        <button className="action-card" onClick={() => navigate('/groups')}>
          <span className="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span className="action-ne">{t('nav.supportGroups')}</span>
        </button>

        <button className="action-card" onClick={() => navigate('/chat')}>
          <span className="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span className="action-ne">{t('nav.talkToPhoenix')}</span>
        </button>

        <button className="action-card" onClick={() => navigate('/library')}>
          <span className="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <span className="action-ne">{t('nav.selfHelpLibrary')}</span>
        </button>

        <button className="action-card" onClick={() => navigate('/letter')}>
          <span className="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          <span className="action-ne">{t('nav.letterToSelf')}</span>
        </button>
      </div>

      {/* Letter status */}
      {letter && (
        <div className="home-letter-status" onClick={() => navigate('/letter')}>
          <span className="letter-status-icon">✉</span>
          <div className="letter-status-text">
            <span className="letter-status-ne">
              {new Date(letter.unlockDate) <= new Date()
                ? t('letter.unlocked')
                : t('letter.locked').replace('7', Math.ceil((new Date(letter.unlockDate) - new Date()) / (1000*60*60*24))).replace('७', Math.ceil((new Date(letter.unlockDate) - new Date()) / (1000*60*60*24)))}
            </span>
          </div>
          <span className="letter-status-arrow">→</span>
        </div>
      )}

      {/* Emergency contact — always visible */}
      <div className="home-emergency">
        <p className="emergency-text-ne">{t('nav.needHelp')}</p>
        <a href="tel:1660-0102005" className="emergency-link">
          TPO Nepal: 1660-0102005
        </a>
      </div>

      <BottomNav />
    </div>
  );
}

export default Home;
