import { Download, Calendar } from 'lucide-react';

const Reports = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Reports & Analytics</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', backgroundColor: 'white',
                        border: '1px solid #E2E8F0', borderRadius: '8px', color: '#64748B'
                    }}>
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', backgroundColor: '#0A3D62',
                        border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600
                    }}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="gov-card" style={{ borderLeft: '4px solid #0A3D62' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Invoices Processed</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', margin: '0.5rem 0' }}>1,248</div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>▲ 12%</span> vs last month
                    </div>
                </div>
                <div className="gov-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Payouts (FY 2025-26)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', margin: '0.5rem 0' }}>₹ 42.5 Cr</div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>▲ 5%</span> within budget
                    </div>
                </div>
                <div className="gov-card" style={{ borderLeft: '4px solid #EAB308' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Avg Processing Time</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', margin: '0.5rem 0' }}>4.2 Days</div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>▼ 1.5 Days</span> faster
                    </div>
                </div>
                <div className="gov-card" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Rejection Rate</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', margin: '0.5rem 0' }}>8.4%</div>
                    <div style={{ fontSize: '0.8rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>▲ 0.2%</span> slight increase
                    </div>
                </div>
            </div>

            <div className="gov-table-container">
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>Department Wise Breakdown</h3>
                </div>
                <table className="gov-table">
                    <thead>
                        <tr>
                            <th>DEPARTMENT</th>
                            <th>BUDGET ALLOCATED</th>
                            <th>UTILIZED</th>
                            <th>PENDING INVOICES</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 600 }}>Civil Works / Engineering</td>
                            <td>₹ 150.0 Cr</td>
                            <td>₹ 89.2 Cr (59%)</td>
                            <td>45</td>
                            <td><span className="gov-badge gov-badge-success">On Track</span></td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600 }}>Health & Sanitation</td>
                            <td>₹ 80.0 Cr</td>
                            <td>₹ 75.5 Cr (94%)</td>
                            <td>12</td>
                            <td><span className="gov-badge gov-badge-danger">Critical</span></td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600 }}>Water Supply</td>
                            <td>₹ 120.0 Cr</td>
                            <td>₹ 60.0 Cr (50%)</td>
                            <td>28</td>
                            <td><span className="gov-badge gov-badge-success">On Track</span></td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 600 }}>Street Lighting / Electrical</td>
                            <td>₹ 45.0 Cr</td>
                            <td>₹ 22.5 Cr (50%)</td>
                            <td>8</td>
                            <td><span className="gov-badge gov-badge-success">On Track</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;

