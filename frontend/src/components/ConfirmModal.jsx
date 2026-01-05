import { X, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

let confirmResolver = null;
let currentConfirm = null;
let confirmListener = null;

export const confirm = {
  show: (title, message, options = {}) => {
    return new Promise((resolve) => {
      confirmResolver = resolve;
      currentConfirm = {
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger', // 'danger' or 'default'
      };
      if (confirmListener) {
        confirmListener(currentConfirm);
      }
    });
  },
};

const closeConfirm = (result) => {
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
  currentConfirm = null;
  if (confirmListener) {
    confirmListener(null);
  }
};

export default function ConfirmModal() {
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    confirmListener = setConfirmData;
    return () => {
      confirmListener = null;
    };
  }, []);

  if (!confirmData) return null;

  const handleConfirm = () => {
    closeConfirm(true);
  };

  const handleCancel = () => {
    closeConfirm(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            {confirmData.variant === 'danger' && (
              <div className="p-2 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            )}
            <h2 className="text-lg font-heading font-extrabold text-foreground">
              {confirmData.title}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {confirmData.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-4 bg-secondary/30 border-t border-border/50">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-foreground bg-card border border-border hover:bg-secondary transition-all"
          >
            {confirmData.cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
              confirmData.variant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-accent text-accent-foreground hover:opacity-90'
            }`}
          >
            {confirmData.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
