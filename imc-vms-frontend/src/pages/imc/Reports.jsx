import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calendar, Filter, FileBarChart, RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';
import MessageBanner from '../../components/common/MessageBanner';

const Reports = () => {
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [dateRange, setDateRange] = useState('30'); // '30', '90', 'ALL'
    const [statusFilter, setStatusFilter] = useState('ALL');

    const getDateFilterPayload = (range) => {
        if (range === 'ALL') {
            return {};
        }
        const toDate = new Date();
        const fromDate = new Date();
        const days = parseInt(range, 10) || 30;
        fromDate.setDate(toDate.getDate() - days);

        const pad = (n) => String(n).padStart(2, '0');
        const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        return {
            fromDate: iso(fromDate),
            toDate: iso(toDate),
        };
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const datePayload = getDateFilterPayload(dateRange);
            const payload = { ...datePayload };
            if (statusFilter !== 'ALL') {
                payload.status = statusFilter;
            }

            const data = await apiClient.post('/reports/invoices', payload);
            setInvoices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load invoice report', err);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, statusFilter]);

    const handleExportCsv = async () => {
        if (exporting) return;
        setExporting(true);
        setExportError('');
        try {
            const datePayload = getDateFilterPayload(dateRange);
            const payload = { ...datePayload };
            if (statusFilter !== 'ALL') {
                payload.status = statusFilter;
            }

            const res = await apiClient.post('/reports/invoices/export', payload, {
                responseType: 'blob',
            });

            const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoices_report_${dateRange === 'ALL' ? 'all' : dateRange + 'days'}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error('CSV export failed', err);
            setExportError(t('reports.exportFailed'));
        } finally {
            setExporting(false);
        }
    };

    // Calculate real KPIs from current report data
    const totalCount = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const rejectedInvoices = invoices.filter(inv => String(inv.status || '').includes('REJECTED'));
    const rejectionRate = totalCount > 0 ? ((rejectedInvoices.length / totalCount) * 100).toFixed(1) : 0;
    const pendingInvoices = invoices.filter(inv => inv.status !== 'PAID' && !String(inv.status || '').includes('REJECTED'));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: 0 }}>
                        {t('reports.title')}
                    </h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748B)', fontSize: '0.9rem' }}>
                        {t('reports.subtitle')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', padding: '0.35rem 0.65rem', gap: '0.5rem', minHeight: '44px', boxSizing: 'border-box' }}>
                        <Calendar size={16} color="var(--text-muted, #64748B)" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-color, #334155)', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="30">{t('reports.last30Days')}</option>
                            <option value="90">{t('reports.last90Days')}</option>
                            <option value="ALL">{t('reports.allTime')}</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #E2E8F0)', borderRadius: '8px', padding: '0.35rem 0.65rem', gap: '0.5rem', minHeight: '44px', boxSizing: 'border-box' }}>
                        <Filter size={16} color="var(--text-muted, #64748B)" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-color, #334155)', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="ALL">{t('reports.allStatuses')}</option>
                            <option value="SUBMITTED">{t('common.status.submitted', { defaultValue: 'Submitted' })}</option>
                            <option value="CREATOR_APPROVED">{t('common.status.creatorApproved', { defaultValue: 'Creator Approved' })}</option>
                            <option value="VERIFIER_APPROVED">{t('common.status.verifierApproved', { defaultValue: 'Verifier Approved' })}</option>
                            <option value="READY_FOR_PAYMENT">{t('common.status.readyForPayment', { defaultValue: 'Ready for Payment' })}</option>
                            <option value="PAID">{t('common.status.paid', { defaultValue: 'Paid' })}</option>
                            <option value="CREATOR_REJECTED">{t('common.status.creatorRejected', { defaultValue: 'Creator Rejected' })}</option>
                            <option value="VERIFIER_REJECTED">{t('common.status.verifierRejected', { defaultValue: 'Verifier Rejected' })}</option>
                            <option value="APPROVER_REJECTED">{t('common.status.approverRejected', { defaultValue: 'Approver Rejected' })}</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportCsv}
                        disabled={exporting || loading || invoices.length === 0}
                        className="touch-target"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            minHeight: '44px',
                            padding: '0.5rem 1.25rem', backgroundColor: '#0A3D62',
                            border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600,
                            cursor: (exporting || loading || invoices.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (exporting || loading || invoices.length === 0) ? 0.6 : 1,
                        }}
                    >
                        <Download size={16} /> {exporting ? t('reports.exporting') : t('reports.exportCsv')}
                    </button>
                </div>
            </div>

            {exportError && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <MessageBanner
                        variant="error"
                        message={exportError}
                        onClose={() => setExportError('')}
                    />
                </div>
            )}

            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="gov-card" style={{ borderLeft: '4px solid #0A3D62' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('reports.totalInvoices')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                        {totalCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>
                        {dateRange === 'ALL' ? t('reports.allRecords') : t('reports.inLastDays', { days: dateRange })}
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #2563EB' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('reports.totalValue')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                        ₹ {totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563EB' }}>
                        {t('reports.cumulativeAmount')}
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('reports.settledAndPaid')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                        ₹ {paidAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981' }}>
                        {t('reports.paidCount', { count: paidInvoices.length })}
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('reports.inProgress')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                        {pendingInvoices.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#F59E0B' }}>
                        {t('reports.awaitingReview')}
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('reports.rejectionRate')}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                        {rejectionRate}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#EF4444' }}>
                        {t('reports.rejectedCount', { count: rejectedInvoices.length })}
                    </div>
                </div>
            </div>

            {/* Invoices Report Table / Cards */}
            <div className="gov-table-container">
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-color, #334155)', fontWeight: 600 }}>
                        {t('reports.invoiceRecords', { count: invoices.length })}
                    </h3>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="touch-target"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted, #64748B)', cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t('reports.refresh')}
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748B)' }}>
                        {t('reports.loading')}
                    </div>
                ) : invoices.length > 0 ? (
                    <>
                        <div className="desktop-only">
                            <table className="gov-table">
                                <thead>
                                    <tr>
                                        <th>{t('reports.table.invoiceNumber')}</th>
                                        <th>{t('reports.table.vendorName')}</th>
                                        <th>{t('reports.table.tenderRef')}</th>
                                        <th>{t('reports.table.totalAmount')}</th>
                                        <th>{t('reports.table.status')}</th>
                                        <th>{t('reports.table.submittedDate')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.invoiceId}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-color, #0F172A)' }}>
                                                {inv.vendorInvoiceNumber}
                                            </td>
                                            <td>{inv.vendorName}</td>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--text-muted, #64748B)' }}>
                                                {inv.tenderReference || '-'}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ₹ {Number(inv.totalAmount || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <StatusBadge status={inv.status} />
                                            </td>
                                            <td style={{ color: 'var(--text-muted, #64748B)' }}>
                                                {inv.submittedAt && !Number.isNaN(new Date(inv.submittedAt).getTime())
                                                    ? new Date(inv.submittedAt).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only mobile-card-list" style={{ padding: '0.75rem' }}>
                            {invoices.map((inv) => (
                                <div key={inv.invoiceId} className="mobile-data-card">
                                    <div className="mobile-data-card__row">
                                        <span style={{ fontWeight: 700, color: 'var(--text-color, #0F172A)' }}>
                                            {inv.vendorInvoiceNumber}
                                        </span>
                                        <StatusBadge status={inv.status} />
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-color, #0F172A)', margin: '0.35rem 0' }}>
                                        {inv.vendorName}
                                    </div>
                                    <div className="mobile-data-card__row" style={{ fontSize: '0.9rem', color: 'var(--text-muted, #64748B)' }}>
                                        <span>Amount: <strong style={{ color: 'var(--text-color, #0F172A)' }}>₹{Number(inv.totalAmount || 0).toLocaleString()}</strong></span>
                                        <span>
                                            {inv.submittedAt && !Number.isNaN(new Date(inv.submittedAt).getTime())
                                                ? new Date(inv.submittedAt).toLocaleDateString()
                                                : '-'}
                                        </span>
                                    </div>
                                    {inv.tenderReference && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                                            Tender: {inv.tenderReference}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94A3B8)' }}>
                        {t('reports.empty')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
