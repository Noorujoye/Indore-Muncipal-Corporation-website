import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useTranslation } from 'react-i18next';

const Navbar = ({ onLoginClick, showThemeToggle = true, showLanguageToggle = true }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const isImcRoute = location.pathname === '/imc' || location.pathname.startsWith('/imc/');
    const isVendorRoute = location.pathname === '/vendor' || location.pathname.startsWith('/vendor/');
    const isPublicPage = !isImcRoute && !isVendorRoute;

    const handleLoginClick = () => {
        if (typeof onLoginClick === 'function') {
            onLoginClick();
            return;
        }
        
        navigate('/?login=1');
    };

    const publicLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/about', label: t('nav.about') },
        { to: '/guidelines', label: t('nav.guidelines') },
        { to: '/faq', label: t('nav.faq') },
        { to: '/contact', label: t('nav.contact') },
    ];

    const linkStyle = (to) => {
        const active = location.pathname === to;
        return {
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: active ? 'var(--primary)' : 'var(--gray-600)',
            padding: '0.35rem 0.15rem',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'color 0.15s ease, border-color 0.15s ease',
        };
    };

    return (
        <nav
            className="site-navbar"
            style={{
                minHeight: '70px',
                backgroundColor: 'var(--card-bg)',
                borderBottom: '1px solid var(--gov-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}
        >
            <div className="site-navbar__brand">
                <Link to="/" className="site-navbar__brandLink">
                    <img
                        src="/imc-logo-enhanced.png"
                        alt="IMC Logo"
                        className="site-navbar__logo"
                    />
                    <div className="site-navbar__brandText">
                        <span className="site-navbar__title" style={{ color: 'var(--primary)' }}>
                            {t('brand.org')}
                        </span>
                        <span className="site-navbar__subtitle" style={{ color: 'var(--gray-600)' }}>
                            {t('brand.system')}
                        </span>
                    </div>
                </Link>
            </div>

            {isPublicPage && (
                <div className="site-navbar__links">
                    {publicLinks.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            style={linkStyle(item.to)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}

            <div className="site-navbar__actions">
                {showThemeToggle && <ThemeToggle />}
                {showLanguageToggle && <LanguageToggle />}

                {isPublicPage && (
                    <>
                        <div className="site-navbar__divider" style={{ backgroundColor: 'var(--border-color)' }}></div>

                        <Button
                            variant="primary"
                            onClick={handleLoginClick}
                            style={{
                                backgroundColor: 'var(--primary)',
                            }}
                        >
                            {t('nav.login')}
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

