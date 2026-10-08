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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color, #0F172A)', marginBottom: '0.25rem' }}>
                        {t('helpdesk.title')}
                    </h1>
                    <p style={{ color: 'var(--text-muted, #64748B)', fontSize: '0.9rem' }}>{t('helpdesk.subtitle')}</p>
                </div>
                <button
                    className="touch-target"
                    style={{
                        backgroundColor: '#0A3D62',
                        color: 'white',
                        minHeight: '44px',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Plus size={18} /> {t('helpdesk.raiseNewTicket')}
                </button>
            </div>

            <div style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #E2E8F0)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 240px)' }}>
                    <Search size={16} color="var(--text-muted, #94A3B8)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={t('helpdesk.searchPlaceholder')}
                        style={{
                            width: '100%',
                            padding: '0.6rem 0.5rem 0.6rem 2.25rem',
                            border: '1px solid var(--border-color, #CBD5E1)',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            backgroundColor: 'var(--card-bg, #ffffff)',
                            color: 'var(--text-color, #0F172A)',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <button
                    className="touch-target"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted, #64748B)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        minHeight: '44px',
                        padding: '0 0.5rem'
                    }}
                >
                    <Filter size={16} /> {t('helpdesk.filterStatus')}
                </button>
            </div>

            <div style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #E2E8F0)',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                {tickets.length > 0 && (
                    <>
                        <div className="desktop-only gov-table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--body-bg, #F8FAFC)', borderBottom: '1px solid var(--border-color, #E2E8F0)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>{t('helpdesk.table.ticketId')}</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>{t('helpdesk.table.subject')}</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>{t('helpdesk.table.relatedInvoice')}</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>{t('helpdesk.table.date')}</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>{t('helpdesk.table.status')}</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => {
                                        const style = getStatusStyle(ticket.status);
                                        return (
                                            <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border-color, #F1F5F9)' }}>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color, #0F172A)' }}>
                                                    {ticket.id}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-color, #334155)' }}>
                                                    {ticket.subject}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted, #64748B)', fontFamily: 'monospace' }}>
                                                    {ticket.relatedInvoice}
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted, #64748B)' }}>
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
                                                    <button className="touch-target" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94A3B8)', padding: '0.5rem' }}>
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-only mobile-card-list" style={{ padding: '0.75rem' }}>
                            {tickets.map((ticket) => {
                                const style = getStatusStyle(ticket.status);
                                return (
                                    <div key={ticket.id} className="mobile-data-card">
                                        <div className="mobile-data-card__row">
                                            <span style={{ fontWeight: 700, color: 'var(--text-color, #0F172A)' }}>{ticket.id}</span>
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
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-color, #0F172A)', margin: '0.5rem 0' }}>
                                            {ticket.subject}
                                        </div>
                                        <div className="mobile-data-card__row" style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748B)' }}>
                                            <span>{t('helpdesk.table.relatedInvoice')}: {ticket.relatedInvoice}</span>
                                            <span>{ticket.date}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
                {tickets.length === 0 && (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted, #94A3B8)' }}>
                        <MessageSquare size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>{t('helpdesk.empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Helpdesk;

