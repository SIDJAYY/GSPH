import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

function StatusUpdateModal({ application, onClose, onUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setErrors({});
        
        // Validation
        if (!selectedStatus) {
            setErrors({ status: 'Please select an action' });
            return;
        }
        
        if (selectedStatus === 'denied' && !remarks.trim()) {
            setErrors({ remarks: 'Remarks are required for rejection' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Map frontend status to backend status
            const backendStatus = selectedStatus === 'denied' ? 'rejected' : selectedStatus;
            await onUpdate(application.id, backendStatus, remarks);
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            setErrors({ general: 'Failed to update status. Please try again.' });
        }
    };

    const statusOptions = [
        { value: 'approved', label: 'Approve', color: 'text-green-600', bgColor: 'bg-green-50', icon: Check },
        { value: 'denied', label: 'Deny', color: 'text-red-600', bgColor: 'bg-red-50', icon: X }
    ];

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        // Clear remarks when switching to approve
        if (status === 'approved') {
            setRemarks('');
        }
        setErrors({});
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Update Application Status</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Application Info */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-slate-800 dark:text-white">{application.studentName}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{application.studentId}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{application.aidType} - {application.amount}</p>
                        </div>

                        {/* Status Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Select Action <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {statusOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedStatus === option.value
                                                ? `border-orange-500 ${option.bgColor}`
                                                : 'border-slate-200 dark:border-slate-600 hover:border-orange-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={option.value}
                                            checked={selectedStatus === option.value}
                                            onChange={() => handleStatusChange(option.value)}
                                            className="sr-only"
                                        />
                                        <option.icon className={`w-5 h-5 mr-3 ${option.color}`} />
                                        <span className={`font-medium ${option.color}`}>{option.label} Application</span>
                                    </label>
                                ))}
                            </div>
                            {errors.status && (
                                <p className="text-red-500 text-sm mt-2">{errors.status}</p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Remarks {selectedStatus === 'denied' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder={selectedStatus === 'denied' ? 'Please provide reason for rejection...' : 'Optional remarks...'}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                    errors.remarks ? 'border-red-500 focus:ring-red-300' : 'border-slate-200 dark:border-slate-600'
                                }`}
                                rows="3"
                                required={selectedStatus === 'denied'}
                            />
                            {errors.remarks && (
                                <p className="text-red-500 text-sm mt-2">{errors.remarks}</p>
                            )}
                        </div>

                        {/* Warning for denial */}
                        {selectedStatus === 'denied' && (
                            <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        This action cannot be undone
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-300">
                                        The applicant will be notified of the rejection and the reason provided.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* General error */}
                        {errors.general && (
                            <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedStatus || isSubmitting || (selectedStatus === 'denied' && !remarks.trim())}
                        onClick={handleSubmit}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedStatus === 'approved'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : selectedStatus === 'denied'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                    >
                        {isSubmitting ? 'Processing...' : `${selectedStatus === 'approved' ? 'Approve' : selectedStatus === 'denied' ? 'Deny' : 'Update'} Application`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StatusUpdateModal; 