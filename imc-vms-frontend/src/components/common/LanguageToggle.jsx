import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const isHindi = (i18n.language || 'en').startsWith('hi');

    useEffect(() => {
        const lang = isHindi ? 'hi' : 'en';
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    }, [isHindi]);

    const toggleLang = () => {
        i18n.changeLanguage(isHindi ? 'en' : 'hi');
    };

    return (
        <button
            onClick={toggleLang}
            className="touch-target"
            aria-label="Toggle language between English and Hindi"
            title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-color)',
                backgroundColor: 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '36px'
            }}
        >
            <span style={{ color: !isHindi ? 'var(--primary)' : 'var(--text-muted, #64748B)' }}>EN</span>
            <span style={{ color: 'var(--border-color)', opacity: 0.8 }}>|</span>
            <span style={{ color: isHindi ? 'var(--primary)' : 'var(--text-muted, #64748B)' }}>हिंदी</span>
        </button>
    );
};

export default LanguageToggle;

