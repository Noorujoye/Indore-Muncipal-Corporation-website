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
            const blob = await apiClient.get(`/documents/download/${doc.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || `invoice_${id}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Download failed', e);
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
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                            {invoice.vendorInvoiceNumber}
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '1rem' }}>
                            {t('invoiceDetail.tenderRef')}: <span style={{ fontWeight: 600, color: '#334155' }}>{invoice.tenderReferenceNumber}</span>
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
                            ₹ {Number(invoice.totalAmount ?? 0).toLocaleString()}
                        </p>
                        <span style={{
                            display: 'inline-block',
                            backgroundColor: String(invoice.status || '').includes('REJECTED') ? '#FEF2F2' : '#ECFDF5',
                            color: String(invoice.status || '').includes('REJECTED') ? '#EF4444' : '#10B981',
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

                <div style={{ position: 'relative', marginTop: '3rem', padding: '0 1rem', overflowX: 'auto' }}>
                    <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        backgroundColor: '#E2E8F0',
                        zIndex: 0
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '600px', position: 'relative', zIndex: 1 }}>
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
                                    boxShadow: '0 0 0 4px white',
                                    marginBottom: '1rem'
                                }}>
                                    {getStepIcon(step.status)}
                                </div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
                                    {step.step}
                                </p>
                                {

}
                                <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{step.date}</p>

                                {step.status === 'REJECTED' && step.remark && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        backgroundColor: '#FEF2F2',
                                        color: '#EF4444',
                                        fontSize: '0.75rem',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid #FECACA',
                                        maxWidth: '120px'
                                    }}>
                                        {step.remark}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
            }}>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #E2E8F0', borderRadius: '8px',
                    backgroundColor: 'white', color: '#0F172A', fontWeight: 600,
                    cursor: 'pointer'
                }}>
                    <FileText size={18} /> {t('invoiceDetail.viewInvoice')}
                </button>
                <button onClick={handleDownloadFirstDocument} disabled={!documents?.length} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    border: 'none', borderRadius: '8px',
                    backgroundColor: '#0A3D62', color: 'white', fontWeight: 600,
                    cursor: documents?.length ? 'pointer' : 'not-allowed',
                    opacity: documents?.length ? 1 : 0.6
                }}>
                    <Download size={18} /> {t('invoiceDetail.downloadDetails')}
                </button>
            </div>
        </div>
    );
};

export default InvoiceDetail;

