import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CrisisCard from '../components/CrisisCard';
import '../styles/Support.css';

function Support() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('manasthiti-result');
    if (!stored) {
      navigate('/home');
      return;
    }
    setResult(JSON.parse(stored));
  }, [navigate]);

  if (!result) return null;

  const { tier } = result;

  const tierKey = `tier${tier}`;
  const tierData = t(`tiers.${tierKey}`, { returnObjects: true });

  const handleCTA = () => {
    if (tier === 1) {
      navigate('/library');
    } else if (tier === 2) {
      const nextCheckin = new Date();
      nextCheckin.setDate(nextCheckin.getDate() + 7);
      localStorage.setItem('manasthiti-next-checkin', nextCheckin.toISOString());
      navigate('/letter');
    } else {
      navigate('/letter');
    }
  };

  return (
    <div className="support-screen">
      {/* Section 1: Heading + navigation — always visible first */}
      <div className={`support-card tier-${tier}`}>
        <div className={`support-top-border ${tier === 4 ? 'border-indigo' : 'border-terracotta'}`} />

        <div className="support-content">
          <h2 className="support-heading-ne">{tierData.heading}</h2>

          <div className="support-disclaimer">
            <p className="disclaimer-ne">{t('notDiagnosis')}</p>
          </div>

          {/* Quick navigation to all features */}
          <div className="support-nav-actions">
            <button className="support-nav-btn" onClick={() => navigate('/home')}>
              <span className="nav-btn-ne">{t('nav.goHome')}</span>
            </button>
            <button className="support-nav-btn" onClick={() => navigate('/chat')}>
              <span className="nav-btn-ne">{t('nav.talkToPhoenix')}</span>
            </button>
            <button className="support-nav-btn" onClick={() => navigate('/groups')}>
              <span className="nav-btn-ne">{t('nav.joinSupportGroup')}</span>
            </button>
            <button className="support-nav-btn" onClick={() => navigate('/letter')}>
              <span className="nav-btn-ne">{t('nav.letterToSelf')}</span>
            </button>
            <button className="support-nav-btn" onClick={() => navigate('/library')}>
              <span className="nav-btn-ne">{t('nav.selfHelpLibrary')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Tier-specific support info — visible on scroll */}
      <div className={`support-card tier-${tier}`} style={{ marginTop: '1rem' }}>
        <div className="support-content">
          <p className="support-description-ne">{tierData.description}</p>

          {tier === 4 ? (
            <a href="tel:1660-0102005" className="support-cta">
              <span className="cta-ne">{tierData.cta}</span>
            </a>
          ) : (
            <button className="support-cta" onClick={handleCTA}>
              <span className="cta-ne">{tierData.cta}</span>
            </button>
          )}

          {tierData.resources && (
            <div className="support-resources">
              {tierData.resources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <h3 className="resource-title-ne">{resource.title}</h3>
                  <p className="resource-desc-ne">{resource.description}</p>
                  {resource.contact && (
                    <a
                      href={`tel:${resource.contact}`}
                      className="resource-contact"
                    >
                      {resource.contact}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tier 4: Crisis card at the bottom */}
      {tier === 4 && <CrisisCard />}
    </div>
  );
}

export default Support;
