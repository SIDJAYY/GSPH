import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = ++toastId;
        const newToast = {
            id,
            type: 'info',
            duration: 5000,
            ...toast,
        };
        
        setToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, title = 'Success') => {
        return addToast({ type: 'success', title, message });
    }, [addToast]);

    const showError = useCallback((message, title = 'Error') => {
        return addToast({ type: 'error', title, message });
    }, [addToast]);

    const showWarning = useCallback((message, title = 'Warning') => {
        return addToast({ type: 'warning', title, message });
    }, [addToast]);

    const showInfo = useCallback((message, title = 'Info') => {
        return addToast({ type: 'info', title, message });
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll,
    };
};
