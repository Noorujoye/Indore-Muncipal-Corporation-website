import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import apiClient from '../../services/apiClient';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const InvoicesQueue = ({ filter }) => {
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
                        
                        status = 'CREATOR_REJECTED';
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
        if (filter === 'RETURNED') return 'Returned Invoices';
        if (filter === 'APPROVED') return 'Approved Invoices';
        if (filter === 'REJECTED') return 'Rejected Invoices';

        if (role === 'APPROVER') return 'Invoices Pending Approval';
        if (role === 'VERIFIER') return 'Invoices for Verification';
        return 'Invoices Queue';
    };

    const getPageSubtitle = () => {
        if (filter === 'RETURNED') return 'Invoices returned for correction or clarification.';
        if (filter === 'APPROVED') return 'Invoices that have been fully approved and processed.';
        if (filter === 'REJECTED') return 'Invoices that were rejected due to discrepancies.';

        if (role === 'APPROVER') return 'Review and grant final financial approval for payment.';
        if (role === 'VERIFIER') return 'Verify calculations and supporting documents.';
        return 'Process new invoice submissions from vendors.';
    };

    const getFilterLabel = () => {
        if (filter) return filter;
        if (role === 'APPROVER') return 'APPROVER_PENDING';
        if (role === 'VERIFIER') return 'VERIFIER_PENDING';
        return 'CREATOR_PENDING';
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Queue...</div>;

    return (
        <div>
            <PageHeader
                title={getPageTitle()}
                subtitle={getPageSubtitle()}
                actions={
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '6px',
                        backgroundColor: 'white', border: '1px solid var(--gov-border)',
                        color: '#64748B', fontSize: '0.85rem', fontWeight: 600
                    }}>
                        <Filter size={14} /> STATUS: <span style={{ color: '#0A3D62' }}>{getFilterLabel()}</span>
                    </div>
                }
            />

            <div className="gov-table-container">
                {invoices.length > 0 ? (
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>VENDOR NAME</th>
                                <th>INVOICE #</th>
                                {role !== 'CREATOR' && <th>TENDER REF</th>}
                                <th>AMOUNT (₹)</th>
                                <th>CURRENT STAGE</th>
                                <th>{role === 'APPROVER' ? 'VERIFIED ON' : 'SUBMITTED DATE'}</th>
                                <th style={{ textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.invoiceId}>
                                    <td style={{ fontWeight: 600 }}>{inv.vendorName}</td>
                                    <td>{inv.invoiceNumber}</td>
                                    {role !== 'CREATOR' && <td style={{ fontFamily: 'monospace', color: '#64748B' }}>{inv.tenderReference || 'N/A'}</td>}
                                    <td style={{ fontWeight: 600 }}>{inv.totalAmount.toLocaleString()}</td>
                                    <td>
                                        <StatusBadge status={inv.currentStage} />
                                    </td>
                                    <td>
                                        {role === 'APPROVER' ? inv.verifiedOn : inv.submittedAt}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/imc/invoices/${inv.invoiceId}`)}
                                            className="btn-gov btn-primary"
                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                                        >
                                            <Eye size={14} style={{ marginRight: '0.4rem' }} />
                                            {role === 'VERIFIER' ? 'Verify' : (role === 'APPROVER' ? 'Decide' : 'Process')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
                        <div style={{ backgroundColor: '#F1F5F9', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Filter size={32} opacity={0.5} />
                        </div>
                        <p>No invoices found in your queue.</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default InvoicesQueue;

