import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import apiClient from '../../services/apiClient';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import { useTranslation } from 'react-i18next';

const InvoicesQueue = ({ filter }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [role, setRole] = useState('CREATOR');
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const formatDateTime = (value) => {
            if (!value) return '-';
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
        };

        const formatDate = (value) => {
            if (!value) return '-';
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
        };

        const normalizeQueue = (rows) => (Array.isArray(rows)
            ? rows.map((r) => ({
                invoiceId: r.invoiceId,
                vendorName: r.vendorName,
                invoiceNumber: r.vendorInvoiceNumber,
                tenderReference: r.tenderReferenceNumber || r.tenderReference,
                totalAmount: Number(r.totalAmount ?? 0),
                currentStage: r.status || r.currentStatus || '',
                submittedAt: formatDateTime(r.submittedAt),
                verifiedOn: formatDate(r.submittedAt),
            }))
            : []);

        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const me = await apiClient.get('/auth/me');
                const resolvedRole = me?.role || localStorage.getItem('imc_role') || 'CREATOR';
                const roleKey = String(resolvedRole).toLowerCase();

                if (!isMounted) return;
                setRole(resolvedRole);
                localStorage.setItem('imc_role', resolvedRole);

                let rows = [];

                if (filter) {
                    let status = null;
                    if (filter === 'APPROVED') status = 'READY_FOR_PAYMENT';
                    if (filter === 'REJECTED') {
                        if (resolvedRole === 'APPROVER') status = 'APPROVER_REJECTED';
                        else if (resolvedRole === 'VERIFIER') status = 'VERIFIER_REJECTED';
                        else status = 'CREATOR_REJECTED';
                    }
                    if (filter === 'RETURNED') {
                        status = 'APPROVER_REJECTED';
                    }

                    rows = status ? await apiClient.post('/reports/invoices', { status }) : [];
                } else {
                    rows = await apiClient.get(`/${roleKey}/dashboard/invoices`);
                }

                if (!isMounted) return;
                setInvoices(normalizeQueue(rows));
            } catch (error) {
                console.error('Failed to fetch queue', error);
                if (!isMounted) return;
                setInvoices([]);
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        fetchInvoices();
        return () => {
            isMounted = false;
        };
    }, [filter]);

    const getPageTitle = () => {
        if (filter === 'RETURNED') return t('invoicesQueue.titles.returned');
        if (filter === 'APPROVED') return t('invoicesQueue.titles.approved');
        if (filter === 'REJECTED') return t('invoicesQueue.titles.rejected');

        if (role === 'APPROVER') return t('invoicesQueue.titles.approverPending');
        if (role === 'VERIFIER') return t('invoicesQueue.titles.verifierPending');
        return t('invoicesQueue.titles.creatorPending');
    };

    const getPageSubtitle = () => {
        if (filter === 'RETURNED') return t('invoicesQueue.subtitles.returned');
        if (filter === 'APPROVED') return t('invoicesQueue.subtitles.approved');
        if (filter === 'REJECTED') return t('invoicesQueue.subtitles.rejected');

        if (role === 'APPROVER') return t('invoicesQueue.subtitles.approverPending');
        if (role === 'VERIFIER') return t('invoicesQueue.subtitles.verifierPending');
        return t('invoicesQueue.subtitles.creatorPending');
    };

    const getFilterLabel = () => {
        if (filter) return filter;
        if (role === 'APPROVER') return 'APPROVER_PENDING';
        if (role === 'VERIFIER') return 'VERIFIER_PENDING';
        return 'CREATOR_PENDING';
    };

    if (loading) return <div style={{ padding: '2rem' }}>{t('invoicesQueue.loading')}</div>;

    return (
        <div>
            <PageHeader
                title={getPageTitle()}
                subtitle={getPageSubtitle()}
                actions={
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '6px',
                        backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
                        color: 'var(--text-muted, #64748B)', fontSize: '0.85rem', fontWeight: 600
                    }}>
                        <Filter size={14} /> {t('invoicesQueue.statusFilter')} <span style={{ color: 'var(--primary)' }}>{getFilterLabel()}</span>
                    </div>
                }
            />

            {invoices.length > 0 ? (
                <>
                    <div className="desktop-only gov-table-container">
                        <table className="gov-table">
                            <thead>
                                <tr>
                                    <th>{t('invoicesQueue.table.vendorName')}</th>
                                    <th>{t('invoicesQueue.table.invoiceNumber')}</th>
                                    {role !== 'CREATOR' && <th>{t('invoicesQueue.table.tenderRef')}</th>}
                                    <th>{t('invoicesQueue.table.amount')}</th>
                                    <th>{t('invoicesQueue.table.currentStage')}</th>
                                    <th>{t('invoicesQueue.table.submittedDate')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('invoicesQueue.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.invoiceId}>
                                        <td style={{ fontWeight: 600 }}>{inv.vendorName}</td>
                                        <td>{inv.invoiceNumber}</td>
                                        {role !== 'CREATOR' && <td style={{ fontFamily: 'monospace', color: 'var(--text-muted, #64748B)' }}>{inv.tenderReference || 'N/A'}</td>}
                                        <td style={{ fontWeight: 600 }}>{inv.totalAmount.toLocaleString()}</td>
                                        <td>
                                            <StatusBadge status={inv.currentStage} />
                                        </td>
                                        <td>
                                            {inv.submittedAt}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => navigate(`/imc/invoices/${inv.invoiceId}`)}
                                                className="btn-gov btn-primary touch-target"
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', minHeight: '38px' }}
                                            >
                                                <Eye size={14} style={{ marginRight: '0.4rem' }} />
                                                {role === 'VERIFIER' ? t('invoicesQueue.actions.verify') : (role === 'APPROVER' ? t('invoicesQueue.actions.decide') : t('invoicesQueue.actions.process'))}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mobile-only mobile-card-list">
                        {invoices.map((inv) => (
                            <div key={inv.invoiceId} className="mobile-data-card">
                                <div className="mobile-data-card__row">
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)' }}>
                                        {inv.vendorName}
                                    </span>
                                    <StatusBadge status={inv.currentStage} />
                                </div>
                                <div className="mobile-data-card__row" style={{ fontSize: '0.9rem', color: 'var(--text-muted, #64748B)', marginTop: '0.25rem' }}>
                                    <span>Inv #: <strong style={{ color: 'var(--text-color)' }}>{inv.invoiceNumber}</strong></span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>₹{inv.totalAmount.toLocaleString()}</span>
                                </div>
                                {role !== 'CREATOR' && inv.tenderReference && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                                        Tender: {inv.tenderReference}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', marginTop: '0.25rem' }}>
                                    Submitted: {inv.submittedAt}
                                </div>
                                <button
                                    onClick={() => navigate(`/imc/invoices/${inv.invoiceId}`)}
                                    className="btn-gov btn-primary touch-target"
                                    style={{
                                        width: '100%',
                                        minHeight: '44px',
                                        marginTop: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Eye size={16} />
                                    {role === 'VERIFIER' ? t('invoicesQueue.actions.verifyInvoice') : (role === 'APPROVER' ? t('invoicesQueue.actions.decideInvoice') : t('invoicesQueue.actions.processInvoice'))}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="gov-table-container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted, #94A3B8)' }}>
                    <div style={{ backgroundColor: 'var(--gray-100)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Filter size={32} opacity={0.5} />
                    </div>
                    <p style={{ margin: 0 }}>{t('invoicesQueue.empty')}</p>
                </div>
            )}
        </div>
    );
};

export default InvoicesQueue;

