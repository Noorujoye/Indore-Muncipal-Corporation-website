import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileBarChart, RefreshCw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import StatusBadge from '../../components/common/StatusBadge';
import PageHeader from '../../components/common/PageHeader';

const Reports = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
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
            alert('Failed to export CSV. Please try again.');
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Reports & Analytics
                    </h1>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                        Live invoice financial records, processing analytics, and official exports.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.25rem 0.5rem', gap: '0.5rem' }}>
                        <Calendar size={16} color="#64748B" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#334155', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="ALL">All Time</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.25rem 0.5rem', gap: '0.5rem' }}>
                        <Filter size={16} color="#64748B" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#334155', fontWeight: 500, cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="CREATOR_APPROVED">Creator Approved</option>
                            <option value="VERIFIER_APPROVED">Verifier Approved</option>
                            <option value="READY_FOR_PAYMENT">Ready for Payment</option>
                            <option value="PAID">Paid</option>
                            <option value="CREATOR_REJECTED">Creator Rejected</option>
                            <option value="VERIFIER_REJECTED">Verifier Rejected</option>
                            <option value="APPROVER_REJECTED">Approver Rejected</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExportCsv}
                        disabled={exporting || loading || invoices.length === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', backgroundColor: '#0A3D62',
                            border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600,
                            cursor: (exporting || loading || invoices.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (exporting || loading || invoices.length === 0) ? 0.6 : 1,
                        }}
                    >
                        <Download size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="gov-card" style={{ borderLeft: '4px solid #0A3D62' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Invoices
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0.35rem 0' }}>
                        {totalCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {dateRange === 'ALL' ? 'All records in system' : `In last ${dateRange} days`}
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #2563EB' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Value (₹)
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0.35rem 0' }}>
                        ₹ {totalAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563EB' }}>
                        Cumulative gross amount
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Settled & Paid
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0.35rem 0' }}>
                        ₹ {paidAmount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981' }}>
                        {paidInvoices.length} paid invoices
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        In Progress
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0.35rem 0' }}>
                        {pendingInvoices.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#F59E0B' }}>
                        Awaiting review / payment
                    </div>
                </div>

                <div className="gov-card" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                        Rejection Rate
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0.35rem 0' }}>
                        {rejectionRate}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#EF4444' }}>
                        {rejectedInvoices.length} rejected invoices
                    </div>
                </div>
            </div>

            {/* Invoices Report Table */}
            <div className="gov-table-container">
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: 600 }}>
                        Invoice Records ({invoices.length})
                    </h3>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        Loading report data...
                    </div>
                ) : invoices.length > 0 ? (
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>INVOICE #</th>
                                <th>VENDOR NAME</th>
                                <th>TENDER REF</th>
                                <th>TOTAL AMOUNT (₹)</th>
                                <th>STATUS</th>
                                <th>SUBMITTED DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.invoiceId}>
                                    <td style={{ fontWeight: 600, color: '#0F172A' }}>
                                        {inv.vendorInvoiceNumber}
                                    </td>
                                    <td>{inv.vendorName}</td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748B' }}>
                                        {inv.tenderReference || '-'}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        ₹ {Number(inv.totalAmount || 0).toLocaleString()}
                                    </td>
                                    <td>
                                        <StatusBadge status={inv.status} />
                                    </td>
                                    <td style={{ color: '#64748B' }}>
                                        {inv.submittedAt && !Number.isNaN(new Date(inv.submittedAt).getTime())
                                            ? new Date(inv.submittedAt).toLocaleDateString()
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                        No invoice records found for the selected period and status.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
