import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    LogOut,
    Bell,
    User,
    Menu,
    X,
    ChevronDown,
    MessageSquare
} from 'lucide-react';
import apiClient, { authStorage } from '../../services/apiClient';
import { clearCachedMe } from '../auth/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';

const VendorDashboardLayout = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [vendorLogoUrl, setVendorLogoUrl] = useState(null);
    const notificationsRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        
        
        setNotifications([]);
    }, []);

    useEffect(() => {
        let isActive = true;
        let objectUrlToRevoke = null;

        const loadProfile = async () => {
            try {
                const profile = await apiClient.get('/vendor/profile');
                if (!isActive) return;

                setVendorProfile(profile);
                if (profile?.firmName) {
                    localStorage.setItem('vendor_name', profile.firmName);
                }

                if (profile?.hasLogo) {
                    const blob = await apiClient.get('/vendor/profile/logo', { responseType: 'blob' });
                    if (!isActive) return;

                    objectUrlToRevoke = URL.createObjectURL(blob);
                    setVendorLogoUrl(objectUrlToRevoke);
                } else {
                    setVendorLogoUrl(null);
                }
            } catch (e) {
                
                setVendorLogoUrl(null);
            }
        };

        loadProfile();

        return () => {
            isActive = false;
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
            }
        };
    }, []);

    useEffect(() => {
        if (!isNotificationsOpen && !isProfileOpen) return;

        const onPointerDown = (event) => {
            const target = event.target;

            if (isNotificationsOpen && notificationsRef.current && !notificationsRef.current.contains(target)) {
                setIsNotificationsOpen(false);
            }
            if (isProfileOpen && profileRef.current && !profileRef.current.contains(target)) {
                setIsProfileOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('touchstart', onPointerDown, true);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown, true);
            document.removeEventListener('touchstart', onPointerDown, true);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isNotificationsOpen, isProfileOpen]);

    const vendorName = vendorProfile?.firmName || localStorage.getItem('vendor_name') || t('vendorLayout.vendor', { defaultValue: 'Vendor' });
    const vendorRoleLabel = t('vendorLayout.vendorRole');

    const handleLogout = () => {
        setIsProfileOpen(false);
        setIsSidebarOpen(false);
        apiClient.post('/auth/logout').catch(() => undefined);
        authStorage.clearAuthStorage();
        clearCachedMe();
        navigate('/');
    };

    const navItems = [
        { path: '/vendor/dashboard', label: t('vendorLayout.nav.dashboard'), icon: LayoutDashboard },
        { path: '/vendor/invoices', label: t('vendorLayout.nav.myInvoices'), icon: FileText },
        { path: '/vendor/invoices/create', label: t('vendorLayout.nav.createInvoice'), icon: PlusCircle },
        { path: '/vendor/helpdesk', label: t('vendorLayout.nav.helpdesk'), icon: MessageSquare },
    ];

    const isActive = (path) => {
        if (path === '/vendor/dashboard' && location.pathname === '/vendor/dashboard') return true;
        if (path !== '/vendor/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="portal-layout">
            <header className="portal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        className="mobile-only touch-target"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Toggle navigation drawer"
                        style={{
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-color)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.4rem'
                        }}
                    >
                        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src="/imc-logo-enhanced.png" alt={t('brand.logoAlt')} style={{ height: '36px' }} />
                        <div className="desktop-only" style={{ flexDirection: 'column', lineHeight: 1.15 }}>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{t('brand.org')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', letterSpacing: '0.04em' }}>{t('brand.systemUpper')}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LanguageToggle />
                    <ThemeToggle />

                    <div ref={notificationsRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setIsNotificationsOpen((prev) => !prev);
                                setIsProfileOpen(false);
                            }}
                            className="touch-target"
                            style={{
                                position: 'relative',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--gray-600)',
                                padding: '0.4rem',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#EF4444',
                                    borderRadius: '50%'
                                }} />
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: -10,
                                marginTop: '0.5rem',
                                width: 'min(320px, 90vw)',
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '8px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden',
                                zIndex: 60
                            }}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                    {t('vendorLayout.notifications.title')}
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '1rem', textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                                    {t('vendorLayout.notifications.noNew')}
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={profileRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setIsProfileOpen((prev) => !prev);
                                setIsNotificationsOpen(false);
                            }}
                            className="touch-target"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                color: 'var(--text-color)'
                            }}
                        >
                            <div className="desktop-only" style={{ textAlign: 'right', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{vendorName}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)' }}>{vendorRoleLabel}</div>
                            </div>
                            <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--gray-200)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--gray-600)',
                                overflow: 'hidden'
                            }}>
                                {vendorLogoUrl ? (
                                    <img
                                        src={vendorLogoUrl}
                                        alt={t('vendorProfile.profileImageAlt')}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>
                            <ChevronDown size={14} color="var(--gray-400)" />
                        </button>

                        {isProfileOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                width: '200px',
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '8px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                padding: '0.5rem',
                                zIndex: 60
                            }}>
                                <button
                                    onClick={() => { setIsProfileOpen(false); navigate('/vendor/profile'); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-color)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <User size={16} /> {t('vendorLayout.profile.myProfile')}
                                </button>
                                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem',
                                        color: '#EF4444',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <LogOut size={16} /> {t('common.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="portal-body">
                <aside className={`portal-sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
                    <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        minHeight: '44px',
                                        color: isActive ? 'white' : 'var(--gray-600)',
                                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                        transition: 'all 0.2s',
                                    })}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    minHeight: '44px'
                                }}
                            >
                                <LogOut size={20} /> {t('common.logout')}
                            </button>
                        </div>
                    </nav>
                </aside>

                <main className="portal-main">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="portal-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default VendorDashboardLayout;

