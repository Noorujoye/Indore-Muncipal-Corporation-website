import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Search, Filter, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Helpdesk = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        
        setTickets([]);
        setLoading(false);
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
            case 'RESOLVED': return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
            case 'CLOSED': return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
            default: return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>{t('helpdesk.loading')}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                        {t('helpdesk.title')}
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{t('helpdesk.subtitle')}</p>
                </div>
                <button style={{
                    backgroundColor: '#0A3D62',
                    color: 'white',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <Plus size={18} /> {t('helpdesk.raiseNewTicket')}
                </button>
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                    <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text"
                        placeholder={t('helpdesk.searchPlaceholder')}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0' }}></div>
                <button style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                    <Filter size={16} /> {t('helpdesk.filterStatus')}
                </button>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Ticket ID</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{t('helpdesk.table.subject')}</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{t('helpdesk.table.relatedInvoice')}</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{t('helpdesk.table.date')}</th>
                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{t('helpdesk.table.status')}</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket, index) => {
                            const style = getStatusStyle(ticket.status);
                            return (
                                <tr key={ticket.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                                        {ticket.id}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                                        {ticket.subject}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748B', fontFamily: 'monospace' }}>
                                        {ticket.relatedInvoice}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748B' }}>
                                        {ticket.date}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            backgroundColor: style.bg,
                                            color: style.color,
                                            border: `1px solid ${style.border}`,
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {tickets.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                        <MessageSquare size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>{t('helpdesk.empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Helpdesk;

