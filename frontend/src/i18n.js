import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируем переводы
import translationRU from './locales/ru/translation.json';

const resources = {
  ru: {
    translation: translationRU,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Дефолтная локаль - ru
    debug: process.env.NODE_ENV === 'development', // Включить дебаг только в development
    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;