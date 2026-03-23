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
import apiClient from '../../services/apiClient';
import { authStorage } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

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
        
        apiClient.post('/auth/logout').catch(() => undefined);
        authStorage.clearAuthStorage();
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
        <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>

            <header style={{
                height: '64px',
                backgroundColor: 'white',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src="/imc-logo-enhanced.png" alt={t('brand.logoAlt')} style={{ height: '40px' }} />
                        <div className="hidden sm:block" style={{ lineHeight: 1.2 }}>
                            <div style={{ fontWeight: 700, color: '#0A3D62', fontSize: '0.9rem' }}>{t('brand.org')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{t('brand.systemUpper')}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                    <div ref={notificationsRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setIsNotificationsOpen((prev) => !prev);
                                setIsProfileOpen(false);
                            }}
                            style={{
                                position: 'relative',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: '#64748B',
                                padding: '0.25rem',
                                borderRadius: '4px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
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
                                width: '320px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                zIndex: 60
                            }}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E2E8F0', fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>
                                    {t('vendorLayout.notifications.title')}
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {notifications.map(notification => (
                                        <div key={notification.id} style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid #F1F5F9',
                                            cursor: 'pointer',
                                            backgroundColor: notification.type === 'alert' ? '#FFF1F2' : 'white'
                                        }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                                                {notification.title}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.25rem' }}>
                                                {notification.message}
                                            </p>
                                            <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                                                {notification.time}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <button style={{
                                    width: '100%', padding: '0.75rem', border: 'none', background: '#F8FAFC',
                                    color: '#0A3D62', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                }}>
                                    {t('vendorLayout.notifications.viewAll')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div ref={profileRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setIsProfileOpen((prev) => !prev);
                                setIsNotificationsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 640px)': { display: 'block' } }} className="hidden sm:block">
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{vendorName}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{vendorRoleLabel}</div>
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#64748B'
                            }}>
                                {vendorLogoUrl ? (
                                    <img
                                        src={vendorLogoUrl}
                                        alt={t('vendorProfile.profileImageAlt')}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <ChevronDown size={14} color="#94A3B8" />
                        </button>

                        {isProfileOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                width: '200px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #E2E8F0',
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
                                        color: '#334155',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        borderRadius: '4px'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <User size={16} /> {t('vendorLayout.profile.myProfile')}
                                </button>
                                <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '0.5rem 0' }} />
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
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} /> {t('common.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, marginTop: '64px' }}>
                <aside style={{
                    width: '240px',
                    backgroundColor: 'white',
                    borderRight: '1px solid #E2E8F0',
                    position: 'fixed',
                    top: '64px',
                    bottom: 0,
                    left: 0,
                    zIndex: 40,
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    '@media (min-width: 768px)': { transform: 'translateX(0)' } 
                }} className={`fixed md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav style={{ padding: '1.5rem 1rem' }}>
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
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: isActive ? 'white' : '#64748B',
                                        backgroundColor: isActive ? '#0A3D62' : 'transparent',
                                        transition: 'all 0.2s',
                                    })}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #E2E8F0' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#64748B',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#64748B'}
                            >
                                <LogOut size={20} /> {t('common.logout')}
                            </button>
                        </div>
                    </nav>
                </aside>

                <main style={{
                    flex: 1,
                    padding: '2rem',
                    marginLeft: '0',
                    '@media (min-width: 768px)': { marginLeft: '240px' }
                }} className="md:ml-60 w-full">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="md:hidden"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 30
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default VendorDashboardLayout;

