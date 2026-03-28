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
      navigate('/');
      return;
    }
    setResult(JSON.parse(stored));
  }, [navigate]);

  if (!result) return null;

  const { tier } = result;

  // Tier 4: Full-screen crisis card — hardcoded, never A/B tested
  if (tier === 4) {
    return <CrisisCard />;
  }

  const tierKey = `tier${tier}`;
  const tierData = t(`tiers.${tierKey}`, { returnObjects: true });

  const handleCTA = () => {
    if (tier === 3) {
      // For Tier 3, show resources with contact info
      // In production, this could link to NGO pages
    }

    // Set weekly check-in reminder in localStorage
    if (tier === 2) {
      const nextCheckin = new Date();
      nextCheckin.setDate(nextCheckin.getDate() + 7);
      localStorage.setItem('manasthiti-next-checkin', nextCheckin.toISOString());
    }

    navigate('/letter');
  };

  return (
    <div className="support-screen">
      <div className={`support-card tier-${tier}`}>
        <div className={`support-top-border ${tier === 4 ? 'border-indigo' : 'border-terracotta'}`} />

        <div className="support-content">
          <h2 className="support-heading-ne">{tierData.heading}</h2>

          <p className="support-description-ne">{tierData.description}</p>

          {/* Disclaimer */}
          <div className="support-disclaimer">
            <p className="disclaimer-ne">{t('notDiagnosis')}</p>
          </div>

          {/* Resources */}
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

          <button className="support-cta" onClick={handleCTA}>
            <span className="cta-ne">{tierData.cta}</span>
          </button>

          {/* Quick navigation to key features */}
          <div className="support-nav-actions">
            <button className="support-nav-btn" onClick={() => navigate('/groups')}>
              <span className="nav-btn-ne">{t('nav.joinSupportGroup')}</span>
            </button>
            <button className="support-nav-btn" onClick={() => navigate('/chat')}>
              <span className="nav-btn-ne">{t('nav.talkToPhoenix')}</span>
            </button>
            <button className="support-nav-btn secondary" onClick={() => navigate('/home')}>
              <span className="nav-btn-ne">{t('nav.goHome')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
