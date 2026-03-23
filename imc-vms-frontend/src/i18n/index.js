import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';

const resolveInitialLanguage = () => {
    const stored = localStorage.getItem('language');
    if (stored === 'hi' || stored === 'en') return stored;
    return 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
        },
        lng: resolveInitialLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
        returnEmptyString: false,
    });

export default i18n;
