import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--text-color)',
                    marginBottom: '0.35rem',
                    letterSpacing: '-0.025em'
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        color: 'var(--gray-600)',
                        fontSize: '0.9rem',
                        marginTop: 0,
                        maxWidth: '600px',
                        lineHeight: 1.5
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
