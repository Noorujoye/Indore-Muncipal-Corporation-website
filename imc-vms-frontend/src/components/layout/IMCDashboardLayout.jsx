import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ListFilter,
    FileBarChart,
    LogOut,
    Bell,
    User,
    Building,
    Menu,
    X,
    ChevronDown,
    Shield,
    AlertCircle,
    CheckCircle,
    FileText
} from 'lucide-react';
import apiClient, { authStorage } from '../../services/apiClient';
import { clearCachedMe } from '../auth/ProtectedRoute';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import { useTranslation } from 'react-i18next';

const IMCDashboardLayout = () => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userRole, setUserRole] = useState('CREATOR');
    const [userName, setUserName] = useState('');
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let cancelled = false;

        const resolveMe = async () => {
            try {
                const me = await apiClient.get('/auth/me');
                const role = me?.role;
                const name = me?.name;

                if (cancelled) return;

                if (role && ['CREATOR', 'VERIFIER', 'APPROVER'].includes(role)) {
                    setUserRole(role);
                    localStorage.setItem('imc_role', role);
                    localStorage.removeItem('user_role');
                }

                if (typeof name === 'string' && name.trim()) {
                    setUserName(name);
                    localStorage.setItem('user_name', name);
                }
            } catch {
                
                if (cancelled) return;
                const storedRole = localStorage.getItem('imc_role');
                const storedName = localStorage.getItem('user_name');
                if (storedRole && ['CREATOR', 'VERIFIER', 'APPROVER'].includes(storedRole)) {
                    setUserRole(storedRole);
                }
                if (storedName) setUserName(storedName);
            }
        };

        resolveMe();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!isProfileOpen) return;

        const onPointerDown = (event) => {
            const target = event.target;
            if (profileRef.current && !profileRef.current.contains(target)) {
                setIsProfileOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
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
    }, [isProfileOpen]);

    const handleLogout = () => {
        setIsProfileOpen(false);
        setIsSidebarOpen(false);
        apiClient.post('/auth/logout').catch(() => undefined);
        authStorage.clearAuthStorage();
        clearCachedMe();
        navigate('/');
    };

    const getNavItems = (role) => {
        if (role === 'VERIFIER') {
            return [
                { path: '/imc/dashboard', label: t('imcLayout.nav.dashboard'), icon: LayoutDashboard },
                { path: '/imc/queue', label: t('imcLayout.nav.queueVerification'), icon: ListFilter },
                { path: '/imc/returned', label: t('imcLayout.nav.returned'), icon: AlertCircle },
                { path: '/imc/history', label: t('imcLayout.nav.verificationHistory'), icon: CheckCircle },
                { path: '/imc/guidelines', label: t('imcLayout.nav.guidelines'), icon: FileText }
            ];
        }
        if (role === 'APPROVER') {
            return [
                { path: '/imc/dashboard', label: t('imcLayout.nav.dashboard'), icon: LayoutDashboard },
                { path: '/imc/queue', label: t('imcLayout.nav.queueApproval'), icon: ListFilter },
                { path: '/imc/approved', label: t('imcLayout.nav.approved'), icon: CheckCircle },
                { path: '/imc/rejected', label: t('imcLayout.nav.rejected'), icon: AlertCircle },
                { path: '/imc/history', label: t('imcLayout.nav.approvalHistory'), icon: FileText }
            ];
        }

        return [
            { path: '/imc/dashboard', label: t('imcLayout.nav.dashboard'), icon: LayoutDashboard },
            { path: '/imc/queue', label: t('imcLayout.nav.queue'), icon: ListFilter },
            { path: '/imc/vendors', label: t('imcLayout.nav.vendors'), icon: User },
            { path: '/imc/directory', label: t('imcLayout.nav.directory'), icon: Building },
            { path: '/imc/history', label: t('imcLayout.nav.history'), icon: CheckCircle },
            { path: '/imc/reports', label: t('imcLayout.nav.reports'), icon: FileBarChart },
        ];
    };

    const navItems = getNavItems(userRole);

    const getRoleLabel = (role) => {
        switch (role) {
            case 'CREATOR': return t('imcLayout.roles.CREATOR');
            case 'VERIFIER': return t('imcLayout.roles.VERIFIER');
            case 'APPROVER': return t('imcLayout.roles.APPROVER');
            default: return t('imcLayout.roles.OFFICIAL');
        }
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
                        <img src="/imc-logo-enhanced.png" alt="IMC" style={{ height: '34px' }} />
                        <div className="desktop-only" style={{ flexDirection: 'column', lineHeight: 1.15 }}>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{t('brand.org')}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--gray-600)', letterSpacing: '0.04em' }}>{t('brand.officialPortal')}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="desktop-only" style={{
                        alignItems: 'center', gap: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'var(--gray-100)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <Shield size={14} color="var(--gray-600)" />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                            <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                color: 'var(--gray-600)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase'
                            }}>
                                {t('imcLayout.authority')}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-color)' }}>
                                {getRoleLabel(userRole)}
                            </span>
                        </div>
                    </div>

                    <LanguageToggle />
                    <ThemeToggle />

                    <div ref={profileRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{userName || 'IMC User'}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)' }}>{getRoleLabel(userRole)}</div>
                            </div>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--gray-200)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--gray-600)'
                            }}>
                                <User size={18} />
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
                                borderRadius: '6px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                padding: '0.5rem',
                                zIndex: 60
                            }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem',
                                        color: '#DC2626',
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
                        <div style={{ paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 700, letterSpacing: '0.05em' }}>
                            {t('imcLayout.mainNavigation')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        minHeight: '44px',
                                        color: isActive ? 'white' : 'var(--gray-600)',
                                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                                        transition: 'all 0.15s',
                                        borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent'
                                    })}
                                >
                                    <item.icon size={18} />
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
                                    padding: '0.65rem 1rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    minHeight: '44px'
                                }}
                            >
                                <LogOut size={18} /> {t('common.logout')}
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

export default IMCDashboardLayout;

