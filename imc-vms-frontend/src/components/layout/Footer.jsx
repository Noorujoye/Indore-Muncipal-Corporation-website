import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: 'var(--bg-color)',
            borderTop: '1px solid var(--border-color)',
            padding: '2rem',
            marginTop: 'auto',
            textAlign: 'center',
            color: 'var(--gray-600)',
            fontSize: '0.875rem'
        }}>
            <div style={{ marginBottom: '0.5rem' }}>
                {t('footer.copyright', { year })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>{t('footer.privacy')}</Link>
                <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>{t('footer.terms')}</Link>
            </div>
        </footer>
    );
};

export default Footer;
