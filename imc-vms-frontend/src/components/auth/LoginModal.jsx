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
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        width: '100%',
                        maxWidth: '600px',
                        overflow: 'hidden',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                    }}
                    ref={modalRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #F1F5F9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#FAFAFA'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                                {t('auth.loginToSystem')}
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                {t('auth.selectRole')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94A3B8',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.backgroundColor = '#F1F5F9'; e.target.style.color = '#EF4444'; }}
                            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#94A3B8'; }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        <div
                            style={{
                                padding: '1.5rem',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'white'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#0A3D62';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => handleRoleSelect('/vendor/login')}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: '#EFF6FF',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: '#0A3D62'
                            }}>
                                <Truck size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem' }}>
                                {t('auth.vendorLogin')}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {t('auth.vendorLoginDesc')}
                            </p>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #0A3D62',
                                backgroundColor: 'white',
                                color: '#0A3D62',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                {t('auth.continueVendor')}
                            </button>
                        </div>

                        <div
                            style={{
                                padding: '1.5rem',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: 'white'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#0A3D62';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#E2E8F0';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => handleRoleSelect('/imc/login')}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                
                                
                                
                                backgroundColor: '#E0F2FE',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: '#0369A1'
                            }}>
                                <Building2 size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem' }}>
                                {t('auth.imcUserLogin')}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                {t('auth.imcUserLoginDesc')}
                            </p>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #0369A1',
                                backgroundColor: 'white',
                                color: '#0369A1',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                {t('auth.continueImc')}
                            </button>
                        </div>

                    </div>

                    <div style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#F8FAFC',
                        borderTop: '1px solid #F1F5F9',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: '#94A3B8'
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

