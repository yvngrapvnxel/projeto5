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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: userStore.getState().user.lang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
  });

// Sync i18n language with zustand store so profile language changes apply immediately
userStore.subscribe((state) => {
  const currentLang = state.user.lang;
  if (currentLang && currentLang !== i18n.language) {
    i18n.changeLanguage(currentLang);
  }
});

export default i18n;
