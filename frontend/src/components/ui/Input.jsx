import { forwardRef } from 'react';

const inputVariants = {
  default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
  error: 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
  success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
};

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

const Input = forwardRef(({
  label,
  error,
  success,
  helperText,
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const variant = error ? 'error' : success ? 'success' : 'default';
  const baseStyles = 'block w-full rounded-lg border shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white';
  const variantStyles = inputVariants[variant];
  const sizeStyles = inputSizes[size];
  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${variantStyles} ${sizeStyles} ${iconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || success || helperText) && (
        <p className={`mt-2 text-sm ${error ? 'text-danger-600' : success ? 'text-success-600' : 'text-gray-500'}`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
