import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    const iconClass = getIconColors();
    switch (type) {
      case 'success':
        return <FiCheck className={iconClass} />;
      case 'error':
        return <FiX className={iconClass} />;
      case 'warning':
        return <FiAlertCircle className={iconClass} />;
      case 'info':
        return <FiInfo className={iconClass} />;
      default:
        return <FiInfo className={iconClass} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-400/30 bg-green-50/80 backdrop-blur-xl';
      case 'error':
        return 'border-red-400/30 bg-red-50/80 backdrop-blur-xl';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-50/80 backdrop-blur-xl';
      case 'info':
        return 'border-blue-400/30 bg-blue-50/80 backdrop-blur-xl';
      default:
        return 'border-blue-400/30 bg-blue-50/80 backdrop-blur-xl';
    }
  };

  const getTextColors = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-blue-700';
    }
  };

  const getIconColors = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative flex items-start space-x-3 p-4 rounded-2xl border ${getColors()} shadow-lg max-w-sm w-full floating`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${getTextColors()}`}>
          {title}
        </p>
        {message && (
          <p className={`mt-1 text-sm ${getTextColors()} opacity-80`}>
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 ${getTextColors()} opacity-60 hover:opacity-100 transition-opacity`}
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />
  };
};

export default Toast;