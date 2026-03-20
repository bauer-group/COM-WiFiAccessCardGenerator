import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'fr', 'es', 'it', 'pt', 'tr', 'pl', 'ru', 'ar', 'zh', 'ja', 'ko', 'ka', 'th', 'vi'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`,
    },
    react: { useSuspense: true },
  });

export default i18n;

export function getCurrentLanguage(): string {
  return i18n.language || 'en';
}

export function changeLanguage(lang: string): Promise<void> {
  return i18n.changeLanguage(lang).then(() => undefined);
}

export function isLanguageSupported(lang: string): boolean {
  return (i18n.options.supportedLngs as string[])?.includes(lang) ?? false;
}
