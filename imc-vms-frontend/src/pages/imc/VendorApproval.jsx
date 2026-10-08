import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Check, X, Mail, Shield, Eye, Building, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import apiClient from '../../services/apiClient';
import MessageBanner from '../../components/common/MessageBanner';

const VendorApproval = () => {
    const { t } = useTranslation();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [viewVendor, setViewVendor] = useState(null); 
    const [rejectReason, setRejectReason] = useState('');
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        setBanner(null);
        try {
            const data = await apiClient.get('/creator/vendors/pending');
            const normalized = Array.isArray(data)
                ? data.map((v) => ({
                    id: v.id,
                    firmName: v.firmName,
                    type: v.firmType,
                    email: v.email,
                    pan: v.panNumber,
                    gst: v.gstinNumber,
                    phone: v.authorizedPersonMobile,
                    address: [v.addressLine, v.city, v.district, v.state, v.pincode]
                        .filter(Boolean)
                        .join(', '),
                    submittedAt: v.createdAt,
                    bank: {
                        name: null,
                        account: v.bankAccountNumber,
                        ifsc: v.bankIfsc,
                    },
                }))
                : [];
            setVendors(normalized);
        } catch (error) {
            console.error("Failed to load vendors", error);
            setBanner({
                variant: 'error',
                title: 'Failed to load requests',
                message: error?.response?.data?.message || error?.message || 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id) => {
        if (selectedVendors.includes(id)) {
            setSelectedVendors(selectedVendors.filter(vId => vId !== id));
        } else {
            setSelectedVendors([...selectedVendors, id]);
        }
    };

    const handleApprove = async (idsToApprove) => {
        if (processing) return;
        const targetIds = Array.isArray(idsToApprove) ? idsToApprove : [idsToApprove];
        if (targetIds.length === 0) return;

        setBanner(null);
        setProcessing(true);
        try {
            await Promise.all(targetIds.map((id) => apiClient.post(`/creator/vendors/${id}/approve`)));
            setBanner({
                variant: 'success',
                title: 'Approved',
                message: `Vendor${targetIds.length > 1 ? 's' : ''} approved. Credentials have been sent via email.`,
            });
            setSelectedVendors([]);
            setViewVendor(null); 
            setRejectReason('');
            loadVendors();
        } catch (err) {
            setBanner({
                variant: 'error',
                title: 'Approval failed',
                message: err?.response?.data?.message || err?.message || 'Please try again.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id) => {
        if (processing) return;
        if (!rejectReason.trim()) {
            setBanner({
                variant: 'error',
                title: 'Rejection reason required',
                message: 'Please enter a reason to reject this request.',
            });
            return;
        }

        setBanner(null);
        setProcessing(true);
        try {
            await apiClient.post(`/creator/vendors/${id}/reject`, { reason: rejectReason.trim() });
            setBanner({
                variant: 'success',
                title: 'Rejected',
                message: 'Vendor registration rejected. The vendor may reapply with corrected details.',
            });
            setViewVendor(null); 
            setRejectReason('');
            loadVendors();
        } catch (err) {
            setBanner({
                variant: 'error',
                title: 'Rejection failed',
                message: err?.response?.data?.message || err?.message || 'Please try again.',
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted, #64748B)' }}>{t('vendorApproval.loading')}</div>;

    return (
        <div>
            <MessageBanner
                variant={banner?.variant}
                title={banner?.title}
                message={banner?.message}
                onClose={() => setBanner(null)}
            />
            {viewVendor && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '12px', width: '100%', maxWidth: '700px',
                        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-color, #E2E8F0)'
                    }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--body-bg, #F8FAFC)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', margin: 0 }}>{viewVendor.firmName}</h2>
                                <p style={{ color: 'var(--text-muted, #64748B)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{t('vendorApproval.registrationId')}: {viewVendor.id} • {t('vendorApproval.submitted')}: {new Date(viewVendor.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => { setViewVendor(null); setRejectReason(''); }} className="touch-target" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={24} color="var(--text-muted, #64748B)" />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Building size={14} /> {t('vendorApproval.businessIdentity')}
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.type')}:</span> {viewVendor.type}</div>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.pan')}:</span> <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--body-bg, #F1F5F9)', padding: '2px 6px', borderRadius: '4px' }}>{viewVendor.pan}</span></div>
                                    <div><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.gstin')}:</span> <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--body-bg, #F1F5F9)', padding: '2px 6px', borderRadius: '4px' }}>{viewVendor.gst}</span></div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> {t('vendorApproval.contactDetails')}
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', wordBreak: 'break-word' }}><Mail size={14} style={{ marginTop: '3px', flexShrink: 0 }} /> <span>{viewVendor.email}</span></div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><Phone size={14} style={{ marginTop: '3px', flexShrink: 0 }} /> <span>{viewVendor.phone || 'N/A'}</span></div>
                                    <div style={{ display: 'flex', gap: '0.5rem', wordBreak: 'break-word' }}><MapPin size={14} style={{ marginTop: '3px', flexShrink: 0 }} /> <span>{viewVendor.address || 'N/A'}</span></div>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--border-color, #E2E8F0)' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CreditCard size={14} /> {t('vendorApproval.bankInformation')}
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.bank')}:</span> {viewVendor.bank?.name || 'N/A'}</div>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.account')}:</span> {viewVendor.bank?.account || 'N/A'}</div>
                                    <div><span style={{ fontWeight: 600, color: 'var(--text-color, #334155)' }}>{t('vendorApproval.ifsc')}:</span> {viewVendor.bank?.ifsc || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={14} /> {t('vendorApproval.documents')}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-color, #0A3D62)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> {t('vendorApproval.panCardCopy')}</span>
                                        <span style={{ color: 'var(--text-color, #0A3D62)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> {t('vendorApproval.gstRegistration')}</span>
                                        <span style={{ color: 'var(--text-color, #0A3D62)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> {t('vendorApproval.cancelledCheque')}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--border-color, #E2E8F0)' }} />

                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #94A3B8)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={14} /> {t('vendorApproval.decisionNotes')}
                                </h4>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color, #334155)', marginBottom: '0.5rem' }}>
                                    {t('vendorApproval.rejectionReasonRequired')}
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t('vendorApproval.rejectionPlaceholder')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color, #CBD5E1)',
                                        backgroundColor: 'var(--card-bg, #ffffff)',
                                        color: 'var(--text-color, #0F172A)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        minHeight: '90px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--body-bg, #F8FAFC)', borderTop: '1px solid var(--border-color, #E2E8F0)', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                            <button
                                onClick={() => handleReject(viewVendor.id)}
                                disabled={processing}
                                className="touch-target"
                                style={{
                                    minHeight: '44px',
                                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #DC2626',
                                    color: '#DC2626', backgroundColor: 'var(--card-bg, #ffffff)', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <X size={18} /> {t('vendorApproval.reject')}
                            </button>
                            <button
                                onClick={() => handleApprove(viewVendor.id)}
                                disabled={processing}
                                className="touch-target"
                                style={{
                                    minHeight: '44px',
                                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
                                    color: 'white', backgroundColor: '#10B981', fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <Check size={18} /> {t('vendorApproval.approve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="gov-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: 'var(--text-color, #0F172A)' }}>{t('vendorApproval.title')}</h1>
                    <p style={{ color: 'var(--text-muted, #64748B)' }}>{t('vendorApproval.subtitle')}</p>
                </div>
                {selectedVendors.length > 0 && (
                    <button
                        onClick={() => handleApprove(selectedVendors)}
                        disabled={processing}
                        className="btn-gov btn-success touch-target"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '44px' }}
                    >
                        <Mail size={16} /> {t('vendorApproval.approve')} ({selectedVendors.length})
                    </button>
                )}
            </div>

            <div className="gov-table-container">
                {vendors.length > 0 ? (
                    <>
                        <div className="desktop-only">
                            <table className="gov-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedVendors(vendors.map(v => v.id));
                                                    else setSelectedVendors([]);
                                                }}
                                                checked={vendors.length > 0 && selectedVendors.length === vendors.length}
                                            />
                                        </th>
                                        <th>FIRM NAME</th>
                                        <th>TYPE</th>
                                        <th>CONTACT EMAIL</th>
                                        <th>PAN / GST</th>
                                        <th style={{ textAlign: 'right' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.map(vendor => (
                                        <tr key={vendor.id} style={{ backgroundColor: selectedVendors.includes(vendor.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVendors.includes(vendor.id)}
                                                    onChange={() => handleSelect(vendor.id)}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-color, #0F172A)' }}>{vendor.firmName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>ID: {vendor.id}</div>
                                            </td>
                                            <td>{vendor.type}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-color, #334155)' }}>
                                                    <Mail size={12} /> {vendor.email}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.8rem' }}>PAN: <span style={{ fontFamily: 'monospace' }}>{vendor.pan}</span></div>
                                                <div style={{ fontSize: '0.8rem' }}>GST: <span style={{ fontFamily: 'monospace' }}>{vendor.gst}</span></div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => { setViewVendor(vendor); setRejectReason(''); }}
                                                        className="btn-gov btn-outline touch-target"
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', minHeight: '38px' }}
                                                        title="View Full Details"
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only mobile-card-list" style={{ padding: '0.75rem' }}>
                            {vendors.map(vendor => (
                                <div key={vendor.id} className="mobile-data-card" style={{ backgroundColor: selectedVendors.includes(vendor.id) ? 'rgba(16, 185, 129, 0.08)' : undefined }}>
                                    <div className="mobile-data-card__row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVendors.includes(vendor.id)}
                                                onChange={() => handleSelect(vendor.id)}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span style={{ fontWeight: 700, color: 'var(--text-color, #0F172A)' }}>{vendor.firmName}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>ID: {vendor.id}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', margin: '0.35rem 0' }}>
                                        Type: {vendor.type} • PAN: {vendor.pan}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color, #334155)', marginBottom: '0.75rem', wordBreak: 'break-word' }}>
                                        {vendor.email}
                                    </div>
                                    <button
                                        onClick={() => { setViewVendor(vendor); setRejectReason(''); }}
                                        className="btn-gov btn-outline touch-target"
                                        style={{
                                            width: '100%',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <Eye size={16} /> View Details & Decision
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted, #94A3B8)' }}>
                        <div style={{ backgroundColor: 'var(--body-bg, #F1F5F9)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <UserPlus size={28} opacity={0.5} />
                        </div>
                        <p style={{ margin: 0 }}>{t('vendorApproval.empty')}</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', backgroundColor: 'var(--body-bg, #F8FAFC)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color, #E2E8F0)', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <Shield size={20} color="var(--text-muted, #64748B)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-color, #334155)' }}>Security Note</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', lineHeight: 1.5 }}>
                        Approving a vendor will automatically generate a strong password and email it to the vendor's provided email address.
                        They will be able to login immediately after approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorApproval;

