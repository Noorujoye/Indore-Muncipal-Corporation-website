import { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import MessageBanner from '../../components/common/MessageBanner';
import { Mail, Lock, Truck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import apiClient, { authStorage } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const VendorLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState(null);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const redirectPath = useMemo(() => {
        const fromPath = location.state?.from?.pathname;
        if (typeof fromPath === 'string' && fromPath.startsWith('/vendor/')) return fromPath;
        return '/vendor/dashboard';
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setBanner(null);

        try {
            const email = (formData.email || '').trim();
            const response = await apiClient.post('/auth/login', {
                email,
                password: formData.password
            });

            const { accessToken, refreshToken, role, name } = response;

            
            if (role && role !== 'VENDOR') {
                authStorage.clearAuthStorage();
                setBanner({ variant: 'error', message: t('auth.vendorOnlyError') });
                return;
            }

            
            authStorage.storeTokens({ accessToken, refreshToken });

            if (name) {
                localStorage.setItem('vendor_name', name);
            }

            localStorage.setItem('user_role', 'VENDOR');

            
            localStorage.removeItem('imc_role');
            localStorage.removeItem('user_name');

            navigate(redirectPath);

        } catch (err) {
            console.error("Vendor Login Failed:", err);
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                t('auth.loginFailed');
            setBanner({ variant: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (forgotLoading) return;

        const email = (formData.email || '').trim();
        if (!email) {
            setBanner({ variant: 'error', message: 'Enter your email first, then click Forgot ID.' });
            return;
        }

        setForgotLoading(true);
        setBanner(null);
        try {
            const res = await apiClient.post('/vendors/forgot-password', { email });
            setBanner({
                variant: 'success',
                message: res?.message || 'If this email is registered and active, you will receive a reset link shortly.'
            });
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to submit request';
            setBanner({ variant: 'error', message });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <AuthLayout
            role="vendor"
            title={t('auth.welcomeBack')}
            subtitle={t('auth.vendorSubtitle')}
            illustration={<Truck size={80} strokeWidth={1} />}
        >
            <form
                className="auth-form"
                style={{ '--auth-accent': 'var(--primary)' }}
                onSubmit={handleSubmit}
            >
                <MessageBanner
                    variant={banner?.variant || 'info'}
                    message={banner?.message}
                    onClose={() => setBanner(null)}
                />
                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label">
                        {t('auth.emailAddress')}
                    </label>
                    <div className="auth-inputWrap">
                        <input
                            type="email"
                            placeholder={t('auth.vendorEmailPlaceholder')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="auth-input"
                            style={{ paddingLeft: '2.8rem' }}
                        />
                        <Mail size={18} className="auth-iconLeft" />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label auth-labelRow">
                        <span>{t('auth.password')}</span>
                        <button
                            type="button"
                            className="auth-link"
                            onClick={handleForgotPassword}
                            disabled={forgotLoading}
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: forgotLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {forgotLoading ? 'Sending...' : t('auth.forgotId')}
                        </button>
                    </label>
                    <div className="auth-inputWrap">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('auth.passwordPlaceholder')}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="auth-input"
                            style={{ paddingLeft: '2.8rem', paddingRight: '2.8rem' }}
                        />
                        <Lock size={18} className="auth-iconLeft" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="auth-iconRightBtn"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit"
                >
                    {loading ? t('auth.signingIn') : t('auth.signIn')}
                    {!loading && <ArrowRight size={18} />}
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }} className="auth-helper">
                    {t('auth.dontHaveAccount')}{' '}
                    <Link to="/vendor/register" className="auth-link">
                        {t('auth.registerBusiness')}
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default VendorLogin;
