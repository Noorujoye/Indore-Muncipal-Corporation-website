import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../components/auth/AuthLayout';
import MessageBanner from '../../components/common/MessageBanner';
import apiClient from '../../services/apiClient';

const SetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState(null);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const submitDisabled = loading || !token;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitDisabled) return;

        setBanner(null);
        const password = formData.password || '';
        const confirmPassword = formData.confirmPassword || '';

        if (password.trim().length < 8) {
            setBanner({ variant: 'error', message: t('setPassword.minChars') });
            return;
        }
        if (password !== confirmPassword) {
            setBanner({ variant: 'error', message: t('setPassword.mismatch') });
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/auth/set-password', {
                token,
                password
            });

            setBanner({ variant: 'success', message: res?.message || t('setPassword.success') });
            setTimeout(() => navigate('/vendor/login'), 800);

        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                t('setPassword.failed');
            setBanner({ variant: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            role="vendor"
            title={t('setPassword.title')}
            subtitle={t('setPassword.subtitle')}
        >
            <form
                className="auth-form"
                style={{ '--auth-accent': 'var(--primary)' }}
                onSubmit={handleSubmit}
            >
                <MessageBanner
                    variant={banner?.variant || 'info'}
                    message={banner?.message || (!token ? t('setPassword.invalidToken') : '')}
                    onClose={() => setBanner(null)}
                />

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label">{t('setPassword.newPassword')}</label>
                    <div className="auth-inputWrap">
                        <input
                            type="password"
                            placeholder={t('setPassword.newPasswordPlaceholder')}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="auth-input"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label">{t('setPassword.confirmPassword')}</label>
                    <div className="auth-inputWrap">
                        <input
                            type="password"
                            placeholder={t('setPassword.confirmPasswordPlaceholder')}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            className="auth-input"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitDisabled}
                    className="auth-submit"
                >
                    {loading ? t('setPassword.updating') : t('setPassword.submit')}
                </button>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }} className="auth-helper">
                    <Link to="/vendor/login" className="auth-link">{t('common.goToLogin')}</Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default SetPassword;
