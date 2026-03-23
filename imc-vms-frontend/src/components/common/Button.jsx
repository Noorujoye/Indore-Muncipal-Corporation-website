import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary shadow-md hover:shadow-lg transform active:scale-[0.98]",
        secondary: "bg-secondary text-white hover:opacity-90 active:opacity-100 focus:ring-secondary",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white active:bg-primary-light focus:ring-primary font-semibold",
        ghost: "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
    };

    const style = {
        
        backgroundColor: variant === 'primary'
            ? 'var(--gov-primary, var(--primary))'
            : variant === 'secondary'
                ? 'var(--secondary)'
                : 'transparent',
        color: variant === 'outline'
            ? 'var(--gov-primary, var(--primary))'
            : variant === 'ghost'
                ? 'inherit'
                : 'var(--gov-bg-card, var(--white))',
        border: variant === 'outline' ? '1px solid var(--gov-primary, var(--primary))' : 'none',
    };

    
    
    
    

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn btn-${variant} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </motion.button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
    className: PropTypes.string,
};

export default Button;
