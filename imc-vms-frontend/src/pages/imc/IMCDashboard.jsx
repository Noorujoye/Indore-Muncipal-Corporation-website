import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Send, ShieldCheck, CornerUpLeft, Award, TrendingUp } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const IMCDashboard = () => {
    const { t } = useTranslation();
    const [role, setRole] = useState('CREATOR');
    const [stats, setStats] = useState({});
    const [pendingVendors, setPendingVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const resolveRole = async () => {
            try {
                const me = await apiClient.get('/auth/me');
                const resolved = me?.role;
                if (!cancelled && resolved && ['CREATOR', 'VERIFIER', 'APPROVER'].includes(resolved)) {
                    setRole(resolved);
                    localStorage.setItem('imc_role', resolved);
                }
                return resolved;
            } catch {
                const storedRole = localStorage.getItem('imc_role') || 'CREATOR';
                if (!cancelled) setRole(storedRole);
                return storedRole;
            }
        };

        const fetchStats = async () => {
            try {
                const resolvedRole = await resolveRole();
                const roleKey = String(resolvedRole || 'CREATOR').toLowerCase();
                const counts = await apiClient.get(`/${roleKey}/dashboard/counts`);

                if (resolvedRole === 'CREATOR') {
                    
                    try {
                        const res = await apiClient.get('/creator/vendors/pending');
                        setPendingVendors(res);
                    } catch (e) {
                        console.error('Failed to load pending vendors', e);
                    }
                }

                const pendingInvoices = Number(counts?.pendingInvoices ?? 0);
                const pendingVendorsCount = Number(counts?.pendingVendors ?? 0);
                const readyForPayment = Number(counts?.readyForPayment ?? 0);

                const forwardedToday = Number(counts?.forwardedToday ?? 0);
                const verifiedToday = Number(counts?.verifiedToday ?? 0);
                const approvedToday = Number(counts?.approvedToday ?? 0);
                const rejectedToday = Number(counts?.rejectedToday ?? 0);
                const returnedForCorrection = Number(counts?.returnedForCorrection ?? 0);
                const forwardedToApprover = Number(counts?.forwardedToApprover ?? 0);

                setStats({
                    pendingVendors: pendingVendorsCount,
                    pendingInvoices,
                    readyForPayment,

                    
                    pendingScrutinyCount: pendingInvoices,
                    forwardedToday,
                    rejectedByMe: rejectedToday,

                    
                    pendingVerificationCount: pendingInvoices,
                    verifiedToday,
                    returnedForCorrection,
                    forwardedToApprover,

                    
                    pendingApprovalCount: pendingInvoices,
                    approvedToday,
                    rejectedToday,
                    readyForPaymentTotal: readyForPayment,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleApproveVendor = async (vendorId) => {
        if (!window.confirm(t('imcDashboard.confirmApprove'))) return;
        try {
            const response = await apiClient.post(`/creator/vendors/${vendorId}/approve`);
            alert(response.message || t('imcDashboard.approvalSuccess'));
            setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
        } catch (error) {
            console.error("Approval failed", error);
            alert(`${t('imcDashboard.approvalFailed')}: ` + (error.response?.data?.message || "Unknown error"));
        }
    };

    const getDashboardContent = () => {
        if (role === 'APPROVER') {
            return {
                title: t('imcDashboard.approverTitle'),
                subtitle: t('imcDashboard.approverSubtitle'),
                cards: [
                    { label: t('imcDashboard.cards.pendingApproval'), value: stats.pendingApprovalCount, icon: Clock, color: '#EAB308' },
                    { label: t('imcDashboard.cards.approvedToday'), value: stats.approvedToday, icon: CheckCircle, color: '#10B981' },
                    { label: t('imcDashboard.cards.rejectedToday'), value: stats.rejectedToday, icon: AlertTriangle, color: '#EF4444' },
                    { label: t('imcDashboard.cards.readyForPayment'), value: stats.readyForPaymentTotal, icon: Award, color: '#003366' }
                ]
            };
        }

        if (role === 'VERIFIER') {
            return {
                title: t('imcDashboard.verifierTitle'),
                subtitle: t('imcDashboard.verifierSubtitle'),
                cards: [
                    { label: t('imcDashboard.cards.pendingVerification'), value: stats.pendingVerificationCount, icon: Clock, color: '#EAB308' },
                    { label: t('imcDashboard.cards.verifiedToday'), value: stats.verifiedToday, icon: ShieldCheck, color: '#3B82F6' },
                    { label: t('imcDashboard.cards.returnedForCorrection'), value: stats.returnedForCorrection, icon: CornerUpLeft, color: '#EF4444' },
                    { label: t('imcDashboard.cards.forwardedToApprover'), value: stats.forwardedToApprover, icon: Send, color: '#10B981' }
                ]
            };
        }

        return {
            title: t('imcDashboard.creatorTitle'),
            subtitle: t('imcDashboard.creatorSubtitle'),
            cards: [
                { label: t('imcDashboard.cards.pendingScrutiny'), value: stats.pendingScrutinyCount, icon: Clock, color: '#EAB308' },
                { label: t('imcDashboard.cards.forwardedToday'), value: stats.forwardedToday, icon: Send, color: '#3B82F6' },
                { label: t('imcDashboard.cards.rejectedByMe'), value: stats.rejectedByMe, icon: AlertTriangle, color: '#EF4444' }
            ]
        };
    };

    if (loading) return <div style={{ padding: '2rem' }}>{t('imcDashboard.loading')}</div>;

    const content = getDashboardContent();

    return (
        <div>
            <div className="gov-header">
                <h1>{content.title}</h1>
                <p>{content.subtitle}</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {content.cards.map((stat, index) => (
                    <div key={index} className="gov-card" style={{
                        borderLeft: `4px solid ${stat.color}`,
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ color: 'var(--text-muted, #64748B)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', lineHeight: 1, margin: 0 }}>
                                {stat.value ?? 0}
                            </p>
                        </div>
                        <div style={{
                            color: stat.color,
                            opacity: 0.8
                        }}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {role === 'CREATOR' && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '1rem' }}>
                        {t('imcDashboard.pendingRegistrations')}
                    </h3>
                    {pendingVendors.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted, #64748B)' }}>
                            {t('imcDashboard.noPendingRegistrations')}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            {pendingVendors.map((vendor, idx) => (
                                <div key={vendor.id} style={{
                                    padding: '1.25rem',
                                    borderBottom: idx !== pendingVendors.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>{vendor.firmName}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', flexWrap: 'wrap' }}>
                                            <span>{vendor.firmType}</span>
                                            <span>•</span>
                                            <span>{vendor.user?.email || 'No Email'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApproveVendor(vendor.id)}
                                            className="touch-target"
                                            style={{
                                                padding: '0.6rem 1.25rem',
                                                minHeight: '44px',
                                                backgroundColor: '#16A34A',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem'
                                            }}
                                        >
                                            <CheckCircle size={16} /> {t('imcDashboard.approve')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: '1.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-color)' }}>
                    {t('imcDashboard.guidelinesTitle')}
                </h3>
                {role === 'APPROVER' ? (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>{t('imcDashboard.approverGuidelines.0')}</li>
                        <li>{t('imcDashboard.approverGuidelines.1')}</li>
                        <li>{t('imcDashboard.approverGuidelines.2')}</li>
                    </ul>
                ) : role === 'VERIFIER' ? (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>{t('imcDashboard.verifierGuidelines.0')}</li>
                        <li>{t('imcDashboard.verifierGuidelines.1')}</li>
                        <li>{t('imcDashboard.verifierGuidelines.2')}</li>
                    </ul>
                ) : (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>{t('imcDashboard.creatorGuidelines.0')}</li>
                        <li>{t('imcDashboard.creatorGuidelines.1')}</li>
                        <li>{t('imcDashboard.creatorGuidelines.2')}</li>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default IMCDashboard;

