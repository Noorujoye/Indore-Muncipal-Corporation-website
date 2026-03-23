import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
    const { t } = useTranslation();
    const baseId = useId();
    const [openIndex, setOpenIndex] = useState(null);

    const items = [
        {
            q: t('faq.q1'),
            a: t('faq.a1')
        },
        {
            q: t('faq.q2'),
            a: t('faq.a2')
        },
        {
            q: t('faq.q3'),
            a: t('faq.a3')
        },
        {
            q: t('faq.q4'),
            a: t('faq.a4')
        },
        {
            q: t('faq.q5'),
            a: t('faq.a5')
        },
        {
            q: t('faq.q6'),
            a: t('faq.a6')
        }
    ];

    const toggle = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="gov-header">
                        <h1>{t('faq.title')}</h1>
                        <p>{t('faq.subtitle')}</p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {items.map((item, index) => {
                            const isOpen = openIndex === index;
                            const contentId = `${baseId}-faq-a-${index}`;
                            const buttonId = `${baseId}-faq-q-${index}`;

                            return (
                                <section key={item.q} className="gov-card">
                                    <div style={{ padding: '0.75rem 1rem' }}>
                                        <button
                                            id={buttonId}
                                            type="button"
                                            onClick={() => toggle(index)}
                                            aria-expanded={isOpen}
                                            aria-controls={contentId}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1rem',
                                                padding: '0.75rem 0.25rem',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                color: 'var(--gov-text-primary)',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                lineHeight: 1.35,
                                            }}
                                        >
                                            <span>{item.q}</span>
                                            <ChevronDown
                                                size={18}
                                                style={{
                                                    flex: '0 0 auto',
                                                    color: 'var(--gov-text-secondary)',
                                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.15s ease',
                                                }}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div
                                                id={contentId}
                                                role="region"
                                                aria-labelledby={buttonId}
                                                style={{
                                                    borderTop: '1px solid var(--gov-border)',
                                                    padding: '0.75rem 0.25rem 0.25rem',
                                                    color: 'var(--gov-text-secondary)',
                                                    lineHeight: 1.65,
                                                }}
                                            >
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FAQ;
