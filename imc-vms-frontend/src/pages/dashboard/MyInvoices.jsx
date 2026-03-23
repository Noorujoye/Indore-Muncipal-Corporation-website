import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search, Filter, Calendar } from 'lucide-react';
import apiClient from '../../services/apiClient';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { useTranslation } from 'react-i18next';

const MyInvoices = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
                const data = await apiClient.get('/vendor/invoices');
                const normalized = Array.isArray(data)
                    ? data.map((inv) => ({
                        invoiceId: inv.invoiceId,
                        id: String(inv.invoiceId),
                        invoiceNumber: inv.vendorInvoiceNumber,
                        tenderRef: inv.tenderReferenceNumber,
                        amount: Number(inv.totalAmount ?? 0),
                        status: String(inv.status || ''),
                        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString(locale) : '-',
                    }))
                    : [];
                setInvoices(normalized);
            } catch (error) {
                console.error("Failed to load invoices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch =
                String(inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(inv.tenderRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(inv.id || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter.toUpperCase();
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter, invoices]);

    if (loading) return <div style={{ padding: '2rem' }}>{t('myInvoices.loading')}</div>;

    return (
        <div>
            <PageHeader
                title={t('myInvoices.title')}
                subtitle={t('myInvoices.subtitle')}
                actions={
                    <button
                        onClick={() => navigate('/vendor/invoices/create')}
                        className="btn-gov btn-primary"
                    >
                        <Plus size={18} /> {t('myInvoices.createNew')}
                    </button>
                }
            />

            <div style={{
                backgroundColor: 'white', padding: '1rem', borderRadius: '8px',
                border: '1px solid var(--gov-border)', marginBottom: '1.5rem',
                display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={t('myInvoices.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="gov-input"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>

                <div style={{ position: 'relative', minWidth: '180px' }}>
                    <Filter size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="gov-input"
                        style={{ paddingLeft: '2.25rem', appearance: 'auto' }}
                    >
                        <option value="All">{t('myInvoices.filter.allStatuses')}</option>
                        <option value="APPROVED">{t('status.APPROVED')}</option>
                        <option value="PENDING">{t('status.PENDING')}</option>
                        <option value="REJECTED">{t('status.REJECTED')}</option>
                        <option value="PAID">{t('status.PAID')}</option>
                        <option value="DRAFT">{t('status.DRAFT')}</option>
                    </select>
                </div>
            </div>

            <div className="gov-table-container">
                {filteredInvoices.length > 0 ? (
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>{t('myInvoices.table.invoiceNumber')}</th>
                                <th>{t('myInvoices.table.tenderRef')}</th>
                                <th>{t('myInvoices.table.amount')}</th>
                                <th>{t('myInvoices.table.status')}</th>
                                <th>{t('myInvoices.table.date')}</th>
                                <th style={{ textAlign: 'right' }}>{t('myInvoices.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.invoiceId}>
                                    <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748B' }}>{inv.tenderRef}</td>
                                    <td style={{ fontWeight: 600 }}>{inv.amount.toLocaleString()}</td>
                                    <td>
                                        <StatusBadge status={inv.status} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Calendar size={14} color="#94A3B8" /> {inv.date}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/vendor/invoices/${inv.invoiceId}`)}
                                            className="btn-gov btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        >
                                            <Eye size={14} /> {t('myInvoices.view')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
                        <div style={{ backgroundColor: '#F1F5F9', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Search size={32} opacity={0.5} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>{t('myInvoices.empty.title')}</h3>
                        <p style={{ fontSize: '0.9rem' }}>{t('myInvoices.empty.subtitle')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInvoices;

