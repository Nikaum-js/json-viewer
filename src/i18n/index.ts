import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
import enTranslations from '../locales/en/common.json';
import esTranslations from '../locales/es/common.json';
import ptTranslations from '../locales/pt/common.json';

const resources = {
  en: {
    common: enTranslations,
  },
  es: {
    common: esTranslations,
  },
  pt: {
    common: ptTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    resources,
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;