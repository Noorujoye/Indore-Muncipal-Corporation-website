import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/common/PageHeader';
import { BookOpen, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const Guidelines = () => {
    const { t } = useTranslation();
    const role = localStorage.getItem('imc_role') || 'CREATOR';

    return (
        <div>
            <PageHeader
                title={t('guidelinesPage.title')}
                subtitle={t('guidelinesPage.subtitle', { role })}
            />

            <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>

                <div className="gov-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color, #0A3D62)', marginBottom: '1rem' }}>
                        <Shield size={20} color="var(--primary, #0A3D62)" /> {t('guidelinesPage.complianceTitle')}
                    </h3>
                    <p style={{ lineHeight: 1.6, color: 'var(--text-color, #334155)' }}>
                        {t('guidelinesPage.complianceDesc', { role })}
                    </p>
                </div>

                <div className="gov-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color, #0A3D62)', marginBottom: '1rem' }}>
                        <BookOpen size={20} color="var(--primary, #0A3D62)" /> {t('guidelinesPage.checklistTitle', { role })}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--body-bg, #F0F9FF)', border: '1px solid var(--border-color, #BAE6FD)', borderRadius: '6px' }}>
                            <CheckCircle size={20} color="#0284C7" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-color, #0369A1)' }}>{t('guidelinesPage.mandatoryDocTitle')}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted, #0C4A6E)' }}>{t('guidelinesPage.mandatoryDocDesc')}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--body-bg, #FEFCE8)', border: '1px solid var(--border-color, #FEF08A)', borderRadius: '6px' }}>
                            <AlertTriangle size={20} color="#CA8A04" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-color, #854D0E)' }}>{t('guidelinesPage.discrepancyTitle')}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted, #713F12)' }}>{t('guidelinesPage.discrepancyDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Guidelines;

