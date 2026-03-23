import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calculator, Check, FileText, X } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';

const CreateInvoice = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        tenderRef: '',
        date: new Date().toISOString().split('T')[0],
        baseAmount: '',
        description: '',
        file: null
    });

    const calculateTotal = () => {
        const base = parseFloat(formData.baseAmount) || 0;
        const gst = base * 0.18;
        return base + gst;
    };

    const formatNumber = (value) => {
        const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
        return Number(value || 0).toLocaleString(locale);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const clearFile = () => {
        setFormData({ ...formData, file: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                vendorInvoiceNumber: formData.invoiceNumber,
                tenderReferenceNumber: formData.tenderRef,
                baseAmount: Number(formData.baseAmount),
                invoiceDate: formData.date,
                workDescription: formData.description || null,
            };

            const res = await apiClient.post('/vendor/invoices', payload);
            const invoiceId = res?.invoiceId;

            if (invoiceId && formData.file) {
                const fd = new FormData();
                fd.append('file', formData.file);
                await apiClient.post(`/vendor/invoices/${invoiceId}/upload`, fd, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            setShowSuccess(true);
        } catch (err) {
            console.error('Invoice submit failed', err);
            alert(err?.response?.data?.message || t('createInvoice.errorDefault'));
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#166534',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                }}>
                    <Check size={40} strokeWidth={3} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>{t('createInvoice.successTitle')}</h2>
                <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    {t('createInvoice.successMessage', { invoiceNumber: formData.invoiceNumber })}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/vendor/invoices')}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                    >
                        {t('createInvoice.returnToList')}
                    </button>
                    <button
                        onClick={() => {
                            setShowSuccess(false);
                            setFormData({
                                invoiceNumber: '', tenderRef: '', date: new Date().toISOString().split('T')[0], baseAmount: '', description: '', file: null
                            });
                        }}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0A3D62', border: 'none', borderRadius: '8px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                    >
                        {t('createInvoice.createAnother')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/vendor/invoices')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748B', fontWeight: 500, marginBottom: '1.5rem'
                }}
            >
                <ArrowLeft size={18} /> {t('common.cancel')}
            </button>

            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '2rem' }}>
                    {t('createInvoice.title')}
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.vendorInvoiceNumber')} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('createInvoice.placeholders.vendorInvoiceNumber')}
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.tenderRef')} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('createInvoice.placeholders.tenderRef')}
                                value={formData.tenderRef}
                                onChange={(e) => setFormData({ ...formData, tenderRef: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.invoiceDate')} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.baseAmount')} <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                placeholder={t('createInvoice.placeholders.baseAmount')}
                                value={formData.baseAmount}
                                onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748B', fontWeight: 500 }}>
                            <Calculator size={18} /> {t('createInvoice.calculationSummary')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>{t('createInvoice.summary.baseAmount')}</span>
                            <span>₹ {formatNumber(parseFloat(formData.baseAmount || 0))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <span>{t('createInvoice.summary.gst')}</span>
                            <span>₹ {formatNumber(parseFloat(formData.baseAmount || 0) * 0.18)}</span>
                        </div>
                        <div style={{ height: '1px', backgroundColor: '#E2E8F0', marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}>
                            <span>{t('createInvoice.summary.totalPayable')}</span>
                            <span>₹ {formatNumber(calculateTotal())}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                            {t('createInvoice.fields.workDescription')}
                        </label>
                        <textarea
                            rows="3"
                            placeholder={t('createInvoice.placeholders.workDescription')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                            {t('createInvoice.fields.uploadInvoicePdf')} <span style={{ color: '#EF4444' }}>*</span>
                        </label>

                        {!formData.file ? (
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    required
                                />
                                <div style={{
                                    border: '2px dashed #CBD5E1',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    backgroundColor: '#F8FAFC',
                                    pointerEvents: 'none'
                                }}>
                                    <Upload size={32} color="#94A3B8" style={{ marginBottom: '1rem' }} />
                                    <p style={{ color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>{t('createInvoice.upload.clickToUpload')}</p>
                                    <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{t('createInvoice.upload.pdfOnlyMax')}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: '#F0FDF4',
                                border: '1px solid #86EFAC',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: '#DCFCE7', borderRadius: '8px', color: '#166534' }}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>{formData.file.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#15803D' }}>{t('createInvoice.upload.fileSizeMb', { size: (formData.file.size / 1024 / 1024).toFixed(2) })}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.5rem' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: '#0A3D62',
                            color: 'white',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? t('createInvoice.submitting') : t('createInvoice.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateInvoice;

