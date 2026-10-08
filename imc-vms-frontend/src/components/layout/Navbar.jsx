import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useTranslation } from 'react-i18next';

const Navbar = ({ onLoginClick, showThemeToggle = true, showLanguageToggle = true }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isImcRoute = location.pathname === '/imc' || location.pathname.startsWith('/imc/');
    const isVendorRoute = location.pathname === '/vendor' || location.pathname.startsWith('/vendor/');
    const isPublicPage = !isImcRoute && !isVendorRoute;

    const handleLoginClick = () => {
        setMobileMenuOpen(false);
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
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: active ? 'var(--primary)' : 'var(--gray-600)',
            padding: '0.4rem 0.2rem',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'color 0.15s ease, border-color 0.15s ease',
        };
    };

    return (
        <>
            <nav
                className="site-navbar"
                style={{
                    minHeight: '64px',
                    backgroundColor: 'var(--card-bg)',
                    borderBottom: '1px solid var(--gov-border)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    padding: '0.5rem 1rem'
                }}
            >
                <div className="site-navbar__brand">
                    <Link to="/" className="site-navbar__brandLink">
                        <img
                            src="/imc-logo-enhanced.png"
                            alt="IMC Logo"
                            className="site-navbar__logo"
                            style={{ height: '38px' }}
                        />
                        <div className="site-navbar__brandText">
                            <span className="site-navbar__title" style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                                {t('brand.org')}
                            </span>
                            <span className="site-navbar__subtitle" style={{ color: 'var(--gray-600)', fontSize: '0.7rem' }}>
                                {t('brand.system')}
                            </span>
                        </div>
                    </Link>
                </div>

                {isPublicPage && (
                    <div className="site-navbar__links desktop-only" style={{ display: 'flex', gap: '1.25rem' }}>
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

                <div className="site-navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {showLanguageToggle && <LanguageToggle />}
                    {showThemeToggle && <ThemeToggle />}

                    {isPublicPage && (
                        <div className="desktop-only" style={{ alignItems: 'center', gap: '0.75rem' }}>
                            <div className="site-navbar__divider" style={{ backgroundColor: 'var(--border-color)', height: '20px', width: '1px' }}></div>
                            <Button
                                variant="primary"
                                onClick={handleLoginClick}
                                style={{
                                    backgroundColor: 'var(--primary)',
                                    minHeight: '40px',
                                    padding: '0.4rem 1.25rem'
                                }}
                            >
                                {t('nav.login')}
                            </Button>
                        </div>
                    )}

                    {isPublicPage && (
                        <button
                            type="button"
                            className="mobile-only touch-target"
                            onClick={() => setMobileMenuOpen(prev => !prev)}
                            aria-label="Toggle navigation menu"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '0.4rem',
                                color: 'var(--text-color)',
                                cursor: 'pointer'
                            }}
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Navigation Dropdown Drawer */}
            {isPublicPage && mobileMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '64px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--card-bg)',
                        borderBottom: '2px solid var(--primary)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 99,
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        animation: 'fadeIn 0.2s ease-in-out'
                    }}
                >
                    {publicLinks.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                padding: '0.75rem 0.5rem',
                                borderBottom: '1px solid var(--border-color)',
                                color: location.pathname === item.to ? 'var(--primary)' : 'var(--text-color)',
                                fontWeight: location.pathname === item.to ? 700 : 500,
                                fontSize: '1rem',
                                display: 'block'
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div style={{ paddingTop: '0.5rem' }}>
                        <Button
                            variant="primary"
                            onClick={handleLoginClick}
                            style={{
                                width: '100%',
                                minHeight: '44px',
                                backgroundColor: 'var(--primary)',
                                justifyContent: 'center',
                                fontSize: '1rem'
                            }}
                        >
                            {t('nav.login')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

