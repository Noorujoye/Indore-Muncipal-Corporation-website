import { useEffect, useState } from 'react';
import { User, Lock, Building, CreditCard, Edit2, X, Check, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import MessageBanner from '../../components/common/MessageBanner';

const VendorProfile = () => {
    const { t } = useTranslation();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [requestForm, setRequestForm] = useState({ reason: '', details: '' });
    const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
    const [showRequestSuccess, setShowRequestSuccess] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState('');

    const [profile, setProfile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        let isActive = true;
        let objectUrlToRevoke = null;

        const load = async () => {
            try {
                const data = await apiClient.get('/vendor/profile');
                if (!isActive) return;
                setProfile(data);

                if (data?.hasLogo) {
                    const blob = await apiClient.get('/vendor/profile/logo', { responseType: 'blob' });
                    if (!isActive) return;
                    objectUrlToRevoke = URL.createObjectURL(blob);
                    setLogoUrl(objectUrlToRevoke);
                } else {
                    setLogoUrl(null);
                }
            } catch (e) {
                setProfile(null);
                setLogoUrl(null);
            }
        };

        load();

        return () => {
            isActive = false;
            if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
            }
        };
    }, []);

    const vendorIdLabel = profile?.id ? `VND-${profile.id}` : '';
    const addressLabel = profile
        ? [profile.addressLine, profile.city, profile.district, profile.state, profile.pincode].filter(Boolean).join(', ')
        : '';

    const maskedAadhaar = profile?.authorizedPersonAadhaar
        ? `XXXX-XXXX-${String(profile.authorizedPersonAadhaar).slice(-4)} (${t('vendorProfile.aadhaarAuthPerson', { defaultValue: 'Auth. Person' })})`
        : '';

    const maskedBankAccount = profile?.bankAccountNumber
        ? `XXXXXXXX${String(profile.bankAccountNumber).slice(-4)}`
        : '';

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            alert(t('vendorProfile.password.mismatch'));
            return;
        }
        
        setShowPasswordSuccess(true);
        setTimeout(() => {
            setShowPasswordSuccess(false);
            setIsPasswordModalOpen(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        }, 2000);
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (requestLoading) return;

        setRequestLoading(true);
        setRequestError('');
        try {
            await apiClient.post('/vendor/profile/update-request', {
                reason: requestForm.reason,
                details: requestForm.details
            });

            setShowRequestSuccess(true);
            setTimeout(() => {
                setShowRequestSuccess(false);
                setIsRequestModalOpen(false);
                setRequestForm({ reason: '', details: '' });
            }, 1500);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to submit request';
            setRequestError(message);
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {t('vendorProfile.title')}
                </h1>
                <p style={{ color: '#64748B' }}>{t('vendorProfile.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <div style={{ backgroundColor: '#0A3D62', height: '100px' }}></div>
                        <div style={{ padding: '0 2rem 2rem', marginTop: '-50px', position: 'relative' }}>
                            <div style={{
                                width: '100px', height: '100px',
                                backgroundColor: 'white', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0A3D62', border: '4px solid white',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={logoUrl || ""}
                                    alt={t('vendorProfile.profileImageAlt')}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: logoUrl ? 'block' : 'none' }}
                                    onError={() => setLogoUrl(null)}
                                />
                                {!logoUrl && <Building size={48} />}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px',
                                    display: 'flex', justifyContent: 'center', cursor: 'pointer'
                                }} onClick={() => alert(t('vendorProfile.photoUpdateAlert'))}> 
                                    <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>{profile?.firmName || '-'}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{vendorIdLabel}</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{
                                        backgroundColor: '#DCFCE7', color: '#166534',
                                        padding: '0.25rem 0.75rem', borderRadius: '100px',
                                        fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
                                    }}>
                                        <ShieldCheck size={12} /> {t(`status.${profile?.status}`, { defaultValue: profile?.status || '-' })}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                    <Mail size={16} /> {profile?.email || '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                    <Phone size={16} /> {profile?.mobile || '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                    <MapPin size={16} style={{ marginTop: '2px' }} /> {addressLabel || '-'}
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
                                <button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '6px',
                                        border: '1px solid #E2E8F0', backgroundColor: 'white',
                                        color: '#334155', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Edit2 size={16} /> {t('vendorProfile.requestProfileUpdate')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={18} /> {t('vendorProfile.security')}
                        </h3>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '6px',
                                backgroundColor: '#0F172A', color: 'white',
                                border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                            }}
                        >
                            {t('vendorProfile.password.change')}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={18} /> {t('vendorProfile.complianceDocuments')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <ReadOnlyField label={t('vendorProfile.fields.pan')} value={profile?.panNumber || '-'} />
                            <ReadOnlyField label={t('vendorProfile.fields.gstin')} value={profile?.gstinNumber || '-'} />
                            <ReadOnlyField label={t('vendorProfile.fields.aadhaarLinked')} value={maskedAadhaar || '-'} />
                        </div>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem', color: '#64748B', border: '1px dashed #CBD5E1' }}>
                            {t('vendorProfile.complianceNote')}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CreditCard size={18} /> {t('vendorProfile.financialDetails')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <ReadOnlyField label={t('vendorProfile.fields.bankAccountNumber')} value={maskedBankAccount || '-'} isSecure />
                            <ReadOnlyField label={t('vendorProfile.fields.ifscCode')} value={profile?.bankIfsc || '-'} />
                        </div>
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px',
                        padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{t('vendorProfile.password.change')}</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#64748B" />
                            </button>
                        </div>

                        {showPasswordSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#166534' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <div style={{ padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '50%' }}>
                                        <Check size={32} />
                                    </div>
                                </div>
                                <p style={{ fontWeight: 600 }}>{t('vendorProfile.password.success')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>{t('vendorProfile.password.current')}</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.current}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>{t('vendorProfile.password.new')}</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.new}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>{t('vendorProfile.password.confirm')}</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.confirm}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <button type="submit" style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem', borderRadius: '6px',
                                    backgroundColor: '#0F172A', color: 'white',
                                    border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
                                }}>
                                    {t('vendorProfile.password.update')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {isRequestModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
                        padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{t('vendorProfile.requestProfileUpdate')}</h3>
                            <button onClick={() => setIsRequestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#64748B" />
                            </button>
                        </div>

                        {showRequestSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#166534' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <div style={{ padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '50%' }}>
                                        <Check size={32} />
                                    </div>
                                </div>
                                <p style={{ fontWeight: 600 }}>{t('vendorProfile.request.successTitle')}</p>
                                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>{t('vendorProfile.request.successSubtitle')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <MessageBanner
                                    variant="error"
                                    message={requestError}
                                    onClose={() => setRequestError('')}
                                />
                                <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem', color: '#64748B', border: '1px solid #E2E8F0' }}>
                                    {t('vendorProfile.request.note')}
                                </div>
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>{t('vendorProfile.request.reasonLabel')}</label>
                                    <select
                                        required
                                        value={requestForm.reason}
                                        onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                                    >
                                        <option value="">{t('vendorProfile.request.selectReason')}</option>
                                        <option value="Incorrect Address">{t('vendorProfile.request.reasons.incorrectAddress')}</option>
                                        <option value="Update Phone/Email">{t('vendorProfile.request.reasons.updatePhoneEmail')}</option>
                                        <option value="Name Change (Legal)">{t('vendorProfile.request.reasons.nameChangeLegal')}</option>
                                        <option value="Bank Details Update">{t('vendorProfile.request.reasons.bankDetailsUpdate')}</option>
                                        <option value="Other">{t('vendorProfile.request.reasons.other')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>{t('vendorProfile.request.detailsLabel')}</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder={t('vendorProfile.request.detailsPlaceholder')}
                                        value={requestForm.details}
                                        onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.95rem', resize: 'vertical' }}
                                    />
                                </div>
                                <button type="submit" style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem', borderRadius: '6px',
                                    backgroundColor: '#0F172A', color: 'white',
                                    border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'
                                }} disabled={requestLoading}>
                                    {requestLoading ? 'Submitting...' : t('vendorProfile.request.submit')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReadOnlyField = ({ label, value, isSecure }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</span>
        <div style={{
            fontSize: '1rem', fontWeight: 500, color: '#334155',
            backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px',
            border: '1px solid #E2E8F0', fontFamily: isSecure ? 'monospace' : 'inherit'
        }}>
            {value}
        </div>
    </div>
);

export default VendorProfile;

