import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DhakaBorder from '../components/DhakaBorder';
import LanguageToggle from '../components/LanguageToggle';
import '../styles/Landing.css';

function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has already completed a check-in, send them to Home instead of Landing
    const hasResult = sessionStorage.getItem('manasthiti-result');
    if (hasResult) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="landing-screen">
      <DhakaBorder />
      <LanguageToggle />

      <div className="landing-content">
        <h1 className="app-name">{t('appName')}</h1>
        {i18n.language === 'ne' && <p className="app-name-roman">{t('appNameRoman')}</p>}

        <div className="tagline-block">
          <p className="tagline-ne">{t('tagline')}</p>
        </div>

        <button
          className="cta-button"
          onClick={() => navigate('/check-in')}
        >
          <span className="cta-ne">{t('beginCheckin')}</span>
        </button>

        <div className="trust-badges">
          <span className="badge">
            <span className="badge-icon">🔒</span>
            {t('anonymous')}
          </span>
          <span className="badge">
            <span className="badge-icon">⏱</span>
            {t('threeMinutes')}
          </span>
          <span className="badge">
            <span className="badge-icon">✦</span>
            {t('noLogin')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Landing;
