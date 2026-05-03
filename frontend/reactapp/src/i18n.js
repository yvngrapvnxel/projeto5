import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import ptTranslation from './locales/pt/translation.json';
import userStore from './stores/userStore';

const resources = {
  en: {
    translation: enTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: userStore.getState().user.lang || 'en', // Default language from store
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
  });

// Subscribe to zustand store changes to update language dynamically
userStore.subscribe((state) => {
  const currentLang = state.user.lang;
  if (currentLang && currentLang !== i18n.language) {
    i18n.changeLanguage(currentLang);
  }
});

export default i18n;
