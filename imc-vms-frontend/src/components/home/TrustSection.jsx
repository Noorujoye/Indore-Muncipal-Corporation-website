import { ShieldCheck, Eye, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustSection = () => {
    const { t } = useTranslation();
    const features = [
        { icon: ShieldCheck, title: t('home.trustSecureTitle'), desc: t('home.trustSecureDesc') },
        { icon: Eye, title: t('home.trustTransparentTitle'), desc: t('home.trustTransparentDesc') },
        { icon: Zap, title: t('home.trustEfficientTitle'), desc: t('home.trustEfficientDesc') }
    ];

    return (
        <section className="home-trust">
            <div className="home-trust__wrap">
                <div className="home-trust__header">
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: 'var(--gov-primary)',
                    letterSpacing: '-0.02em'
                }}>
                    {t('home.trustHeadline')}
                </h2>
                <div style={{ width: '60px', height: '4px', background: 'var(--secondary)', margin: '0 auto' }}></div>
                </div>

            <div className="home-trust__grid">
                {features.map((feature, index) => (
                    <div key={index} className="home-trust__card">
                        <div style={{
                            color: 'var(--gov-primary)',
                            padding: '1.25rem',
                            backgroundColor: 'var(--gray-100)',
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <feature.icon size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 style={{
                                fontWeight: 700,
                                color: 'var(--gov-text-primary)',
                                marginBottom: '0.5rem',
                                fontSize: '1.25rem'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                fontSize: '1rem',
                                color: 'var(--gov-text-secondary)',
                                lineHeight: 1.6
                            }}>
                                {feature.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </section>
    );
};

export default TrustSection;
