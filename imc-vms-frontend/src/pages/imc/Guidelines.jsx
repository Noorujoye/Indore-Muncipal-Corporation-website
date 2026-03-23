import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import { BookOpen, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const Guidelines = () => {
    const role = localStorage.getItem('imc_role') || 'CREATOR';

    return (
        <div>
            <PageHeader
                title="Operational Guidelines"
                subtitle={`Standard Operating Procedures (SOP) for ${role}`}
            />

            <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>

                <div className="gov-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D62', marginBottom: '1rem' }}>
                        <Shield size={20} /> General Compliance Policy
                    </h3>
                    <p style={{ lineHeight: 1.6, color: '#334155' }}>
                        All invoice processing must adhere to the Madhya Pradesh Municipal Corporation Act, 1956 and the internal financial bye-laws of Indore Municipal Corporation.
                        As a designated <strong>{role}</strong>, you are responsible for the accuracy of your validation stage.
                    </p>
                </div>

                <div className="gov-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0A3D62', marginBottom: '1rem' }}>
                        <BookOpen size={20} /> Checklist for {role}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '6px' }}>
                            <CheckCircle size={20} color="#0284C7" style={{ marginTop: '2px' }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#0369A1' }}>Mandatory Document Verification</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#0C4A6E' }}>Ensure GST Certificate, Pan Card, and Signed Invoice copy are legible.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: '6px' }}>
                            <AlertTriangle size={20} color="#CA8A04" style={{ marginTop: '2px' }} />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#854D0E' }}>Discrepancy Reporting</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#713F12' }}>If any discrepancy is found in tax amounts, DO NOT reject immediately. Use the "Return to Vendor" or "Return to Creator" function with specific comments.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Guidelines;

