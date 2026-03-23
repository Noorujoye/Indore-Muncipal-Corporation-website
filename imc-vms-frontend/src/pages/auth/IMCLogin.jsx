import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import MessageBanner from '../../components/common/MessageBanner';
import { User, Lock, Building2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import apiClient, { authStorage } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const IMCLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const redirectPath = useMemo(() => {
        const fromPath = location.state?.from?.pathname;
        if (typeof fromPath === 'string' && fromPath.startsWith('/imc/')) return fromPath;
        return '/imc/dashboard';
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const email = (formData.email || '').trim();
            
            
            const response = await apiClient.post('/auth/login', {
                email,
                password: formData.password
            });

            const { accessToken, refreshToken, role, name } = response;

            
            authStorage.storeTokens({ accessToken, refreshToken });

            
            if (!role || role === 'VENDOR') {
                apiClient.post('/auth/logout').catch(() => undefined);
                authStorage.clearAuthStorage();
                setError(t('auth.imcOnlyError'));
                return;
            }

            if (!['CREATOR', 'VERIFIER', 'APPROVER'].includes(role)) {
                apiClient.post('/auth/logout').catch(() => undefined);
                authStorage.clearAuthStorage();
                setError(t('auth.unauthorizedRole'));
                return;
            }

            
            localStorage.removeItem('user_role');
            localStorage.removeItem('vendor_name');

            if (role) {
                localStorage.setItem('imc_role', role); 
            }

            if (name) {
                localStorage.setItem('user_name', name);
            }

            
            navigate(redirectPath);

        } catch (err) {
            console.error("Login Failed:", err);
            setError(err.response?.data?.message || t('auth.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            role="imc"
            title={t('auth.officialAccess')}
            subtitle={t('auth.officialSubtitle')}
            illustration={<Building2 size={80} strokeWidth={1} />}
        >
            <form
                className="auth-form"
                style={{ '--auth-accent': 'var(--secondary)' }}
                onSubmit={handleSubmit}
            >
                <MessageBanner
                    variant="error"
                    message={error}
                    onClose={() => setError('')}
                />


                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label">
                        {t('auth.email')}
                    </label>
                    <div className="auth-inputWrap">
                        <input
                            type="email"
                            placeholder={t('auth.imcEmailPlaceholder')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="auth-input"
                            style={{ paddingLeft: '2.8rem' }}
                        />
                        <User size={18} className="auth-iconLeft" />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="auth-label auth-labelRow">
                        <span>{t('auth.password')}</span>
                        <a href="#" className="auth-link">{t('auth.forgotPassword')}</a>
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
                    {loading ? t('auth.authenticating') : t('auth.secureLogin')}
                    {!loading && <ArrowRight size={18} />}
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', fontStyle: 'italic' }} className="auth-helper">
                    {t('auth.restrictedAccess')}
                </div>
            </form>
        </AuthLayout>
    );
};

export default IMCLogin;
