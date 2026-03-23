import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle, FileText, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status, size = 'md' }) => {
    const { t } = useTranslation();
    const getStatusConfig = (statusStr) => {
        const s = statusStr?.toUpperCase() || '';

        switch (s) {
            case 'APPROVED':
            case 'ACTIVE':
            case 'PAID':
            case 'READY_FOR_PAYMENT':
            case 'VERIFIED':
                return { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC', icon: CheckCircle };

            case 'PENDING':
            case 'CREATOR_PENDING':
            case 'VERIFIER_PENDING':
            case 'APPROVER_PENDING':
                return { bg: '#FEF9C3', color: '#B45309', border: '#FCD34D', icon: Clock };

            case 'REJECTED':
            case 'SUSPENDED':
                return { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5', icon: XCircle };

            case 'RETURNED':
            case 'CORRECTION_NEEDED':
                return { bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74', icon: AlertCircle };

            case 'DRAFT':
                return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: FileText };

            default:
                return { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0', icon: null };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    
    const normalized = status?.replace(/_/g, ' ') || 'UNKNOWN';
    const key = status ? status.toUpperCase() : 'UNKNOWN';
    const label = t(`status.${key}`, { defaultValue: normalized });

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            padding: size === 'sm' ? '0.1rem 0.4rem' : '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            whiteSpace: 'nowrap'
        }}>
            {Icon && <Icon size={size === 'sm' ? 10 : 12} strokeWidth={3} />}
            {label}
        </span>
    );
};

export default StatusBadge;
