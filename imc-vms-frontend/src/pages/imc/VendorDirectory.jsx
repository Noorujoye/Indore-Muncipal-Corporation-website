import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Ban, CheckCircle, Building } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Modal from '../../components/common/Modal';

const VendorDirectory = () => {
    const { t } = useTranslation();
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

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted, #64748B)' }}>{t('vendorDirectory.loading')}</div>;

    return (
        <div>
            <div className="gov-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: 'var(--text-color, #0F172A)' }}>{t('vendorDirectory.title')}</h1>
                    <p style={{ color: 'var(--text-muted, #64748B)' }}>{t('vendorDirectory.subtitle')}</p>
                </div>
                <div style={{ position: 'relative', width: 'min(100%, 300px)' }}>
                    <Search size={18} color="var(--text-muted, #94A3B8)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={t('vendorDirectory.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="gov-input"
                        style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            <div className="gov-table-container">
                <div className="desktop-only">
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>{t('vendorDirectory.table.firm')}</th>
                                <th>{t('vendorDirectory.table.type')}</th>
                                <th>{t('vendorDirectory.table.contact', { defaultValue: 'CONTACT' })}</th>
                                <th>{t('vendorDirectory.table.joined')}</th>
                                <th>{t('vendorDirectory.table.status')}</th>
                                <th style={{ textAlign: 'right' }}>{t('vendorDirectory.table.actions')}</th>
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
                                                backgroundColor: 'var(--body-bg, #F1F5F9)',
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
                                                    <Building size={16} color="var(--text-muted, #475569)" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-color, #0F172A)' }}>{vendor.firmName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>{vendor.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{vendor.type}</td>
                                    <td style={{ color: 'var(--text-color, #003366)' }}>{vendor.email}</td>
                                    <td>{vendor.joined && !Number.isNaN(new Date(vendor.joined).getTime()) ? new Date(vendor.joined).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <span className={`gov-badge ${vendor.status === 'ACTIVE' ? 'gov-badge-success' : 'gov-badge-danger'}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => openVendorView(vendor.id)}
                                            className="btn-gov btn-outline touch-target"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem', minHeight: '36px' }}
                                        >
                                            {t('vendorDirectory.actions.view')}
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                                            className={`btn-gov ${vendor.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'} touch-target`}
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: '36px' }}
                                        >
                                            {vendor.status === 'ACTIVE' ? <><Ban size={12} style={{ marginRight: '4px' }} /> {t('vendorDirectory.actions.block')}</> : <><CheckCircle size={12} style={{ marginRight: '4px' }} /> {t('vendorDirectory.actions.activate')}</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-only mobile-card-list" style={{ padding: '0.75rem' }}>
                    {filteredVendors.map(vendor => (
                        <div key={vendor.id} className="mobile-data-card">
                            <div className="mobile-data-card__row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        backgroundColor: 'var(--body-bg, #F1F5F9)',
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
                                            <Building size={14} color="var(--text-muted, #475569)" />
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--text-color, #0F172A)' }}>{vendor.firmName}</span>
                                </div>
                                <span className={`gov-badge ${vendor.status === 'ACTIVE' ? 'gov-badge-success' : 'gov-badge-danger'}`}>
                                    {vendor.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', margin: '0.35rem 0' }}>
                                ID: {vendor.id} • Type: {vendor.type}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-color, #334155)', marginBottom: '0.75rem', wordBreak: 'break-word' }}>
                                {vendor.email}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => openVendorView(vendor.id)}
                                    className="btn-gov btn-outline touch-target"
                                    style={{
                                        width: '100%',
                                        minHeight: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {t('vendorDirectory.actions.view')}
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(vendor.id, vendor.status)}
                                    className={`btn-gov ${vendor.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'} touch-target`}
                                    style={{
                                        width: '100%',
                                        minHeight: '44px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {vendor.status === 'ACTIVE' ? <><Ban size={14} style={{ marginRight: '4px' }} /> {t('vendorDirectory.actions.block')}</> : <><CheckCircle size={14} style={{ marginRight: '4px' }} /> {t('vendorDirectory.actions.activate')}</>}
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredVendors.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #94A3B8)' }}>
                            {t('vendorDirectory.empty')}
                        </div>
                    )}
                </div>
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
                    <div style={{ color: 'var(--text-muted, #64748B)' }}>Loading...</div>
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

                        <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn-gov btn-outline touch-target"
                                onClick={() => setViewOpen(false)}
                                disabled={resetLoading}
                                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', minHeight: '44px' }}
                            >
                                Close
                            </button>
                            {selectedVendor?.pendingProfileUpdateRequestId ? (
                                <>
                                    <button
                                        type="button"
                                        className="btn-gov btn-outline touch-target"
                                        onClick={() => handleResolveProfileRequest('reject')}
                                        disabled={profileReqLoading || resetLoading}
                                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', minHeight: '44px' }}
                                    >
                                        {profileReqLoading ? 'Working...' : 'Reject Request'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-gov btn-success touch-target"
                                        onClick={() => handleResolveProfileRequest('resolve')}
                                        disabled={profileReqLoading || resetLoading}
                                        style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', minHeight: '44px' }}
                                    >
                                        {profileReqLoading ? 'Working...' : 'Resolve Request'}
                                    </button>
                                </>
                            ) : null}
                            <button
                                type="button"
                                className="btn-gov btn-primary touch-target"
                                onClick={handleResetCredentials}
                                disabled={resetLoading || profileReqLoading}
                                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', minHeight: '44px' }}
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
