import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageToggle.css';

function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ne' ? 'en' : 'ne';
    i18n.changeLanguage(newLang);
    localStorage.setItem('manasthiti-lang', newLang);
  };

  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      {t('language.toggle')}
    </button>
  );
}

export default LanguageToggle;
