import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('public.aboutTitle')}</h1>
                        <p>
                            {t('public.aboutSubtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.purpose')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('public.purposeText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.whoCanUse')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li><strong>{t('auth.vendorPortal')}</strong> {t('public.whoVendor')}</li>
                                    <li><strong>{t('auth.officialPortal')}</strong> {t('public.whoOfficials')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.included')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.included1')}</li>
                                    <li>{t('public.included2')}</li>
                                    <li>{t('public.included3')}</li>
                                    <li>{t('public.included4')}</li>
                                    <li>{t('public.included5')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.scopeNotes')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('public.scopeNotesText')}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
