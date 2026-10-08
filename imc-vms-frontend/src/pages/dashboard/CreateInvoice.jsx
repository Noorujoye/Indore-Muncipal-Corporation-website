import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Calculator, Check, FileText, X } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useTranslation } from 'react-i18next';
import MessageBanner from '../../components/common/MessageBanner';

const CreateInvoice = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [banner, setBanner] = useState(null);
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
        if (loading) return;
        setLoading(true);
        setBanner(null);

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
            setBanner({
                variant: 'error',
                message: err?.response?.data?.message || t('createInvoice.errorDefault')
            });
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'var(--card-bg)', padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#166534',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                }}>
                    <Check size={40} strokeWidth={3} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '1rem' }}>{t('createInvoice.successTitle')}</h2>
                <p style={{ color: 'var(--gray-600)', fontSize: '1.05rem', marginBottom: '2rem' }}>
                    {t('createInvoice.successMessage', { invoiceNumber: formData.invoiceNumber })}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/vendor/invoices')}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, color: 'var(--text-color)', cursor: 'pointer', minHeight: '44px' }}
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
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 600, color: 'white', cursor: 'pointer', minHeight: '44px' }}
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
                    color: 'var(--gray-600)', fontWeight: 500, marginBottom: '1.5rem'
                }}
            >
                <ArrowLeft size={18} /> {t('common.cancel')}
            </button>

            <div style={{ backgroundColor: 'var(--card-bg)', padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '1.5rem' }}>
                    {t('createInvoice.title')}
                </h1>

                <MessageBanner
                    variant={banner?.variant}
                    message={banner?.message}
                    onClose={() => setBanner(null)}
                />

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.vendorInvoiceNumber')} <span style={{ color: 'var(--gov-danger, #EF4444)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('createInvoice.placeholders.vendorInvoiceNumber')}
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.tenderRef')} <span style={{ color: 'var(--gov-danger, #EF4444)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t('createInvoice.placeholders.tenderRef')}
                                value={formData.tenderRef}
                                onChange={(e) => setFormData({ ...formData, tenderRef: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.invoiceDate')} <span style={{ color: 'var(--gov-danger, #EF4444)' }}>*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                                {t('createInvoice.fields.baseAmount')} <span style={{ color: 'var(--gov-danger, #EF4444)' }}>*</span>
                            </label>
                            <input
                                type="number"
                                placeholder={t('createInvoice.placeholders.baseAmount')}
                                value={formData.baseAmount}
                                onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                            />
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                            <Calculator size={18} /> {t('createInvoice.calculationSummary')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                            <span>{t('createInvoice.summary.baseAmount')}</span>
                            <span>₹ {formatNumber(parseFloat(formData.baseAmount || 0))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                            <span>{t('createInvoice.summary.gst')}</span>
                            <span>₹ {formatNumber(parseFloat(formData.baseAmount || 0) * 0.18)}</span>
                        </div>
                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                            <span>{t('createInvoice.summary.totalPayable')}</span>
                            <span style={{ color: 'var(--primary)' }}>₹ {formatNumber(calculateTotal())}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                            {t('createInvoice.fields.workDescription')}
                        </label>
                        <textarea
                            rows="3"
                            placeholder={t('createInvoice.placeholders.workDescription')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                            {t('createInvoice.fields.uploadInvoicePdf')} <span style={{ color: 'var(--gov-danger, #EF4444)' }}>*</span>
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
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--gray-100)',
                                    pointerEvents: 'none'
                                }}>
                                    <Upload size={32} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-color)', fontWeight: 500, marginBottom: '0.5rem' }}>{t('createInvoice.upload.clickToUpload')}</p>
                                    <p style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>{t('createInvoice.upload.pdfOnlyMax')}</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: 'color-mix(in srgb, #10B981 12%, transparent)',
                                border: '1px solid #10B981',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', backgroundColor: '#DCFCE7', borderRadius: '8px', color: '#166534' }}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>{formData.file.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#15803D' }}>{t('createInvoice.upload.fileSizeMb', { size: (formData.file.size / 1024 / 1024).toFixed(2) })}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.5rem', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.2s',
                            minHeight: '48px'
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

