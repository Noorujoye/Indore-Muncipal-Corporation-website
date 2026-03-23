import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('public.privacyTitle')}</h1>
                        <p>
                            {t('public.effective')} {t('public.basicLegalNote')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.infoCollectTitle')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('privacy.infoCollect1')}</li>
                                    <li>{t('privacy.infoCollect2')}</li>
                                    <li>{t('privacy.infoCollect3')}</li>
                                    <li>{t('privacy.infoCollect4')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.useTitle')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('privacy.use1')}</li>
                                    <li>{t('privacy.use2')}</li>
                                    <li>{t('privacy.use3')}</li>
                                    <li>{t('privacy.use4')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.sharingTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('privacy.sharingText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.cookiesTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('privacy.cookiesText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.retentionTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('privacy.retentionText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('privacy.contactTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('privacy.contactText')}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
