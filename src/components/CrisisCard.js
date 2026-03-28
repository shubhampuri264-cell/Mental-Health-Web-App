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
  const CRISIS_PHONE = '1660-0102005';
  const CRISIS_ORG = 'TPO Nepal';

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

          <div className="crisis-phone-block">
            <p className="crisis-org">{CRISIS_ORG}</p>
            <a
              href={`tel:${CRISIS_PHONE}`}
              className="crisis-phone-link"
              aria-label={`Call ${CRISIS_ORG} at ${CRISIS_PHONE}`}
            >
              <span className="phone-icon">📞</span>
              <span className="phone-number">{CRISIS_PHONE}</span>
            </a>
          </div>

          <div className="crisis-safety">
            <p className="safety-ne">{t('tiers.tier4.safetyMessage')}</p>
          </div>

          <a
            href={`tel:${CRISIS_PHONE}`}
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
