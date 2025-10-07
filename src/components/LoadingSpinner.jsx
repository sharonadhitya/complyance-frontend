import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-600 mt-4">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;