import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, FileText, Download, AlertTriangle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const InvoiceDetail = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await apiClient.get(`/vendor/invoices/${id}`);
                setInvoice(data);

                try {
                    const docs = await apiClient.get(`/documents/INVOICE/${id}`);
                    setDocuments(Array.isArray(docs) ? docs : []);
                } catch {
                    setDocuments([]);
                }
            } catch (err) {
                console.error(err);
                setError(t('invoiceDetail.notFound'));
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>{t('invoiceDetail.loading')}</div>;
    if (error) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#EF4444' }}>
            <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
            <h3>{error}</h3>
            <button onClick={() => navigate('/vendor/invoices')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>{t('common.goBack')}</button>
        </div>
    );

    const timeline = Array.isArray(invoice.timeline)
        ? invoice.timeline.map((t) => ({
            step: String(t.stage || '').replaceAll('_', ' '),
            date: t.actionTime ? new Date(t.actionTime).toLocaleDateString(locale) : '-',
            status: String(t.status || '').toUpperCase(),
            remark: t.remarks || null,
        }))
        : [];

    const getStepIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={20} color="white" />;
            case 'REJECTED': return <XCircle size={20} color="white" />;
            case 'CURRENT': return <Clock size={20} color="white" />;
            default: return <Clock size={20} color="#94A3B8" />;
        }
    };

    const getStepColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#10B981';
            case 'REJECTED': return '#EF4444';
            case 'CURRENT': return '#F59E0B';
            default: return '#E2E8F0';
        }
    };

    const handleDownloadFirstDocument = async () => {
        if (!documents?.length) return;
        const doc = documents[0];
        try {
            const res = await apiClient.get(`/documents/download/${doc.id}`, { responseType: 'blob' });
            const contentType = doc.fileType || 'application/pdf';
            const blob = res instanceof Blob ? res : new Blob([res], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || `invoice_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (e) {
            console.error('Download failed', e);
            alert(t('invoiceDetail.downloadFailed'));
        }
    };

    const handleViewFirstDocument = async () => {
        if (!documents?.length) {
            alert('No document attached to this invoice.');
            return;
        }
        const doc = documents[0];
        try {
            const res = await apiClient.get(`/documents/download/${doc.id}`, { responseType: 'blob' });
            const contentType = doc.fileType || 'application/pdf';
            const blob = res instanceof Blob ? res : new Blob([res], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } catch (e) {
            console.error('View document failed', e);
            alert(t('invoiceDetail.downloadFailed'));
        }
    };

    return (
        <div>
            <button
                onClick={() => navigate('/vendor/invoices')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748B', fontWeight: 500, marginBottom: '1.5rem'
                }}
            >
                <ArrowLeft size={18} /> {t('invoiceDetail.backToInvoices')}
            </button>

            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: 'clamp(1.25rem, 4vw, 2rem)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                            {invoice.vendorInvoiceNumber}
                        </h1>
                        <p style={{ color: 'var(--gray-600)', fontSize: '1rem' }}>
                            {t('invoiceDetail.tenderRef')}: <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{invoice.tenderReferenceNumber}</span>
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700, color: 'var(--primary)' }}>
                            ₹ {Number(invoice.totalAmount ?? 0).toLocaleString()}
                        </p>
                        <span style={{
                            display: 'inline-block',
                            backgroundColor: String(invoice.status || '').includes('REJECTED') ? 'color-mix(in srgb, #EF4444 15%, transparent)' : 'color-mix(in srgb, #10B981 15%, transparent)',
                            color: String(invoice.status || '').includes('REJECTED') ? 'var(--gov-danger, #EF4444)' : 'var(--gov-success, #10B981)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '100px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginTop: '0.5rem'
                        }}>
                            {String(invoice.status || '').replaceAll('_', ' ')}
                        </span>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '1rem',
                    padding: '1.25rem',
                    backgroundColor: 'var(--gray-100)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase' }}>Base Amount</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-color)' }}>₹ {Number(invoice.baseAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase' }}>CGST (9%)</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-color)' }}>₹ {Number(invoice.cgst ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase' }}>SGST (9%)</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-color)' }}>₹ {Number(invoice.sgst ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase' }}>Total Amount</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>₹ {Number(invoice.totalAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600, textTransform: 'uppercase' }}>Submitted Date</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-color)' }}>
                            {invoice.submittedAt && !Number.isNaN(new Date(invoice.submittedAt).getTime())
                                ? new Date(invoice.submittedAt).toLocaleDateString(locale)
                                : '-'}
                        </span>
                    </div>
                </div>

                {/* Desktop Horizontal Timeline */}
                <div className="desktop-only" style={{ position: 'relative', marginTop: '3rem', padding: '0 1rem', overflowX: 'auto', width: '100%' }}>
                    <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        backgroundColor: 'var(--border-color)',
                        zIndex: 0
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '600px', width: '100%', position: 'relative', zIndex: 1 }}>
                        {timeline.map((step, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: getStepColor(step.status),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 0 4px var(--card-bg)',
                                    marginBottom: '1rem'
                                }}>
                                    {getStepIcon(step.status)}
                                </div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                                    {step.step}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{step.date}</p>

                                {step.status === 'REJECTED' && step.remark && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        backgroundColor: 'color-mix(in srgb, #EF4444 12%, transparent)',
                                        color: 'var(--gov-danger, #EF4444)',
                                        fontSize: '0.75rem',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)',
                                        maxWidth: '120px'
                                    }}>
                                        {step.remark}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Vertical Timeline */}
                <div className="mobile-only" style={{ marginTop: '2rem' }}>
                    <div className="vertical-timeline" style={{ width: '100%' }}>
                        {timeline.map((step, index) => (
                            <div key={index} className="vertical-timeline__item">
                                {index < timeline.length - 1 && <div className="vertical-timeline__connector" />}
                                <div className="vertical-timeline__icon" style={{ backgroundColor: getStepColor(step.status), boxShadow: '0 0 0 3px var(--card-bg)' }}>
                                    {getStepIcon(step.status)}
                                </div>
                                <div className="vertical-timeline__content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>
                                            {step.step}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{step.date}</span>
                                    </div>
                                    {step.status === 'REJECTED' && step.remark && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            backgroundColor: 'color-mix(in srgb, #EF4444 12%, transparent)',
                                            color: 'var(--gov-danger, #EF4444)',
                                            fontSize: '0.8rem',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid color-mix(in srgb, #EF4444 30%, transparent)'
                                        }}>
                                            {step.remark}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                flexWrap: 'wrap',
                border: '1px solid var(--border-color)'
            }}>
                <button
                    onClick={handleViewFirstDocument}
                    disabled={!documents?.length}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        border: '1px solid var(--border-color)', borderRadius: '8px',
                        backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: 600,
                        cursor: documents?.length ? 'pointer' : 'not-allowed',
                        opacity: documents?.length ? 1 : 0.6,
                        flex: '1 1 180px',
                        minHeight: '44px'
                    }}
                >
                    <FileText size={18} /> {t('invoiceDetail.viewInvoice')}
                </button>
                <button onClick={handleDownloadFirstDocument} disabled={!documents?.length} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    border: 'none', borderRadius: '8px',
                    backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600,
                    cursor: documents?.length ? 'pointer' : 'not-allowed',
                    opacity: documents?.length ? 1 : 0.6,
                    flex: '1 1 180px',
                    minHeight: '44px'
                }}>
                    <Download size={18} /> {t('invoiceDetail.downloadDetails')}
                </button>
            </div>
        </div>
    );
};

export default InvoiceDetail;

