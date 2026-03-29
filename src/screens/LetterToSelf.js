import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/LetterToSelf.css';

function LetterToSelf() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [letterText, setLetterText] = useState('');
  const [saved, setSaved] = useState(false);
  const [existingLetter, setExistingLetter] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Check for existing letter
    const stored = localStorage.getItem('manasthiti-letter');
    if (stored) {
      const letter = JSON.parse(stored);
      const unlockDate = new Date(letter.unlockDate);
      const now = new Date();

      if (now >= unlockDate) {
        setIsUnlocked(true);
        setExistingLetter(letter);
      } else {
        const diffTime = unlockDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays);
        setExistingLetter(letter);
      }
    }
  }, []);

  const handleSend = () => {
    if (!letterText.trim()) return;

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + 7);

    const letter = {
      text: letterText,
      createdAt: new Date().toISOString(),
      unlockDate: unlockDate.toISOString(),
    };

    localStorage.setItem('manasthiti-letter', JSON.stringify(letter));

    // Store check-in history
    const history = JSON.parse(localStorage.getItem('manasthiti-history') || '[]');
    history.push({
      date: new Date().toISOString(),
      hadLetter: true,
    });
    localStorage.setItem('manasthiti-history', JSON.stringify(history));

    setSaved(true);
  };

  const handleSkip = () => {
    // Store check-in history without letter
    const history = JSON.parse(localStorage.getItem('manasthiti-history') || '[]');
    history.push({
      date: new Date().toISOString(),
      hadLetter: false,
    });
    localStorage.setItem('manasthiti-history', JSON.stringify(history));
    navigate('/home');
  };

  const handleCheckinAgain = () => {
    // Clear the unlocked letter and go to check-in
    localStorage.removeItem('manasthiti-letter');
    navigate('/check-in');
  };

  // Show unlocked letter
  if (isUnlocked && existingLetter) {
    return (
      <div className="letter-screen">
        <div className="letter-content">
          <div className="letter-envelope unlocked">
            <span className="envelope-icon">✉</span>
          </div>
          <h2 className="letter-heading-ne">{t('letter.unlocked')}</h2>

          <div className="letter-revealed">
            <p className="letter-text">{existingLetter.text}</p>
          </div>

          <button className="letter-cta" onClick={handleCheckinAgain}>
            <span className="cta-ne">{t('letter.checkinAgain')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Show locked letter countdown
  if (existingLetter && !isUnlocked) {
    return (
      <div className="letter-screen">
        <div className="letter-content">
          <div className="letter-envelope locked">
            <span className="envelope-icon">🔒</span>
          </div>
          <h2 className="letter-locked-ne">
            {t('letter.locked').replace('७', daysLeft).replace('7', daysLeft)}
          </h2>

          <div className="letter-privacy">
            <span className="privacy-icon">🔒</span>
            <span className="privacy-ne">{t('letter.privacy')}</span>
          </div>

          <button className="letter-cta secondary" onClick={() => navigate('/home')}>
            <span>← {t('appName')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Show saved confirmation
  if (saved) {
    return (
      <div className="letter-screen">
        <div className="letter-content">
          <div className="letter-envelope locked">
            <span className="envelope-icon">✉</span>
          </div>
          <h2 className="letter-saved-ne">{t('letter.letterSaved')}</h2>

          <p className="letter-countdown-ne">
            {t('letter.locked')}
          </p>

          <div className="letter-privacy">
            <span className="privacy-icon">🔒</span>
            <span className="privacy-ne">{t('letter.privacy')}</span>
          </div>

          <button className="letter-cta secondary" onClick={() => navigate('/home')}>
            <span>← {t('appName')}</span>
          </button>
        </div>
      </div>
    );
  }

  // New letter input
  return (
    <div className="letter-screen">
      <div className="letter-content">
        <div className="letter-prompt">
          <h2 className="prompt-ne">{t('letter.prompt')}</h2>
        </div>

        <div className="letter-input-wrapper">
          <textarea
            className="letter-input"
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="..."
            lang="ne"
            maxLength={280}
            rows={3}
          />
        </div>

        <div className="letter-privacy">
          <span className="privacy-icon">🔒</span>
          <span className="privacy-ne">{t('letter.privacy')}</span>
        </div>

        <div className="letter-optional-label">
          <span className="optional-text">{t('letter.skip')}</span>
        </div>

        <div className="letter-actions">
          <button
            className={`letter-cta ${letterText.trim() ? 'active' : 'disabled'}`}
            onClick={handleSend}
            disabled={!letterText.trim()}
          >
            <span className="cta-ne">{t('letter.send')}</span>
          </button>

          <button className="letter-skip" onClick={handleSkip}>
            {t('letter.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LetterToSelf;
