import { User, Briefcase, Phone, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';
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

const ContactResponsibility = ({ data, updateData, errors = {} }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--text-color)',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <User className="text-primary" size={20} />
                    {t('vendorReg.contact.authorizedTitle')}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <InputField
                        label={t('vendorReg.contact.fullName')}
                        placeholder={t('vendorReg.contact.fullNamePh')}
                        value={data.authorizedPersonName}
                        onChange={(e) => updateData('authorizedPersonName', e.target.value)}
                        icon={User}
                        error={errors.authorizedPersonName}
                        required
                    />

                    <InputField
                        label={t('vendorReg.contact.designation')}
                        placeholder={t('vendorReg.contact.designationPh')}
                        value={data.authorizedPersonDesignation}
                        onChange={(e) => updateData('authorizedPersonDesignation', e.target.value)}
                        icon={Briefcase}
                        error={errors.authorizedPersonDesignation}
                        required
                    />

                    <InputField
                        label={t('vendorReg.contact.dob')}
                        type="date"
                        value={data.authorizedPersonDob}
                        onChange={(e) => updateData('authorizedPersonDob', e.target.value)}
                        icon={Calendar}
                        error={errors.authorizedPersonDob}
                        required
                    />

                    <InputField
                        label={t('vendorReg.contact.mobile')}
                        type="tel"
                        placeholder={t('vendorReg.contact.mobilePh')}
                        value={data.mobile}
                        onChange={(e) => updateData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        icon={Phone}
                        error={errors.mobile}
                        required
                    />

                    <InputField
                        label={t('vendorReg.contact.aadhaar')}
                        placeholder={t('vendorReg.contact.aadhaarPh')}
                        value={data.authorizedPersonAadhaar}
                        onChange={(e) => updateData('authorizedPersonAadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        icon={FileText}
                        error={errors.authorizedPersonAadhaar}
                        required
                    />
                </div>
            </div>

            <div>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--text-color)',
                    marginBottom: '1.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <MapPin className="text-primary" size={20} />
                    {t('vendorReg.contact.addressTitle')}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <InputField
                            label={t('vendorReg.contact.addressLine')}
                            placeholder={t('vendorReg.contact.addressLinePh')}
                            value={data.addressLine}
                            onChange={(e) => updateData('addressLine', e.target.value)}
                            icon={MapPin}
                            error={errors.addressLine}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', width: '100%', gridColumn: '1 / -1' }}>
                        <InputField
                            label={t('vendorReg.contact.city')}
                            value={data.city}
                            onChange={(e) => updateData('city', e.target.value)}
                            error={errors.city}
                            required
                        />
                        <InputField
                            label={t('vendorReg.contact.district')}
                            value={data.district}
                            onChange={(e) => updateData('district', e.target.value)}
                            error={errors.district}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', width: '100%', gridColumn: '1 / -1' }}>
                        <InputField
                            label={t('vendorReg.contact.state')}
                            value={data.state}
                            onChange={(e) => updateData('state', e.target.value)}
                            error={errors.state}
                            required
                        />
                        <InputField
                            label={t('vendorReg.contact.pincode')}
                            type="text"
                            placeholder={t('vendorReg.contact.pincodePh')}
                            value={data.pincode}
                            onChange={(e) => updateData('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            error={errors.pincode}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactResponsibility;

