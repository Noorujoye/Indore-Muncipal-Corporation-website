import React from 'react';
import { useTranslation } from 'react-i18next';

const stylesByVariant = {
    success: {
        borderColor: 'color-mix(in srgb, var(--gov-success, var(--secondary)) 45%, var(--border-color))',
        backgroundColor: 'color-mix(in srgb, var(--gov-success, var(--secondary)) 14%, transparent)',
        textColor: 'color-mix(in srgb, var(--gov-success, var(--secondary)) 72%, var(--text-color))'
    },
    error: {
        borderColor: 'color-mix(in srgb, var(--gov-danger, #DC2626) 45%, var(--border-color))',
        backgroundColor: 'color-mix(in srgb, var(--gov-danger, #DC2626) 14%, transparent)',
        textColor: 'color-mix(in srgb, var(--gov-danger, #DC2626) 72%, var(--text-color))'
    },
    info: {
        borderColor: 'var(--border-color)',
        backgroundColor: 'color-mix(in srgb, var(--gray-200) 55%, transparent)',
        textColor: 'var(--text-color)'
    }
};

const MessageBanner = ({ variant = 'info', title, message, onClose }) => {
    const { t } = useTranslation();
    if (!message) return null;
    const v = stylesByVariant[variant] || stylesByVariant.info;

    return (
        <div style={{
            padding: '0.9rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${v.borderColor}`,
            backgroundColor: v.backgroundColor,
            color: v.textColor,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1rem'
        }}>
            <div style={{ flex: 1 }}>
                {title && (
                    <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{title}</div>
                )}
                <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.4 }}>{message}</div>
            </div>
            {typeof onClose === 'function' && (
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: v.textColor,
                        fontWeight: 800,
                        padding: '0.25rem 0.5rem',
                        lineHeight: 1
                    }}
                    aria-label={t('common.close')}
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default MessageBanner;
