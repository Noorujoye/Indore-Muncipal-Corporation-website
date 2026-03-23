import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useTranslation } from 'react-i18next';

const ContactSupport = () => {
    const { t } = useTranslation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('public.contactTitle')}</h1>
                        <p>
                            {t('public.contactSubtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.primaryChannel')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65 }}>{t('public.primaryChannelText')}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <Link
                                        to="/vendor/login"
                                        className="btn btn-outline"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {t('public.vendorLoginHelpdesk')}
                                    </Link>
                                    <Link
                                        to="/imc/login"
                                        className="btn btn-outline"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {t('public.imcLogin')}
                                    </Link>
                                </div>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0, marginTop: '0.75rem' }}>
                                    {t('public.includeLine')}
                                </p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.escalation')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.esc1')}</li>
                                    <li>{t('public.esc2')}</li>
                                    <li>{t('public.esc3')}</li>
                                </ul>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0, marginTop: '0.75rem' }}>
                                    {t('public.contactNote')}
                                </p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.ticketReasons')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.ticket1')}</li>
                                    <li>{t('public.ticket2')}</li>
                                    <li>{t('public.ticket3')}</li>
                                    <li>{t('public.ticket4')}</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactSupport;
