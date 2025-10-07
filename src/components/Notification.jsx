import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  const typeClasses = {
    success: 'bg-success-50 text-success-700 border-success-200',
    error: 'bg-danger-50 text-danger-700 border-danger-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  const iconClasses = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  return (
    <div className={`p-4 rounded-lg border animate-fade-in ${typeClasses[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg mr-2">{iconClasses[type]}</span>
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;