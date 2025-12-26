const badgeVariants = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  gray: 'bg-gray-100 text-gray-700',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const Badge = ({ 
  variant = 'gray', 
  size = 'md',
  rounded = false,
  className = '', 
  children 
}) => {
  const baseStyles = 'inline-flex items-center font-medium transition-colors duration-200';
  const variantStyles = badgeVariants[variant] || badgeVariants.gray;
  const sizeStyles = badgeSizes[size] || badgeSizes.md;
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${sizeStyles} ${roundedStyles} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
