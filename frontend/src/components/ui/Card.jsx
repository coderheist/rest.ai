const cardVariants = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-soft-lg hover:shadow-soft-xl',
  outlined: 'bg-transparent border-2 border-gray-200',
  gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-gray-200',
};

const Card = ({ 
  variant = 'elevated', 
  hoverable = false,
  className = '', 
  children,
  ...props 
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';
  const variantStyles = cardVariants[variant] || cardVariants.default;
  const hoverStyles = hoverable ? 'hover:scale-[1.02] cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className = '', children }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ className = '', children }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ className = '', children }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
