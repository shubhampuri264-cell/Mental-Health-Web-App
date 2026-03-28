import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ne from './ne.json';
import en from './en.json';

const savedLanguage = localStorage.getItem('manasthiti-lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ne: { translation: ne },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
