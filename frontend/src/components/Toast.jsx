import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { _removeToast, _setToastListener, _getToastQueue } from '../lib/toast';

export default function Toast() {
  const [toasts, setToasts] = useState(_getToastQueue());

  useEffect(() => {
    _setToastListener(setToasts);
    return () => {
      _setToastListener(null);
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-accent" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-orange-500';
      case 'info':
      default:
        return 'border-l-accent';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => _removeToast(toast.id)}
          icon={getIcon(toast.type)}
          borderColor={getBorderColor(toast.type)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove, icon, borderColor }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className={`pointer-events-auto bg-card border-l-4 ${borderColor} border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right-full duration-300 max-w-md`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground font-heading">{toast.message}</p>
          {toast.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 hover:bg-secondary rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
