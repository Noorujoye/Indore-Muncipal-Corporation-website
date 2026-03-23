import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '28rem' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 51,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            pointerEvents: 'none'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                pointerEvents: 'auto',
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '0.75rem',
                                boxShadow: 'var(--shadow-lg)',
                                width: '100%',
                                maxWidth,
                                maxHeight: 'calc(100vh - 2rem)',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                                <button
                                    onClick={onClose}
                                    style={{
                                        color: 'var(--gray-600)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.string,
};

export default Modal;
