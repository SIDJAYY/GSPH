import React from 'react';
import { X, User, School, Calendar, Phone, MapPin, DollarSign, FileText, CheckCircle, CreditCard } from 'lucide-react';

function ApplicationModal({ application, onClose, onStatusUpdate }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'denied':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const handleStatusUpdate = (newStatus) => {
        if (onStatusUpdate) {
            onStatusUpdate(application.id, newStatus);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Application Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(application.status)}`}>
                            {application.status}
                        </span>
                        <span className="text-sm text-slate-500">ID: {application.studentId}</span>
                    </div>

                    {/* Student Information */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-orange-500" />
                            Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.studentName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Grade Level</label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.grade}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guardian</label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.guardian}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Number</label>
                                <p className="text-slate-800 dark:text-white font-medium flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                    {application.contact}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                                <p className="text-slate-800 dark:text-white font-medium flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                    {application.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* School Information */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                            <School className="w-5 h-5 mr-2 text-orange-500" />
                            School Information
                        </h3>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">School Name</label>
                            <p className="text-slate-800 dark:text-white font-medium">{application.school}</p>
                        </div>
                    </div>

                    {/* Aid Information */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
                            Aid Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Aid Type</label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.aidType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount</label>
                                <p className="text-green-600 dark:text-green-400 font-bold text-lg">{application.amount}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Application Date</label>
                                <p className="text-slate-800 dark:text-white font-medium flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                    {application.applicationDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bank Account Details */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                            Payment Account Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {application.accountType && ['gcash', 'maya', 'paymaya', 'coins_ph', 'grabpay', 'shopee_pay', 'other_digital_wallet'].includes(application.accountType) 
                                        ? 'Digital Wallet / Bank Name' 
                                        : 'Bank Name'
                                    }
                                </label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.bankName || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {application.accountType && ['gcash', 'maya', 'paymaya', 'coins_ph', 'grabpay', 'shopee_pay', 'other_digital_wallet'].includes(application.accountType) 
                                        ? 'Mobile Number / Account Number' 
                                        : 'Account Number'
                                    }
                                </label>
                                <p className="text-slate-800 dark:text-white font-medium font-mono">
                                    {application.accountNumber ? 
                                        application.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : 
                                        'Not provided'
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Holder Name</label>
                                <p className="text-slate-800 dark:text-white font-medium">{application.accountHolderName || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type</label>
                                <p className="text-slate-800 dark:text-white font-medium capitalize">
                                    {application.accountType ? 
                                        application.accountType.replace('_', ' ') : 
                                        'Not provided'
                                    }
                                </p>
                            </div>
                            {/* Only show routing number for traditional bank accounts */}
                            {application.routingNumber && !['gcash', 'maya', 'paymaya', 'coins_ph', 'grabpay', 'shopee_pay', 'other_digital_wallet'].includes(application.accountType) && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Routing Number / Swift Code</label>
                                    <p className="text-slate-800 dark:text-white font-medium font-mono">{application.routingNumber}</p>
                                </div>
                            )}
                        </div>
                        {(!application.bankName || !application.accountNumber) && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <strong>Note:</strong> Payment account details are required for disbursement. 
                                    Please ensure all information is complete and accurate.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Remarks */}
                    {application.remarks && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-orange-500" />
                                Remarks
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">{application.remarks}</p>
                        </div>
                    )}

                    {/* Next Steps for Approved Applications */}
                    {application.status === 'approved' && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                                Next Steps - Payment Processing
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                        1
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Payment Record Created
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-300">
                                            A payment record has been automatically created for disbursement.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                        2
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Student Notification Sent
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-300">
                                            Student has been notified via email/SMS about the approval.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Payment Scheduled
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-300">
                                            Payment is scheduled for processing within 3-5 business days.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                                        4
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Disbursement
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Funds will be transferred to student's bank account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    <strong>Payment Method:</strong> Bank Transfer (Default)
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    <strong>Processing Time:</strong> 3-5 business days
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    <strong>Amount:</strong> {application.amount}
                                </p>
                                {application.bankName && application.accountNumber && (
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        <strong>Bank Account:</strong> {application.bankName} - {application.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                    >
                        Close
                    </button>
                    {application.status === 'pending' && onStatusUpdate && (
                        <>
                            <button 
                                onClick={() => handleStatusUpdate('denied')}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Deny Application
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate('approved')}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Approve Application
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ApplicationModal; 