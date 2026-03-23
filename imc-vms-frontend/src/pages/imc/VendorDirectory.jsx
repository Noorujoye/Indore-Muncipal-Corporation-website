import { useState, useEffect, useRef } from 'react';
import { Search, Ban, CheckCircle, Building } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Modal from '../../components/common/Modal';

const VendorDirectory = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [logoUrlsByVendorId, setLogoUrlsByVendorId] = useState({});
    const logoUrlsRef = useRef({});

    const [viewOpen, setViewOpen] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [profileReqLoading, setProfileReqLoading] = useState(false);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        try {
            const data = await apiClient.get('/creator/vendors');
            const normalized = Array.isArray(data)
                ? data.map((v) => ({
                    id: v.id,
                    firmName: v.firmName,
                    type: v.firmType,
                    email: v.email,
                    joined: v.joinedAt,
                    status: v.status,
                    hasLogo: Boolean(v.hasLogo),
                }))
                : [];
            setVendors(normalized);

            
            const vendorsWithLogo = normalized.filter(v => v.hasLogo);

            
            Object.values(logoUrlsRef.current || {}).forEach((url) => {
                try { URL.revokeObjectURL(url); } catch { }
            });
            logoUrlsRef.current = {};
            setLogoUrlsByVendorId({});

            if (vendorsWithLogo.length > 0) {
                const results = await Promise.all(
                    vendorsWithLogo.map(async (v) => {
                        try {
                            const blob = await apiClient.get(`/creator/vendors/${v.id}/logo`, { responseType: 'blob' });
                            return { id: v.id, blob };
                        } catch {
                            return null;
                        }
                    })
                );

                const nextMap = {};
                results.filter(Boolean).forEach(({ id, blob }) => {
                    const url = URL.createObjectURL(blob);
                    nextMap[id] = url;
                });

                logoUrlsRef.current = nextMap;
                setLogoUrlsByVendorId(nextMap);
            }
        } catch (error) {
            console.error("Failed to load vendors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            Object.values(logoUrlsRef.current || {}).forEach((url) => {
                try { URL.revokeObjectURL(url); } catch { }
            });
        };
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'ACTIVE' ? 'Block' : 'Activate';
        if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;

        try {
            const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
            await apiClient.post(`/creator/vendors/${id}/status`, { status: nextStatus });
            setVendors(vendors.map(v =>
                v.id === id ? { ...v, status: nextStatus } : v
            ));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const openVendorView = async (vendorId) => {
        setViewOpen(true);
        setSelectedVendorId(vendorId);
        setSelectedVendor(null);
        setDetailsLoading(true);
        try {
            const data = await apiClient.get(`/creator/vendors/${vendorId}`);
            setSelectedVendor(data || null);
        } catch (e) {
            console.error('Failed to load vendor details', e);
            alert('Failed to load vendor details');
            setViewOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const refreshSelectedVendor = async () => {
        if (!selectedVendorId) return;
        setDetailsLoading(true);
        try {
            const data = await apiClient.get(`/creator/vendors/${selectedVendorId}`);
            setSelectedVendor(data || null);
        } catch {
            
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleResetCredentials = async () => {
        if (!selectedVendorId) return;
        if (!confirm('Generate a new password and send it to vendor email?')) return;

        setResetLoading(true);
        try {
            await apiClient.post(`/creator/vendors/${selectedVendorId}/reset-credentials`);
            alert('New password generated and sent via email.');
            await refreshSelectedVendor();
        } catch (e) {
            console.error('Failed to reset credentials', e);
            alert(e?.response?.data?.message || 'Failed to send email');
        } finally {
            setResetLoading(false);
        }
    };

    const handleResolveProfileRequest = async (action) => {
        const requestId = selectedVendor?.pendingProfileUpdateRequestId;
        if (!requestId) return;
        if (profileReqLoading) return;

        const verb = action === 'reject' ? 'Reject' : 'Resolve';
        if (!confirm(`${verb} this profile update request?`)) return;

        setProfileReqLoading(true);
        try {
            await apiClient.post(`/creator/profile-update-requests/${requestId}/${action}`, {});
            alert(action === 'reject' ? 'Request rejected.' : 'Request resolved.');
            await refreshSelectedVendor();
        } catch (e) {
            alert(e?.response?.data?.message || 'Failed to update request');
        } finally {
            setProfileReqLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return '-';
        try {
            return new Date(value).toLocaleDateString();
        } catch {
            return String(value);
        }
    };

    const renderRow = (label, value) => (
        <tr>
            <td style={{ width: '45%', color: 'var(--gov-text-secondary)', fontWeight: 600 }}>{label}</td>
            <td style={{ width: '55%', color: 'var(--gov-text-primary)', fontWeight: 600 }}>{value || '-'}</td>
        </tr>
    );

    const formatDateTime = (value) => {
        if (!value) return '-';
        try {
            return new Date(value).toLocaleString();
        } catch {
            return String(value);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(v.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(v.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '2rem' }}>Loading Directory...</div>;

    return (
        <div>
            <div className="gov-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Vendor Directory</h1>
                    <p>Manage all registered vendors and their account status.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search Active Vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="gov-input"
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
            </div>

            <div className="gov-table-container">
                <table className="gov-table">
                    <thead>
                        <tr>
                            <th>FIRM IDENTITY</th>
                            <th>TYPE</th>
                            <th>CONTACT</th>
                            <th>JOINED DATE</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map(vendor => (
                            <tr key={vendor.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            padding: '0.5rem',
                                            backgroundColor: '#F1F5F9',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {logoUrlsByVendorId[vendor.id] ? (
                                                <img
                                                    src={logoUrlsByVendorId[vendor.id]}
                                                    alt={vendor.firmName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Building size={16} color="#475569" />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{vendor.firmName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{vendor.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{vendor.type}</td>
                                <td style={{ color: '#003366' }}>{vendor.email}</td>
                                <td>{new Date(vendor.joined).toLocaleDateString()}</td>
                                <td>
                                    <span className={`gov-badge ${vendor.status === 'ACTIVE' ? 'gov-badge-success' : 'gov-badge-danger'}`}>
                                        {vendor.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={() => openVendorView(vendor.id)}
                                        className="btn-gov btn-outline"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                                        className={`btn-gov ${vendor.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                        {vendor.status === 'ACTIVE' ? <><Ban size={12} style={{ marginRight: '4px' }} /> Block</> : <><CheckCircle size={12} style={{ marginRight: '4px' }} /> Activate</>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={viewOpen}
                onClose={() => {
                    setViewOpen(false);
                    setSelectedVendorId(null);
                    setSelectedVendor(null);
                }}
                title={selectedVendor?.firmName ? `Vendor: ${selectedVendor.firmName}` : 'Vendor Details'}
                maxWidth="44rem"
            >
                {detailsLoading ? (
                    <div style={{ color: 'var(--gray-700)' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div
                            className="gov-table-container"
                            style={{ maxHeight: '60vh', overflowY: 'auto' }}
                        >
                            <table className="gov-table">
                                <tbody>
                                    {renderRow('Vendor ID', String(selectedVendor?.id ?? ''))}
                                    {renderRow('Status', selectedVendor?.status)}
                                    {renderRow(
                                        'Credential Reset Requested',
                                        selectedVendor?.hasPendingCredentialResetRequest
                                            ? `YES (${formatDateTime(selectedVendor?.pendingCredentialResetRequestedAt)})`
                                            : 'NO'
                                    )}
                                    {renderRow(
                                        'Profile Update Request',
                                        selectedVendor?.pendingProfileUpdateRequestId
                                            ? `PENDING (${formatDateTime(selectedVendor?.pendingProfileUpdateRequestedAt)})`
                                            : 'NONE'
                                    )}
                                    {selectedVendor?.pendingProfileUpdateRequestId ? (
                                        <>
                                            {renderRow('Update Reason', selectedVendor?.pendingProfileUpdateReason)}
                                            {renderRow('Update Details', selectedVendor?.pendingProfileUpdateDetails)}
                                        </>
                                    ) : null}
                                    {renderRow('Firm Type', selectedVendor?.firmType)}
                                    {renderRow('Firm Name', selectedVendor?.firmName)}
                                    {renderRow('Email', selectedVendor?.email)}
                                    {renderRow('Mobile', selectedVendor?.authorizedPersonMobile)}
                                    {renderRow('PAN', selectedVendor?.panNumber)}
                                    {renderRow('GSTIN', selectedVendor?.gstinNumber)}
                                    {renderRow('Registration No.', selectedVendor?.registrationNumber)}
                                    {renderRow('Registration Date', formatDate(selectedVendor?.registrationDate))}
                                    {renderRow('MSME No.', selectedVendor?.msmeNumber)}
                                    {renderRow('Authorized Person', selectedVendor?.authorizedPersonName)}
                                    {renderRow('Designation', selectedVendor?.authorizedPersonDesignation)}
                                    {renderRow('Aadhaar', selectedVendor?.authorizedPersonAadhaar)}
                                    {renderRow('Address', selectedVendor?.addressLine)}
                                    {renderRow('City', selectedVendor?.city)}
                                    {renderRow('District', selectedVendor?.district)}
                                    {renderRow('State', selectedVendor?.state)}
                                    {renderRow('Pincode', selectedVendor?.pincode)}
                                    {renderRow('Bank IFSC', selectedVendor?.bankIfsc)}
                                    {renderRow('Account No.', selectedVendor?.bankAccountNumber)}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button
                                type="button"
                                className="btn-gov btn-outline"
                                onClick={() => setViewOpen(false)}
                                disabled={resetLoading}
                                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                            >
                                Close
                            </button>
                            {selectedVendor?.pendingProfileUpdateRequestId ? (
                                <>
                                    <button
                                        type="button"
                                        className="btn-gov btn-outline"
                                        onClick={() => handleResolveProfileRequest('reject')}
                                        disabled={profileReqLoading || resetLoading}
                                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                                    >
                                        {profileReqLoading ? 'Working...' : 'Reject Request'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-gov btn-success"
                                        onClick={() => handleResolveProfileRequest('resolve')}
                                        disabled={profileReqLoading || resetLoading}
                                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                                    >
                                        {profileReqLoading ? 'Working...' : 'Resolve Request'}
                                    </button>
                                </>
                            ) : null}
                            <button
                                type="button"
                                className="btn-gov btn-primary"
                                onClick={handleResetCredentials}
                                disabled={resetLoading || profileReqLoading}
                                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                            >
                                {resetLoading ? 'Sending...' : 'Send Password Again'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VendorDirectory;
