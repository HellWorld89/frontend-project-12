import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем переводы
import translationRU from './locales/ru/translation.json';

const resources = {
  ru: {
    translation: translationRU,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;