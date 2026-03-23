import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, XCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const InvoiceDecision = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState(null);
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const me = await apiClient.get('/auth/me');
                const resolvedRole = me?.role || localStorage.getItem('imc_role') || 'CREATOR';
                setRole(resolvedRole);
                localStorage.setItem('imc_role', resolvedRole);

                const roleKey = String(resolvedRole).toLowerCase();
                const detail = await apiClient.get(`/${roleKey}/invoices/${id}`);
                setInvoiceData(detail);

                const docs = await apiClient.get(`/documents/INVOICE/${id}`).catch(() => []);
                setDocuments(Array.isArray(docs) ? docs : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load invoice details or Unauthorized.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const downloadDocument = async (docId, fileName = 'document') => {
        const blob = await apiClient.get(`/documents/download/${docId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleApprove = async () => {
        if (!role) return;
        if (!confirm('Confirm approval? This cannot be undone.')) return;
        setProcessing(true);
        try {
            const roleKey = String(role).toLowerCase();
            await apiClient.post(`/${roleKey}/invoices/${id}/approve`, { remarks: remarks.trim() || null });
            navigate('/imc/queue');
        } catch (err) {
            alert('Error processing: ' + (err?.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!role) return;
        if (!remarks.trim()) {
            alert('Usage error: remarks are required for rejection.');
            return;
        }
        if (!confirm('Confirm rejection? This cannot be undone.')) return;
        setProcessing(true);
        try {
            const roleKey = String(role).toLowerCase();
            await apiClient.post(`/${roleKey}/invoices/${id}/reject`, { remarks: remarks.trim() });
            navigate('/imc/queue');
        } catch (err) {
            alert('Error processing: ' + (err?.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Invoice Details...</div>;
    if (error) return <div style={{ padding: '2rem', color: '#DC2626' }}>{error}</div>;
    if (!invoiceData) return null;

    const invoiceSummary = {
        invoiceNumber: invoiceData.vendorInvoiceNumber,
        vendorName: invoiceData.vendorName,
        tenderReference: invoiceData.tenderReferenceNumber,
        baseAmount: Number(invoiceData.baseAmount ?? 0),
        totalAmount: Number(invoiceData.totalAmount ?? 0),
        submittedAt: invoiceData.submittedAt,
    };

    const auditTrail = Array.isArray(invoiceData.timeline)
        ? invoiceData.timeline
        : [];

    const approveLabel = role === 'APPROVER'
        ? 'APPROVE FOR PAYMENT'
        : role === 'VERIFIER'
            ? 'VERIFY & FORWARD'
            : 'FORWARD TO VERIFIER';

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <button
                onClick={() => navigate('/imc/queue')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748B', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem'
                }}
            >
                <ArrowLeft size={16} /> Back to Queue
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '1.5rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="gov-card">
                        <div className="gov-card-header">
                            INVOICE SUMMARY: {invoiceSummary.invoiceNumber}
                        </div>
                        <div className="gov-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>VENDOR NAME</label>
                                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{invoiceSummary.vendorName}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>TENDER REFERENCE</label>
                                    <div style={{ fontSize: '1rem' }}>{invoiceSummary.tenderReference}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>BASE AMOUNT</label>
                                    <div style={{ fontSize: '1rem' }}>₹ {invoiceSummary.baseAmount.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>SUBMITTED DATE</label>
                                    <div style={{ fontSize: '1rem' }}>{new Date(invoiceSummary.submittedAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>TOTAL AMOUNT (Inc. GST)</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#003366' }}>₹ {invoiceSummary.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="gov-card">
                        <div className="gov-card-header">ATTACHMENTS</div>
                        <div className="gov-card-body" style={{ padding: '1rem' }}>
                            <button
                                className="btn-gov btn-outline"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                disabled={documents.length === 0}
                                onClick={async () => {
                                    if (documents.length === 0) return;
                                    const doc = documents[0];
                                    await downloadDocument(doc.id, doc.fileName || 'invoice');
                                }}
                            >
                                <FileText size={16} style={{ marginRight: '0.5rem' }} /> {documents.length ? 'Download Invoice Document' : 'No Documents Uploaded'}
                            </button>
                        </div>
                    </div>

                    <div className="gov-card">
                        <div className="gov-card-header">AUDIT LOG</div>
                        <div className="gov-card-body">
                            <table className="gov-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: '0.5rem' }}>STAGE</th>
                                        <th style={{ padding: '0.5rem' }}>ACTION</th>
                                        <th style={{ padding: '0.5rem' }}>ACTOR</th>
                                        <th style={{ padding: '0.5rem' }}>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditTrail.map((step, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{step.stage || '-'}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{step.action || 'SUBMITTED'}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{step.actorName || '-'}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#475569', fontStyle: step.remarks ? 'normal' : 'italic' }}>
                                                {step.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div>
                    <div className="gov-card" style={{ position: 'sticky', top: '90px', borderColor: '#CBD5E1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div className="gov-card-header" style={{ backgroundColor: '#003366', color: 'white' }}>
                            OFFICIAL ACTION
                        </div>
                        <div className="gov-card-body">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Remarks <span style={{ color: '#DC2626' }}>*</span>
                                </label>
                                <textarea
                                    className="gov-input"
                                    rows="4"
                                    placeholder="Enter official remarks..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    style={{ resize: 'vertical', minHeight: '100px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button onClick={handleApprove} disabled={processing} className="btn-gov btn-success" style={{ width: '100%', padding: '1rem' }}>
                                    <ShieldCheck size={18} style={{ marginRight: '0.5rem' }} /> {approveLabel}
                                </button>

                                <button onClick={handleReject} disabled={processing} className="btn-gov btn-danger" style={{ width: '100%' }}>
                                    <XCircle size={16} style={{ marginRight: '0.5rem' }} /> REJECT INVOICE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoiceDecision;

