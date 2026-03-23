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
import apiClient from '../../services/apiClient';

const IMCDashboardLayout = () => {
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
        apiClient.post('/auth/logout').catch(() => undefined);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('imc_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
        localStorage.removeItem('vendor_name');
        navigate('/');
    };

    const getNavItems = (role) => {
        if (role === 'VERIFIER') {
            return [
                { path: '/imc/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/imc/queue', label: 'Invoices for Verification', icon: ListFilter },
                { path: '/imc/returned', label: 'Returned from Approver', icon: AlertCircle },
                { path: '/imc/history', label: 'Verification History', icon: CheckCircle },
                { path: '/imc/guidelines', label: 'Guidelines', icon: FileText }
            ];
        }
        if (role === 'APPROVER') {
            return [
                { path: '/imc/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { path: '/imc/queue', label: 'Invoices for Approval', icon: ListFilter },
                { path: '/imc/approved', label: 'Approved (Ready for Payment)', icon: CheckCircle },
                { path: '/imc/rejected', label: 'Rejected Invoices', icon: AlertCircle },
                { path: '/imc/history', label: 'Approval History', icon: FileText }
            ];
        }
        
        return [
            { path: '/imc/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/imc/queue', label: 'Invoices Queue', icon: ListFilter },
            { path: '/imc/vendors', label: 'New Requests', icon: User },
            { path: '/imc/directory', label: 'Vendor Directory', icon: Building },
            { path: '/imc/reports', label: 'Reports', icon: FileBarChart },
        ];

    };

    const navItems = getNavItems(userRole);

    const getRoleLabel = (role) => {
        switch (role) {
            case 'CREATOR': return 'Invoice Creator';
            case 'VERIFIER': return 'Invoice Verifier';
            case 'APPROVER': return 'Final Approver';
            default: return 'IMC Official';
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>

            <header style={{
                height: '60px',
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
                zIndex: 50,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#334155' }}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src="/imc-logo-enhanced.png" alt="IMC" style={{ height: '32px' }} />
                        <div className="hidden sm:block" style={{ lineHeight: 1.1 }}>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>INDORE MUNICIPAL CORPORATION</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.5px' }}>OFFICIAL PORTAL</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="hidden sm:flex" style={{
                        alignItems: 'center', gap: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0'
                    }}>
                        <Shield size={14} color="#475569" />
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                            <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                color: '#64748B',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase'
                            }}>
                                Authority
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                                {getRoleLabel(userRole)}
                            </span>
                        </div>
                    </div>

                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <Bell size={20} />
                    </button>

                    <div ref={profileRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                borderRadius: '4px'
                            }}
                        >
                            <div className="hidden sm:block" style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{userName || 'IMC User'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{getRoleLabel(userRole)}</div>
                            </div>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#475569'
                            }}>
                                <User size={18} />
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
                                borderRadius: '4px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                border: '1px solid #E2E8F0',
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
                                        gap: '0.5rem'
                                    }}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, marginTop: '60px' }}>
                <aside style={{
                    width: '250px',
                    backgroundColor: '#1E293B', 
                    borderRight: '1px solid #0F172A',
                    position: 'fixed',
                    top: '60px',
                    bottom: 0,
                    left: 0,
                    zIndex: 40,
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    '@media (min-width: 768px)': { transform: 'translateX(0)' }
                }} className={`fixed md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav style={{ padding: '1.5rem 0.75rem' }}>
                        <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingLeft: '0.5rem', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>
                            MAIN NAVIGATION
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '4px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: isActive ? 'white' : '#CBD5E1', 
                                        backgroundColor: isActive ? '#003366' : 'transparent', 
                                        transition: 'background-color 0.15s',
                                        borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent'
                                    })}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </nav>
                </aside>

                <main style={{
                    flex: 1,
                    padding: '2rem',
                    marginLeft: '0',
                    '@media (min-width: 768px)': { marginLeft: '250px' }
                }} className="md:ml-[250px] w-full">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="md:hidden"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 30 }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default IMCDashboardLayout;

