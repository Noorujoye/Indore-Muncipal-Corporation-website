import { motion } from 'framer-motion';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className="home-hero">
            <div className="home-hero__wrap">
                <div className="home-hero__grid">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        color: 'var(--gov-text-primary)',
                        lineHeight: 1.1,
                    }}>
                        {t('home.heroTitlePrefix')} <span style={{ color: 'var(--gov-primary)' }}>{t('home.heroTitleAccent')}</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--gov-text-secondary)',
                        marginBottom: '2.5rem',
                        maxWidth: '540px',
                        lineHeight: 1.6,
                    }}>
                        {t('home.heroDesc')}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/vendor/register')}
                            style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '8px',
                                backgroundColor: 'var(--gov-primary)',
                            }}
                        >
                            {t('home.ctaVendorRegistration')}
                        </Button>
                    </div>
                </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

