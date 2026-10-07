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
                const rows = await apiClient.get('/reports/history');

                const normalized = Array.isArray(rows)
                    ? rows.map((r) => {
                        const d = r.actionTimestamp ? new Date(r.actionTimestamp) : null;
                        const date = d && !Number.isNaN(d.getTime())
                            ? d.toLocaleDateString()
                            : '-';

                        return {
                            id: r.logId || `${r.invoiceId}-${r.actionTimestamp}`,
                            action: r.action || 'Processed',
                            invoice: r.invoiceNumber || '-',
                            vendor: r.vendorName || '-',
                            date,
                            status: r.currentStatus || '-',
                            remarks: r.remarks,
                        };
                    })
                    : [];

                setHistory(normalized);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getActionIcon = (action) => {
        if (!action) return <Clock size={16} color="#3B82F6" />;
        if (action.includes('Approved') || action.includes('Paid')) return <CheckCircle size={16} color="#10B981" />;
        if (action.includes('Reject')) return <XCircle size={16} color="#EF4444" />;
        return <Clock size={16} color="#3B82F6" />;
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
                        {history.length > 0 ? (
                            history.map((item) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                                    No invoice processing history recorded for your account yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceHistory;
