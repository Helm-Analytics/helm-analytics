let confirmResolver = null;
let currentConfirm = null;
let confirmListener = null;

export const _getConfirmData = () => currentConfirm;
export const _setConfirmListener = (listener) => {
  confirmListener = listener;
};

export const _closeConfirm = (result) => {
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
  currentConfirm = null;
  if (confirmListener) {
    confirmListener(null);
  }
};

export const confirm = {
  show: (title, message, options = {}) => {
    return new Promise((resolve) => {
      confirmResolver = resolve;
      currentConfirm = {
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger',
      };
      if (confirmListener) {
        confirmListener(currentConfirm);
      }
    });
  },
};
