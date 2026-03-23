import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Mail, Shield, Eye, Building, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import apiClient from '../../services/apiClient';
import MessageBanner from '../../components/common/MessageBanner';

const VendorApproval = () => {
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

    if (loading) return <div style={{ padding: '2rem' }}>Loading Requests...</div>;

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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px',
                        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: '#F8FAFC' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{viewVendor.firmName}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>Registration ID: {viewVendor.id} • Submitted: {new Date(viewVendor.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => { setViewVendor(null); setRejectReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={24} color="#64748B" />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Building size={14} /> Business Identity
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: '#334155' }}>Type:</span> {viewVendor.type}</div>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: '#334155' }}>PAN:</span> <span style={{ fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{viewVendor.pan}</span></div>
                                    <div><span style={{ fontWeight: 600, color: '#334155' }}>GSTIN:</span> <span style={{ fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{viewVendor.gst}</span></div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> Contact Details
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><Mail size={14} style={{ marginTop: '3px' }} /> {viewVendor.email}</div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}><Phone size={14} style={{ marginTop: '3px' }} /> {viewVendor.phone || 'N/A'}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}><MapPin size={14} style={{ marginTop: '3px' }} /> {viewVendor.address || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CreditCard size={14} /> Bank Information
                                    </h4>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: '#334155' }}>Bank:</span> {viewVendor.bank?.name || 'N/A'}</div>
                                    <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: 600, color: '#334155' }}>Account:</span> {viewVendor.bank?.account || 'N/A'}</div>
                                    <div><span style={{ fontWeight: 600, color: '#334155' }}>IFSC:</span> {viewVendor.bank?.ifsc || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={14} /> Documents
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <a href="#" style={{ color: '#003366', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="green" /> PAN Card Copy</a>
                                        <a href="#" style={{ color: '#003366', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="green" /> GST Registration</a>
                                        <a href="#" style={{ color: '#003366', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="green" /> Cancelled Cheque</a>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

                            <div>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={14} /> Decision Notes
                                </h4>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                    Rejection reason (required to reject)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter clear reason (e.g., PAN mismatch, missing documents)"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #CBD5E1',
                                        outline: 'none',
                                        minHeight: '90px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => handleReject(viewVendor.id)}
                                disabled={processing}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #DC2626',
                                    color: '#DC2626', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <X size={18} /> Reject
                            </button>
                            <button
                                onClick={() => handleApprove(viewVendor.id)}
                                disabled={processing}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none',
                                    color: 'white', backgroundColor: '#10B981', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <Check size={18} /> Approve Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="gov-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Vendor Registration Requests</h1>
                    <p>Approve new vendor registrations to grant them system access.</p>
                </div>
                {selectedVendors.length > 0 && (
                    <button
                        onClick={() => handleApprove(selectedVendors)}
                        disabled={processing}
                        className="btn-gov btn-success"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Mail size={16} /> Approve & Send Credentials ({selectedVendors.length})
                    </button>
                )}
            </div>

            <div className="gov-table-container">
                {vendors.length > 0 ? (
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
                                <tr key={vendor.id} style={{ backgroundColor: selectedVendors.includes(vendor.id) ? '#F0FDF4' : 'transparent' }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedVendors.includes(vendor.id)}
                                            onChange={() => handleSelect(vendor.id)}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{vendor.firmName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {vendor.id}</div>
                                    </td>
                                    <td>{vendor.type}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155' }}>
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
                                                className="btn-gov btn-outline"
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
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
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
                        <div style={{ backgroundColor: '#F1F5F9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <UserPlus size={28} opacity={0.5} />
                        </div>
                        <p>No processed registration requests pending.</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <Shield size={20} color="#64748B" style={{ marginTop: '2px' }} />
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>Security Note</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                        Approving a vendor will automatically generate a strong password and email it to the vendor's provided email address.
                        They will be able to login immediately after approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorApproval;

