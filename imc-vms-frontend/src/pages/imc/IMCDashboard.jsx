import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Send, ShieldCheck, CornerUpLeft, Award, TrendingUp } from 'lucide-react';
import apiClient from '../../services/apiClient';

const IMCDashboard = () => {
    const [role, setRole] = useState('CREATOR');
    const [stats, setStats] = useState({});
    const [pendingVendors, setPendingVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const resolveRole = async () => {
            try {
                const me = await apiClient.get('/auth/me');
                const resolved = me?.role;
                if (!cancelled && resolved && ['CREATOR', 'VERIFIER', 'APPROVER'].includes(resolved)) {
                    setRole(resolved);
                    localStorage.setItem('imc_role', resolved);
                }
                return resolved;
            } catch {
                const storedRole = localStorage.getItem('imc_role') || 'CREATOR';
                if (!cancelled) setRole(storedRole);
                return storedRole;
            }
        };

        const fetchStats = async () => {
            try {
                const resolvedRole = await resolveRole();
                const roleKey = String(resolvedRole || 'CREATOR').toLowerCase();
                const counts = await apiClient.get(`/${roleKey}/dashboard/counts`);

                if (resolvedRole === 'CREATOR') {
                    
                    try {
                        const res = await apiClient.get('/creator/vendors/pending');
                        setPendingVendors(res);
                    } catch (e) {
                        console.error('Failed to load pending vendors', e);
                    }
                }

                const pendingInvoices = Number(counts?.pendingInvoices ?? 0);
                const pendingVendorsCount = Number(counts?.pendingVendors ?? 0);
                const readyForPayment = Number(counts?.readyForPayment ?? 0);

                const forwardedToday = Number(counts?.forwardedToday ?? 0);
                const verifiedToday = Number(counts?.verifiedToday ?? 0);
                const approvedToday = Number(counts?.approvedToday ?? 0);
                const rejectedToday = Number(counts?.rejectedToday ?? 0);
                const returnedForCorrection = Number(counts?.returnedForCorrection ?? 0);
                const forwardedToApprover = Number(counts?.forwardedToApprover ?? 0);

                setStats({
                    pendingVendors: pendingVendorsCount,
                    pendingInvoices,
                    readyForPayment,

                    
                    pendingScrutinyCount: pendingInvoices,
                    forwardedToday,
                    rejectedByMe: rejectedToday,

                    
                    pendingVerificationCount: pendingInvoices,
                    verifiedToday,
                    returnedForCorrection,
                    forwardedToApprover,

                    
                    pendingApprovalCount: pendingInvoices,
                    approvedToday,
                    rejectedToday,
                    readyForPaymentTotal: readyForPayment,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleApproveVendor = async (vendorId) => {
        if (!window.confirm("Approve this vendor? System will generate a password.")) return;
        try {
            const response = await apiClient.post(`/creator/vendors/${vendorId}/approve`);
            
            alert(response.message || "Vendor Approved Successfully!");
            
            setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
        } catch (error) {
            console.error("Approval failed", error);
            alert("Approval failed: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const getDashboardContent = () => {
        if (role === 'APPROVER') {
            return {
                title: 'Approver Dashboard',
                subtitle: 'Final authority for invoice approval and payment readiness.',
                cards: [
                    { label: 'Invoices Pending Approval', value: stats.pendingApprovalCount, icon: Clock, color: '#EAB308' },
                    { label: 'Approved Today', value: stats.approvedToday, icon: CheckCircle, color: '#10B981' },
                    { label: 'Rejected Today', value: stats.rejectedToday, icon: AlertTriangle, color: '#EF4444' },
                    { label: 'Ready for Payment', value: stats.readyForPaymentTotal, icon: Award, color: '#003366' }
                ]
            };
        }

        if (role === 'VERIFIER') {
            return {
                title: 'Verifier Dashboard',
                subtitle: 'Verify invoice calculations and technical correctness before approval.',
                cards: [
                    { label: 'Pending Verification', value: stats.pendingVerificationCount, icon: Clock, color: '#EAB308' },
                    { label: 'Verified Today', value: stats.verifiedToday, icon: ShieldCheck, color: '#3B82F6' },
                    { label: 'Returned for Correction', value: stats.returnedForCorrection, icon: CornerUpLeft, color: '#EF4444' },
                    { label: 'Forwarded to Approver', value: stats.forwardedToApprover, icon: Send, color: '#10B981' }
                ]
            };
        }

        return {
            title: 'Creator Dashboard',
            subtitle: 'Perform initial scrutiny of invoices submitted by vendors.',
            cards: [
                { label: 'Pending Scrutiny', value: stats.pendingScrutinyCount, icon: Clock, color: '#EAB308' },
                { label: 'Forwarded Today', value: stats.forwardedToday, icon: Send, color: '#3B82F6' },
                { label: 'Rejected by Me', value: stats.rejectedByMe, icon: AlertTriangle, color: '#EF4444' }
            ]
        };
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

    const content = getDashboardContent();

    return (
        <div>
            <div className="gov-header">
                <h1>{content.title}</h1>
                <p>{content.subtitle}</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {content.cards.map((stat, index) => (
                    <div key={index} className="gov-card" style={{
                        borderLeft: `4px solid ${stat.color}`,
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                {stat.label}
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                                {stat.value ?? 0}
                            </p>
                        </div>
                        <div style={{
                            color: stat.color,
                            opacity: 0.8
                        }}>
                            <stat.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            {role === 'CREATOR' && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
                        Pending Vendor Registrations
                    </h3>
                    {pendingVendors.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                            No pending registrations.
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            {pendingVendors.map((vendor, idx) => (
                                <div key={vendor.id} style={{
                                    padding: '1.5rem',
                                    borderBottom: idx !== pendingVendors.length - 1 ? '1px solid #F1F5F9' : 'none',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0F172A', fontSize: '1rem' }}>{vendor.firmName}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
                                            <span>{vendor.firmType}</span>
                                            <span>•</span>
                                            <span>{vendor.user?.email || 'No Email'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApproveVendor(vendor.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#16A34A',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                                            }}
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {role !== 'VENDOR' && role !== 'CREATOR' && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>Recent System Activity</h3>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '0' }}>
                        {[
                            
                        ].map((item, idx) => (
                            
                            <div key={idx}>Activity Item</div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                backgroundColor: '#F8FAFC',
                padding: '1.5rem',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                color: '#475569'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#334155' }}>OPERATIONAL GUIDELINES</h3>
                {role === 'APPROVER' ? (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>Your decision is final. <strong>Approve</strong> only when fully satisfied with the audit trail.</li>
                        <li>Check "Verified On" date and remarks from previous stages carefully.</li>
                        <li>Payments are processed automatically after "Ready for Payment" status.</li>
                    </ul>
                ) : role === 'VERIFIER' ? (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>Check Base Amount and GST % against attached invoice PDF.</li>
                        <li>Return to Creator if any document is blurry or incorrect.</li>
                        <li>Do not forward partial verifications.</li>
                    </ul>
                ) : (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>Ensure Vendor Name matches the Invoice exactly.</li>
                        <li>Verify Invoice Date is within the allowed financial year.</li>
                        <li>Reject immediately if mandatory attachments are missing.</li>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default IMCDashboard;

