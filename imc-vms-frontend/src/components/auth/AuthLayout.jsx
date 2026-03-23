import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AuthLayout = ({ children, title, subtitle, role, illustration }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
            <div style={{
                padding: '0.75rem 2rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                display: 'flex'
            }}>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src="/imc-logo-enhanced.png" alt="IMC Logo" style={{ height: '40px' }} />
                        <div style={{ lineHeight: 1.1 }}>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>INDORE MUNICIPAL CORPORATION</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600 }}>INVOICE MANAGEMENT SYSTEM</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--gray-600)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--gray-400)'; e.currentTarget.style.color = 'var(--text-color)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--gray-600)'; }}
                    >
                        <ArrowLeft size={16} />
                        {t('common.backToHome')}
                    </button>
                </div>
            </div>

            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, var(--gray-200) 0%, var(--bg-color) 100%)',
                    zIndex: 0
                }} />

                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    width: '100%',
                    maxWidth: '1000px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    minHeight: '600px'
                }}>
                    <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.35rem 0.75rem',
                                backgroundColor: 'var(--gray-100)',
                                color: role === 'vendor' ? 'var(--primary)' : 'var(--secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '100px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem'
                            }}>
                                {role === 'vendor' ? 'Vendor Portal' : 'Official Portal'}
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                                {title}
                            </h1>
                            <p style={{ color: 'var(--gray-600)', fontSize: '1rem' }}>
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>

                    <div style={{
                        flex: 1,
                        backgroundColor: '#0A3D62',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '3rem',
                        color: 'white',
                        textAlign: 'center',
                        backgroundImage: 'linear-gradient(135deg, #0A3D62 0%, #061F33 100%)',
                        position: 'relative'
                    }} className="hidden md:flex">
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            opacity: 0.1,
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />

                        <div style={{ position: 'relative', zIndex: 10, maxWidth: '320px' }}>
                            {illustration}
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>
                                {role === 'vendor' ? 'Grow with Indore' : 'Serving the City'}
                            </h3>
                            <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                                {role === 'vendor'
                                    ? 'Join thousands of vendors contributing to the development of India\'s cleanest city.'
                                    : 'Secure access for authorized municipal corporation officials.'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;

