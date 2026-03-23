import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
const LanguageToggle = () => {
    const { i18n, t } = useTranslation();
    const lang = (i18n.language || 'en').startsWith('hi') ? 'hi' : 'en';

    useEffect(() => {
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const toggleLang = () => {
        const next = lang === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(next);
    };

    return (
        <button
            onClick={toggleLang}
            style={{
                padding: '0.25rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                fontSize: '0.875rem',
                color: 'var(--text-color)',
                backgroundColor: 'transparent',
                transition: 'all 0.2s'
            }}
        >
            {lang === 'en' ? t('lang.english') : t('lang.hindi')}
        </button>
    );
};

export default LanguageToggle;
