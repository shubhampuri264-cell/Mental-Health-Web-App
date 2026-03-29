import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/CrisisCard.css';

/**
 * TIER 4 CRISIS CARD
 *
 * SAFETY RULES (from PRD - non-negotiable):
 * - Hardcoded and pre-loaded
 * - Never A/B tested
 * - Never behind a feature flag
 * - Never disabled
 * - Must render within 100ms
 * - Cached offline via Service Worker
 *
 * The phone number and organization are hardcoded — not fetched from any API.
 */
function CrisisCard() {
  const { t } = useTranslation();

  // Hardcoded crisis information — NEVER fetch from API
  const CRISIS_LINES = [
    { org: 'TPO Nepal', phone: '1660-0102005' },
    { org: '988 Suicide & Crisis Lifeline (US)', phone: '988' },
  ];

  return (
    <div className="crisis-screen" role="alert" aria-live="assertive">
      <div className="crisis-card">
        <div className="crisis-top-border" />

        <div className="crisis-content">
          <h1 className="crisis-heading-ne">
            {t('tiers.tier4.heading')}
          </h1>

          <div className="crisis-divider" />

          <p className="crisis-description-ne">
            {t('tiers.tier4.description')}
          </p>

          {CRISIS_LINES.map((line) => (
            <div className="crisis-phone-block" key={line.phone}>
              <p className="crisis-org">{line.org}</p>
              <a
                href={`tel:${line.phone}`}
                className="crisis-phone-link"
                aria-label={`Call ${line.org} at ${line.phone}`}
              >
                <span className="phone-icon">📞</span>
                <span className="phone-number">{line.phone}</span>
              </a>
            </div>
          ))}

          <div className="crisis-safety">
            <p className="safety-ne">{t('tiers.tier4.safetyMessage')}</p>
          </div>

          <a
            href={`tel:${CRISIS_LINES[0].phone}`}
            className="crisis-cta"
          >
            <span className="cta-ne">{t('tiers.tier4.cta')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default CrisisCard;
