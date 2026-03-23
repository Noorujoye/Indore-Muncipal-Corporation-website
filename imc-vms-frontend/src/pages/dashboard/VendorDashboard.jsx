import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, AlertCircle, CheckCircle, Bell, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const VendorDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const counts = await apiClient.get('/vendor/dashboard/counts');

                const pending = Number(counts?.pendingInvoices ?? 0);
                const approved = Number(counts?.approvedInvoices ?? 0);
                const rejected = Number(counts?.rejectedInvoices ?? 0);
                const totalSubmitted = pending + approved + rejected;

                
                setData({
                    totalSubmitted,
                    pendingCount: pending,
                    
                    paidCount: approved,
                    rejectedCount: rejected,
                    activeTenders: Number(counts?.activeTenders ?? 0),
                    urgentActions: [],
                });
            } catch (error) {
                console.error("Failed to fetch vendor stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('vendorDashboard.loading')}</div>;
    if (!data) return <div>{t('vendorDashboard.errorLoading')}</div>;

    const vendorName = localStorage.getItem('vendor_name');

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {t('vendorDashboard.title')}
                </h1>
                <p style={{ color: '#64748B' }}>
                    {vendorName
                        ? t('vendorDashboard.welcomeBackName', { name: vendorName })
                        : t('vendorDashboard.welcomeBack')}
                </p>
            </div>



            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem'
            }}>
                {[
                    { label: t('vendorDashboard.kpi.totalInvoices'), value: data.totalSubmitted, color: '#3B82F6' },
                    { label: t('vendorDashboard.kpi.inProcess'), value: data.pendingCount, color: '#EAB308' },
                    { label: t('vendorDashboard.kpi.paid'), value: data.paidCount, color: '#10B981' },
                    { label: t('vendorDashboard.kpi.rejected'), value: data.rejectedCount, color: '#EF4444' }
                ].map((stat, idx) => (
                    <div key={idx}
                        style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            borderLeft: `5px solid ${stat.color}`,
                            border: '1px solid #E2E8F0',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'default'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
                    >
                        <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <p style={{ fontSize: '2.25rem', fontWeight: 600, color: '#1E293B', lineHeight: 1 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {data.urgentActions.length > 0 && (
                <div style={{
                    marginBottom: '2rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '8px',
                }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #FCA5A5',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        backgroundColor: '#FFF1F2'
                    }}>
                        <AlertTriangle size={20} color="#DC2626" />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991B1B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t('vendorDashboard.actionRequiredCount', { count: data.urgentActions.length })}
                        </h3>
                    </div>
                    <div>
                        {data.urgentActions.map((action, idx) => (
                            <div key={idx} style={{
                                padding: '1rem 1.5rem',
                                borderBottom: idx !== data.urgentActions.length - 1 ? '1px solid #FCA5A5' : 'none',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#7F1D1D', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                        {t('vendorDashboard.invoiceNumber', { id: action.id })}{' '}
                                        <span style={{ fontWeight: 400, color: '#991B1B' }}>{t('vendorDashboard.wasReturned')}</span>
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#B91C1C' }}>
                                        {t('vendorDashboard.reason')}: <strong>{action.reason}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/vendor/invoices/${action.id}`)}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        border: '1px solid #DC2626',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {t('vendorDashboard.fixNow')} <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;

