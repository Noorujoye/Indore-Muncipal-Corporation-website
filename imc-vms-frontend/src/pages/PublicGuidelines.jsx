import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useTranslation } from 'react-i18next';

const PublicGuidelines = () => {
    const { t } = useTranslation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('public.guidelinesTitle')}</h1>
                        <p>
                            {t('public.guidelinesSubtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.docReq')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.doc1')}</li>
                                    <li>{t('public.doc2')}</li>
                                    <li>{t('public.doc3')}</li>
                                    <li>{t('public.doc4')}</li>
                                    <li>{t('public.doc5')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.rules')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.rule1')}</li>
                                    <li>{t('public.rule2')}</li>
                                    <li>{t('public.rule3')}</li>
                                    <li>{t('public.rule4')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.fileTypes')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('public.fileTypesText')}</p>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.statusMeanings')}</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gov-text-secondary)', lineHeight: 1.8 }}>
                                    <li>{t('public.stPending')}</li>
                                    <li>{t('public.stReturned')}</li>
                                    <li>{t('public.stRejected')}</li>
                                    <li>{t('public.stApproved')}</li>
                                </ul>
                            </div>
                        </section>

                        <section className="gov-card">
                            <div className="gov-card-body">
                                <h2 style={{ marginTop: 0, color: 'var(--gov-text-primary)' }}>{t('public.compliance')}</h2>
                                <p style={{ color: 'var(--gov-text-secondary)', lineHeight: 1.65, marginBottom: 0 }}>{t('public.complianceText')}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PublicGuidelines;
