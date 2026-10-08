import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const LoginModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const modalRef = useRef(null);

    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleRoleSelect = (path) => {
        onClose();
        navigate(path);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
                onClick={handleBackdropClick}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                    }}
                    ref={modalRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        padding: '1.25rem clamp(1rem, 3vw, 2rem)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--gray-100)'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                                {t('auth.loginToSystem')}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                {t('auth.selectRole')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--gray-600)',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                minWidth: '40px',
                                minHeight: '40px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gov-danger, #EF4444)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>

                        <div
                            style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'var(--card-bg)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => handleRoleSelect('/vendor/login')}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: 'var(--primary)'
                            }}>
                                <Truck size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                                {t('auth.vendorLogin')}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {t('auth.vendorLoginDesc')}
                            </p>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--primary)',
                                backgroundColor: 'transparent',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                minHeight: '44px'
                            }}>
                                {t('auth.continueVendor')}
                            </button>
                        </div>

                        <div
                            style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'var(--card-bg)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--secondary)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => handleRoleSelect('/imc/login')}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: 'color-mix(in srgb, var(--secondary) 15%, transparent)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: 'var(--secondary)'
                            }}>
                                <Building2 size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                                {t('auth.imcUserLogin')}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {t('auth.imcUserLoginDesc')}
                            </p>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--secondary)',
                                backgroundColor: 'transparent',
                                color: 'var(--secondary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                minHeight: '44px'
                            }}>
                                {t('auth.continueImc')}
                            </button>
                        </div>

                    </div>

                    <div style={{
                        padding: '1rem clamp(1rem, 3vw, 2rem)',
                        backgroundColor: 'var(--gray-100)',
                        borderTop: '1px solid var(--border-color)',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--gray-600)'
                    }}>
                        {t('auth.policyNote')}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

LoginModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default LoginModal;

