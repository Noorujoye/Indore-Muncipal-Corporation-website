import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, ArrowLeftCircle, Clock } from 'lucide-react';
import apiClient from '../../services/apiClient';
import PageHeader from '../../components/common/PageHeader';
import { useTranslation } from 'react-i18next';

const InvoiceHistory = () => {
    const { t } = useTranslation();
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

    const getTitle = () => {
        if (role === 'APPROVER') return t('invoiceHistory.titleApproval');
        if (role === 'VERIFIER') return t('invoiceHistory.titleVerification');
        return t('invoiceHistory.titleAction');
    };

    return (
        <div>
            <PageHeader
                title={getTitle()}
                subtitle={t('invoiceHistory.subtitle')}
            />

            <div className="gov-table-container">
                {history.length > 0 ? (
                    <>
                        <div className="desktop-only">
                            <table className="gov-table">
                                <thead>
                                    <tr>
                                        <th>{t('invoiceHistory.table.date')}</th>
                                        <th>{t('invoiceHistory.table.invoiceNumber')}</th>
                                        <th>{t('invoiceHistory.table.vendor')}</th>
                                        <th>{t('invoiceHistory.table.actionTaken')}</th>
                                        <th>{t('invoiceHistory.table.currentStatus')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ color: 'var(--text-muted, #64748B)' }}>{item.date}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-color)' }}>{item.invoice}</td>
                                            <td style={{ color: 'var(--text-color)' }}>{item.vendor}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-color)' }}>
                                                    {getActionIcon(item.action)}
                                                    {item.action}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'var(--gray-100)',
                                                    color: 'var(--text-color)',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only mobile-card-list" style={{ padding: '0.75rem' }}>
                            {history.map((item) => (
                                <div key={item.id} className="mobile-data-card">
                                    <div className="mobile-data-card__row">
                                        <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{item.invoice}</span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--gray-100)',
                                            color: 'var(--text-color)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-color)', margin: '0.35rem 0' }}>
                                        {item.vendor}
                                    </div>
                                    <div className="mobile-data-card__row" style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748B)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {getActionIcon(item.action)}
                                            <span>{item.action}</span>
                                        </div>
                                        <span>{item.date}</span>
                                    </div>
                                    {item.remarks && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                            "{item.remarks}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted, #94A3B8)' }}>
                        {t('invoiceHistory.empty')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceHistory;

