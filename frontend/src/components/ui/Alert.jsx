import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const alertVariants = {
  info: {
    container: 'bg-primary-50 border-primary-200',
    icon: 'text-primary-600',
    title: 'text-primary-900',
    text: 'text-primary-700',
    Icon: Info,
  },
  success: {
    container: 'bg-success-50 border-success-200',
    icon: 'text-success-600',
    title: 'text-success-900',
    text: 'text-success-700',
    Icon: CheckCircle,
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-600',
    title: 'text-warning-900',
    text: 'text-warning-700',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'bg-danger-50 border-danger-200',
    icon: 'text-danger-600',
    title: 'text-danger-900',
    text: 'text-danger-700',
    Icon: AlertCircle,
  },
};

const Alert = ({ 
  variant = 'info', 
  title, 
  children, 
  dismissible = false,
  onDismiss,
  className = '' 
}) => {
  const config = alertVariants[variant];
  const Icon = config.Icon;

  return (
    <div className={`rounded-lg border p-4 ${config.container} ${className} animate-fade-in-down`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.text}`}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${config.icon} hover:bg-black/5 transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
