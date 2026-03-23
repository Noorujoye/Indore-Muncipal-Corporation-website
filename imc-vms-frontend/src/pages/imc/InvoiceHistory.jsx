import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, ArrowLeftCircle, Clock } from 'lucide-react';
import apiClient from '../../services/apiClient';
import PageHeader from '../../components/common/PageHeader';

const InvoiceHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('CREATOR');

    useEffect(() => {
        const storedRole = localStorage.getItem('imc_role') || 'CREATOR';
        setRole(storedRole);

        const fetchHistory = async () => {
            try {
                const toDate = new Date();
                const fromDate = new Date();
                fromDate.setDate(toDate.getDate() - 30);

                const pad = (n) => String(n).padStart(2, '0');
                const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

                const rows = await apiClient.post('/reports/invoices', {
                    fromDate: isoDate(fromDate),
                    toDate: isoDate(toDate),
                });

                const normalized = Array.isArray(rows)
                    ? rows.map((r) => {
                        const status = r.status;
                        let action = 'Processed';
                        if (status === 'READY_FOR_PAYMENT') action = 'Approved';
                        else if (String(status).includes('REJECTED')) action = 'Rejected';
                        else if (status === 'VERIFIER_APPROVED' || status === 'CREATOR_APPROVED') action = 'Forwarded';
                        else if (status === 'SUBMITTED') action = 'Submitted';

                        const created = r.createdAt ? new Date(r.createdAt) : null;
                        const date = created && !Number.isNaN(created.getTime())
                            ? created.toLocaleDateString()
                            : '-';

                        return {
                            id: r.invoiceId,
                            action,
                            invoice: r.vendorInvoiceNumber,
                            vendor: r.vendorName,
                            date,
                            status,
                        };
                    })
                    : [];

                setHistory(normalized);
            } catch (error) {
                console.error("Failed to fetch history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getActionIcon = (action) => {
        switch (action) {
            case 'Approved': return <CheckCircle size={16} color="#10B981" />;
            case 'Rejected': return <XCircle size={16} color="#EF4444" />;
            default: return <Clock size={16} color="#3B82F6" />;
        }
    };

    return (
        <div>
            <PageHeader
                title={`${role === 'APPROVER' ? 'Approval' : 'Verification'} History`}
                subtitle="Record of all invoices processed by your account."
            />

            <div className="gov-table-container">
                <table className="gov-table">
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>INVOICE #</th>
                            <th>VENDOR</th>
                            <th>ACTION TAKEN</th>
                            <th>CURRENT STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id}>
                                <td style={{ color: '#64748B' }}>{item.date}</td>
                                <td style={{ fontWeight: 600 }}>{item.invoice}</td>
                                <td>{item.vendor}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                        {getActionIcon(item.action)}
                                        {item.action}
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: '#F1F5F9',
                                        color: '#475569',
                                        border: '1px solid #E2E8F0'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceHistory;
