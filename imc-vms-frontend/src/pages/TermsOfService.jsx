import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('public.termsTitle')}</h1>
                        <p>
                            {t('public.effective')} {t('public.basicTermsNote')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.acceptTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('terms.acceptText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.responsTitle')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('terms.respons1')}</li>
                                    <li>{t('terms.respons2')}</li>
                                    <li>{t('terms.respons3')}</li>
                                    <li>{t('terms.respons4')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.rightsTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('terms.rightsText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.availabilityTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('terms.availabilityText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.liabilityTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('terms.liabilityText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('terms.governingTitle')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('terms.governingText')}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfService;
