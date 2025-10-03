import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'danger', // 'danger', 'warning', 'info'
    isLoading = false
}) {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-500',
                    button: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
                    border: 'border-red-200'
                };
            case 'warning':
                return {
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
                    border: 'border-yellow-200'
                };
            case 'info':
                return {
                    icon: 'text-blue-500',
                    button: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
                    border: 'border-blue-200'
                };
            default:
                return {
                    icon: 'text-gray-500',
                    button: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500',
                    border: 'border-gray-200'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 ${styles.icon}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 flex items-center justify-end space-x-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.button}`}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal; 