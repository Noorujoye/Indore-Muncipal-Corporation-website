import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VendorStepper from '../components/vendor/VendorStepper';
import BusinessIdentity from '../components/vendor/steps/BusinessIdentity';
import ContactResponsibility from '../components/vendor/steps/ContactResponsibility';
import BankDetailsReview from '../components/vendor/steps/BankDetailsReview';
import { motion, AnimatePresence } from 'framer-motion';
import { validateField } from '../utils/validation';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../services/apiClient';
import MessageBanner from '../components/common/MessageBanner';
import Modal from '../components/common/Modal';
import { useTranslation } from 'react-i18next';

const VendorRegistration = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [businessIdentity, setBusinessIdentity] = useState({
        firmName: '',
        firmType: 'Proprietorship',
        email: '',
        panNumber: '',
        gstinNumber: '',
        profilePhoto: null
    });

    
    const [contactDetails, setContactDetails] = useState({
        authorizedPersonName: '',
        authorizedPersonDesignation: '',
        authorizedPersonDob: '',
        mobile: '',
        authorizedPersonAadhaar: '',
        addressLine: '',
        city: 'Indore',
        district: 'Indore',
        state: 'Madhya Pradesh',
        pincode: ''
    });

    
    const [bankDetails, setBankDetails] = useState({
        bankIfsc: '',
        bankAccountNumber: ''
    });

    const [loading, setLoading] = useState(false);

    const [banner, setBanner] = useState(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    
    const updateBusiness = (field, value) => {
        setBusinessIdentity(prev => ({ ...prev, [field]: value }));

        
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const updateContact = (field, value) => {
        setContactDetails(prev => ({ ...prev, [field]: value }));

        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const updateBank = (field, value) => {
        setBankDetails(prev => ({ ...prev, [field]: value }));

        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    
    const validatePhase1 = () => {
        const newErrors = {};
        let isValid = true;
        Object.entries(businessIdentity).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const validatePhase2 = () => {
        const newErrors = {};
        let isValid = true;
        Object.entries(contactDetails).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const validatePhase3 = () => {
        const newErrors = {};
        let isValid = true;
        Object.entries(bankDetails).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (validatePhase1()) {
                setCurrentStep(2);
                window.scrollTo(0, 0);
            }
        } else if (currentStep === 2) {
            if (validatePhase2()) {
                setCurrentStep(3);
                window.scrollTo(0, 0);
            }
        }
    };

    const handleSubmit = async () => {
        if (!validatePhase3()) return;

        setLoading(true);
        setBanner(null);
        const { profilePhoto, ...businessIdentityData } = businessIdentity;

        
        const payload = {
            ...businessIdentityData,
            ...contactDetails,
            ...bankDetails
        };

        try {
            
            
            if (profilePhoto instanceof File) {
                const formData = new FormData();
                formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
                formData.append('profilePhoto', profilePhoto);

                await apiClient.post('/vendors/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await apiClient.post('/vendors/register', payload);
            }

            setBanner(null);
            setSuccessModalOpen(true);
        } catch (err) {
            console.error("Registration failed", err);
            const data = err?.response?.data;
            let msg = data?.message || t('vendorReg.registrationFailedDefault');
            if (data && typeof data === 'object' && data.errors && typeof data.errors === 'object') {
                const firstKey = Object.keys(data.errors)[0];
                const firstError = firstKey ? data.errors[firstKey] : null;
                if (typeof firstError === 'string' && firstError.trim().length > 0) {
                    msg = firstError;
                }
            }
            setBanner({
                variant: 'error',
                title: t('vendorReg.registrationFailedTitle'),
                message: msg
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
            <Navbar
                onLoginClick={() => { }}
                showThemeToggle={false}
                showLanguageToggle={false}
            />

            <Modal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title={t('common.requestSubmittedTitle')}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: 1.5 }}>
                        {t('common.requestSubmitted')}
                    </p>
                    <p style={{ margin: 0, color: 'var(--gray-600)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                        {t('common.registrationUnderReview')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setSuccessModalOpen(false)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color: 'var(--gray-700)'
                            }}
                        >
                            {t('common.close')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSuccessModalOpen(false);
                                navigate('/vendor/login');
                            }}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                color: 'var(--white)'
                            }}
                        >
                            {t('common.goToLogin')}
                        </button>
                    </div>
                </div>
            </Modal>

            <main style={{ flex: 1, padding: '2.5rem 1rem' }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)',
                    padding: '2.25rem'
                }}>
                    <MessageBanner
                        variant={banner?.variant}
                        title={banner?.title}
                        message={banner?.message}
                        onClose={() => setBanner(null)}
                    />
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--gray-600)',
                            background: 'none',
                            border: 'none',
                            marginBottom: '1.5rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            padding: 0,
                            fontSize: '0.9rem',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--gray-600)'}
                    >
                        <ArrowLeft size={18} />
                        {t('common.backToHome')}
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: 'var(--primary)',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.025em'
                        }}>
                            {t('vendorReg.title')}
                        </h1>
                        <p style={{ color: 'var(--gray-600)', fontSize: '1.05rem' }}>
                            {t('vendorReg.subtitle')}
                        </p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '1rem',
                            fontSize: '0.85rem',
                            color: 'var(--secondary)',
                            backgroundColor: 'var(--gray-100)',
                            border: '1px solid var(--gray-200)',
                            padding: '0.4rem 1rem',
                            borderRadius: '100px',
                            width: 'fit-content',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            fontWeight: 600
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            {t('vendorReg.ssl')}
                        </div>
                    </div>

                    <VendorStepper currentStep={currentStep} />

                    <div style={{ minHeight: '400px', marginBottom: '3rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 1 && (
                                    <BusinessIdentity
                                        data={businessIdentity}
                                        updateData={updateBusiness}
                                        errors={errors}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <ContactResponsibility
                                        data={contactDetails}
                                        updateData={updateContact}
                                        errors={errors}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <BankDetailsReview
                                        bankData={bankDetails}
                                        updateBankData={updateBank}
                                        allData={{ businessIdentity, contactDetails }}
                                        errors={errors}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div style={{
                        marginTop: '3rem',
                        display: 'flex',
                        justifyContent: currentStep > 1 ? 'space-between' : 'flex-end',
                        borderTop: '1px solid #E2E8F0',
                        paddingTop: '2rem'
                    }}>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                style={{
                                    padding: '0.875rem 2.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-color)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t('common.back')}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={currentStep === 3 ? handleSubmit : handleNext}
                            style={{
                                padding: '0.875rem 2.5rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                boxShadow: 'var(--shadow-md)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {currentStep === 3 ? t('vendorReg.submitApplication') : t('vendorReg.nextStep')}
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VendorRegistration;

