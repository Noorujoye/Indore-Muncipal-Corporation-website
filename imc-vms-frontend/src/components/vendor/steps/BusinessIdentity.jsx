import { Building2, Mail, CreditCard, FileText, AlertCircle } from 'lucide-react';
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

const SelectField = ({ label, options, value, onChange, icon: Icon, required = false, error }) => (
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
            <select
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
                    backgroundColor: 'var(--card-bg)',
                    appearance: 'none',
                    cursor: 'pointer'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => !error && (e.target.style.borderColor = 'var(--border-color)')}
            >
                {options.map((opt) => {
                    if (typeof opt === 'string') {
                        return (
                            <option key={opt} value={opt}>{opt}</option>
                        );
                    }
                    return (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    );
                })}
            </select>
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
        </div>
    </div>
);

const BusinessIdentity = ({ data, updateData, errors = {} }) => {
    const { t } = useTranslation();
    const firmTypeOptions = [
        { value: 'Proprietorship', label: t('vendorReg.firmType.proprietorship') },
        { value: 'Partnership', label: t('vendorReg.firmType.partnership') },
        { value: 'Private Limited', label: t('vendorReg.firmType.privateLimited') },
        { value: 'Public Limited', label: t('vendorReg.firmType.publicLimited') },
        { value: 'LLP', label: t('vendorReg.firmType.llp') },
        { value: 'Joint Venture', label: t('vendorReg.firmType.jointVenture') }
    ];

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-color)' }}>
                {t('vendorReg.step1')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div>
                    <InputField
                        label={t('vendorReg.business.firmName')}
                        placeholder={t('vendorReg.business.firmNamePh')}
                        value={data.firmName}
                        onChange={(e) => updateData('firmName', e.target.value)}
                        icon={Building2}
                        error={errors.firmName}
                        required
                    />

                    <SelectField
                        label={t('vendorReg.business.firmType')}
                        options={firmTypeOptions}
                        value={data.firmType}
                        onChange={(e) => updateData('firmType', e.target.value)}
                        icon={FileText}
                        error={errors.firmType}
                        required
                    />

                    <InputField
                        label={t('vendorReg.business.email')}
                        type="email"
                        placeholder={t('vendorReg.business.emailPh')}
                        value={data.email}
                        onChange={(e) => updateData('email', e.target.value)}
                        icon={Mail}
                        error={errors.email}
                        required
                    />
                </div>

                <div>
                    <InputField
                        label={t('vendorReg.business.pan')}
                        placeholder={t('vendorReg.business.panPh')}
                        value={data.panNumber}
                        onChange={(e) => updateData('panNumber', e.target.value.toUpperCase())}
                        icon={CreditCard}
                        error={errors.panNumber}
                        required
                    />

                    <InputField
                        label={t('vendorReg.business.gstin')}
                        placeholder={t('vendorReg.business.gstinPh')}
                        value={data.gstinNumber}
                        onChange={(e) => updateData('gstinNumber', e.target.value.toUpperCase())}
                        icon={FileText}
                        error={errors.gstinNumber}
                        required
                    />

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                            {t('vendorReg.business.logo')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => updateData('profilePhoto', e.target.files[0])}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-color)',
                                    backgroundColor: 'var(--card-bg)'
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem' }}>
                            {t('vendorReg.business.logoHelp')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessIdentity;

