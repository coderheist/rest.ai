const Skeleton = ({ className = '', variant = 'rectangular', animation = true }) => {
  const baseStyles = 'bg-gray-200';
  const animationStyles = animation ? 'animate-pulse' : '';
  
  const variantStyles = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div 
      className={`${baseStyles} ${animationStyles} ${variantStyles[variant]} ${className}`}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-6 shadow-soft-lg">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-soft-lg">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center space-x-4">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
