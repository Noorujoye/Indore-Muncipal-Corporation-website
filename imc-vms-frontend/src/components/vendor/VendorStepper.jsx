import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VendorStepper = ({ currentStep }) => {
    const { t } = useTranslation();
    const steps = [
        { id: 1, title: t('vendorReg.step1') },
        { id: 2, title: t('vendorReg.step2') },
        { id: 3, title: t('vendorReg.step3') }
    ];

    const progress = (currentStep - 1) / (steps.length - 1);

    return (
        <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    height: '2px',
                    background: 'var(--gray-200)',
                    zIndex: 0
                }}></div>

                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    width: 'calc(100% - 40px)',
                    height: '2px',
                    background: 'var(--primary)',
                    transformOrigin: 'left',
                    transform: `scaleX(${Math.max(0, Math.min(1, progress))})`,
                    transition: 'transform var(--transition-normal)',
                    zIndex: 0
                }}></div>

                {steps.map((step) => {
                    const status = step.id < currentStep ? 'completed' : step.id === currentStep ? 'active' : 'upcoming';
                    const isFirst = step.id === steps[0]?.id;
                    const isLast = step.id === steps[steps.length - 1]?.id;

                    return (
                        <div key={step.id} style={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '40px',
                            flex: '0 0 40px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: status === 'completed' ? 'var(--secondary)' : status === 'active' ? 'var(--primary)' : 'var(--white)',
                                border: status === 'upcoming' ? '2px solid var(--gray-200)' : '2px solid transparent',
                                color: status === 'upcoming' ? 'var(--gray-600)' : 'var(--white)',
                                fontWeight: 600,
                                marginBottom: '0.75rem',
                                transition: 'all 0.3s ease',
                                boxShadow: status === 'active' ? 'var(--shadow-sm)' : 'none'
                            }}>
                                {status === 'completed' ? <Check size={20} /> : step.id}
                            </div>
                            <span style={{
                                position: 'absolute',
                                top: '56px',
                                left: isFirst ? 0 : isLast ? 'auto' : '50%',
                                right: isLast ? 0 : 'auto',
                                transform: isFirst || isLast ? 'none' : 'translateX(-50%)',
                                fontSize: '0.875rem',
                                fontWeight: status === 'active' ? 700 : 500,
                                color: status === 'active' ? 'var(--primary)' : 'var(--gray-600)',
                                transition: 'color var(--transition-normal)',
                                textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                                width: 'max-content',
                                maxWidth: '240px',
                                whiteSpace: 'normal',
                                lineHeight: 1.25
                            }}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VendorStepper;

