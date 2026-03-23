import { Landmark, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InputField = ({ label, type = "text", placeholder, value, onChange, icon: Icon, required = false, error }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-color)'
        }}>
            {label} {required && <span style={{ color: 'var(--gov-danger, #DC2626)' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${error ? 'var(--gov-danger, #DC2626)' : 'var(--border-color)'}`,
                    fontSize: '1rem',
                    color: 'var(--text-color)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: 'var(--card-bg)'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => !error && (e.target.style.borderColor = 'var(--border-color)')}
            />
            {Icon && (
                <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: error ? 'var(--gov-danger, #DC2626)' : 'var(--gray-400)'
                }}>
                    <Icon size={18} />
                </div>
            )}
            {error && (
                <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--gov-danger, #DC2626)'
                }}>
                    <AlertCircle size={18} />
                </div>
            )}
        </div>
        {error && (
            <p style={{
                color: 'var(--gov-danger, #DC2626)',
                fontSize: '0.8rem',
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                {error}
            </p>
        )}
    </div>
);

const ReviewRow = ({ label, value }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border-color)'
    }}>
        <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-color)', fontWeight: 600 }}>{value || '-'}</span>
    </div>
);

const BankDetailsReview = ({ bankData, updateBankData, allData, errors = {} }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <div style={{
                backgroundColor: 'var(--gray-100)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'start'
            }}>
                <AlertCircle className="text-primary flex-shrink-0" size={24} />
                <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{t('vendorReg.bank.securityTitle')}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                        {t('vendorReg.bank.securityText')}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                <InputField
                    label={t('vendorReg.bank.ifsc')}
                    placeholder={t('vendorReg.bank.ifscPh')}
                    value={bankData.bankIfsc}
                    onChange={(e) => updateBankData('bankIfsc', e.target.value.toUpperCase())}
                    icon={Landmark}
                    error={errors.bankIfsc}
                    required
                />

                <InputField
                    label={t('vendorReg.bank.accountNumber')}
                    placeholder={t('vendorReg.bank.accountNumberPh')}
                    value={bankData.bankAccountNumber}
                    onChange={(e) => updateBankData('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                    icon={CreditCard}
                    error={errors.bankAccountNumber}
                    required
                />
            </div>

            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-color)',
                marginBottom: '1.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <CheckCircle className="text-green-600" size={24} />
                {t('vendorReg.review.title')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('vendorReg.review.businessTitle')}
                    </h4>
                    <ReviewRow label={t('vendorReg.review.firmName')} value={allData.businessIdentity.firmName} />
                    <ReviewRow label={t('vendorReg.review.firmType')} value={allData.businessIdentity.firmType} />
                    <ReviewRow label={t('vendorReg.review.email')} value={allData.businessIdentity.email} />
                    <ReviewRow label={t('vendorReg.review.pan')} value={allData.businessIdentity.panNumber} />
                    <ReviewRow label={t('vendorReg.review.gstin')} value={allData.businessIdentity.gstinNumber} />
                </div>

                <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('vendorReg.review.contactTitle')}
                    </h4>
                    <ReviewRow label={t('vendorReg.review.authorizedPerson')} value={allData.contactDetails.authorizedPersonName} />
                    <ReviewRow label={t('vendorReg.review.designation')} value={allData.contactDetails.authorizedPersonDesignation} />
                    <ReviewRow label={t('vendorReg.review.mobile')} value={allData.contactDetails.mobile} />
                    <ReviewRow label={t('vendorReg.review.address')} value={`${allData.contactDetails.addressLine}, ${allData.contactDetails.city}`} />
                    <ReviewRow label={t('vendorReg.review.aadhaar')} value={allData.contactDetails.authorizedPersonAadhaar} />
                </div>
            </div>
        </div>
    );
};

export default BankDetailsReview;

