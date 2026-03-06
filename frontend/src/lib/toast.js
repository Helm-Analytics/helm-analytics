let toastQueue = [];
let toastListener = null;

export const _getToastQueue = () => [...toastQueue];
export const _setToastListener = (listener) => {
  toastListener = listener;
};

export const _removeToast = (id) => {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  if (toastListener) {
    toastListener([...toastQueue]);
  }
};

const addToast = (toast) => {
  const id = Date.now() + Math.random();
  toastQueue.push({ ...toast, id });
  if (toastListener) {
    toastListener([...toastQueue]);
  }
};

export const toast = {
  success: (message, description = '') => {
    addToast({ type: 'success', message, description });
  },
  error: (message, description = '') => {
    addToast({ type: 'error', message, description });
  },
  info: (message, description = '') => {
    addToast({ type: 'info', message, description });
  },
  warning: (message, description = '') => {
    addToast({ type: 'warning', message, description });
  },
};
