import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Clock, CheckCircle, XCircle, Download, CreditCard, Calendar, User, Plus, Edit, Trash2, DollarSign, AlertCircle, FileText, Users, Zap, Eye, X } from 'lucide-react';

function PaymentProcessing({ onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending'); // Default to show pending only
    const [methodFilter, setMethodFilter] = useState('all');
    const [payments, setPayments] = useState([]);
    const [approvedApplications, setApprovedApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showViewApplicationModal, setShowViewApplicationModal] = useState(false);
    const [showCancelApplicationModal, setShowCancelApplicationModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [showProcessPaymentModal, setShowProcessPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [processingApplications, setProcessingApplications] = useState(new Set()); // Track which applications are being processed
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        scheduled: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        totalFees: 0,
        pendingApplications: 0
    });
    
    // Local pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    // API base URL - adjust based on your configuration
    const API_BASE = 'http://localhost:8002/api';

    // Fetch payments and approved applications for processing
    const fetchPayments = async () => {
        try {
            setLoading(true);
            
            // Single API call to get all payments
            const paymentsResponse = await fetch(`${API_BASE}/payments`);
            let existingPayments = [];
            if (paymentsResponse.ok) {
                const paymentsData = await paymentsResponse.json();
                existingPayments = paymentsData.data || paymentsData || [];
                
                // Ensure each payment has the correct structure for frontend
                existingPayments = existingPayments.map(payment => ({
                    ...payment,
                    // Map aid_transaction to aidTransaction for consistency
                    aidTransaction: payment.aid_transaction || payment.aidTransaction,
                    // Also keep the original aid_transaction for backward compatibility
                    aid_transaction: payment.aid_transaction,
                    // Ensure recipient_info is available
                    recipient_info: payment.recipient_info
                }));
                

            }
            
            // Single API call to get all applications (we'll filter locally)
            const applicationsResponse = await fetch(`${API_BASE}/aid-applications?per_page=1000`);
            let allApplications = [];
            if (applicationsResponse.ok) {
                const applicationsData = await applicationsResponse.json();
                allApplications = applicationsData.data || applicationsData || [];
            }
            
            // Filter approved applications locally (no API call needed)
            const approvedApplications = allApplications.filter(app => app.status === 'approved');
            
            // Get application IDs that already have payments
            const applicationsWithPayments = existingPayments
                .filter(p => p.application_id || p.aid_application_id) // Check both possible field names
                .map(p => p.application_id || p.aid_application_id);
            
            // Also check by student name and amount as a fallback
            const applicationsWithPaymentsByStudent = existingPayments
                .filter(p => p.aidTransaction?.student_name && p.amount)
                .map(p => ({
                    student_name: p.aidTransaction.student_name,
                    student_number: p.aidTransaction.student_number,
                    amount: p.amount
                }));
            
            // Filter out applications that already have payments
            const pendingApprovedApplications = approvedApplications.filter(app => {
                // Check by application ID first
                if (applicationsWithPayments.includes(app.application_id)) {
                    return false;
                }
                
                // Check by student name and amount as fallback
                const hasPaymentByStudent = applicationsWithPaymentsByStudent.some(payment => 
                    payment.student_name === app.student_name &&
                    payment.student_number === app.student_number &&
                    Math.abs(parseFloat(payment.amount) - parseFloat(app.amount)) < 0.01 // Allow small rounding differences
                );
                
                return !hasPaymentByStudent;
            });
            
            // Convert approved applications to payment-like objects for display
            const applicationPayments = pendingApprovedApplications.map(app => {
                return {
                    payment_id: `app_${app.application_id}`,
                    payment_reference: `APP-${app.application_id.slice(-8).toUpperCase()}`,
                    amount: app.amount,
                    currency: app.currency || 'PHP',
                    payment_method: app.account_type || 'bank_transfer', // Use the actual account_type from the application
                    payment_status: 'pending', // Changed from 'pending_approval' - applications are already approved!
                    scheduled_date: null,
                    processed_date: null,
                    transaction_fee: '0.00',
                    notes: `Approved application - ${app.aid_type}`,
                    created_at: app.approved_at || app.created_at,
                    updated_at: app.updated_at,
                    application_data: app,
                    aidTransaction: {
                        student_name: app.student_name,
                        student_number: app.student_number,
                        aid_type: app.aid_type
                    }
                };
            });
            
            // Combine existing payments with application payments
            const allPayments = [...existingPayments, ...applicationPayments];
            
            // Debug logging to help identify duplicates
            console.log('Debug - Existing payments:', existingPayments.length);
            console.log('Debug - Application payments:', applicationPayments.length);
            console.log('Debug - Applications with payments:', applicationsWithPayments);
            console.log('Debug - Pending applications:', pendingApprovedApplications.length);
            
            // Final check to remove any duplicates by student name and amount
            const uniquePayments = allPayments.filter((payment, index, self) => {
                if (payment.payment_id.startsWith('app_')) {
                    // For application payments, check if there's already a completed payment for this student/amount
                    const hasCompletedPayment = existingPayments.some(existingPayment => 
                        existingPayment.aidTransaction?.student_name === payment.aidTransaction?.student_name &&
                        existingPayment.aidTransaction?.student_number === payment.aidTransaction?.student_number &&
                        Math.abs(parseFloat(existingPayment.amount) - parseFloat(payment.amount)) < 0.01 &&
                        existingPayment.payment_status === 'completed'
                    );
                    return !hasCompletedPayment;
                }
                return true; // Keep all non-application payments
            });
            
            setPayments(uniquePayments);
            setApprovedApplications(approvedApplications);
            setFilteredApplications(approvedApplications);
            
            // Calculate stats locally from the data we already have (no extra API calls needed)
            const calculatedStats = {
                total: uniquePayments.length,
                pending: uniquePayments.filter(p => p.payment_status === 'pending').length,
                processing: uniquePayments.filter(p => p.payment_status === 'processing').length,
                completed: uniquePayments.filter(p => p.payment_status === 'completed').length,
                failed: uniquePayments.filter(p => p.payment_status === 'failed').length,
                scheduled: uniquePayments.filter(p => p.payment_status === 'scheduled').length,
                totalAmount: uniquePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                pendingAmount: uniquePayments
                    .filter(p => p.payment_status === 'pending')
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                completedAmount: uniquePayments
                    .filter(p => p.payment_status === 'completed')
                    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                totalFees: uniquePayments.reduce((sum, p) => sum + parseFloat(p.transaction_fee || 0), 0),
                pendingApplications: pendingApprovedApplications.length
            };
            
            setStats(calculatedStats);
            
        } catch (error) {
            console.error('Error fetching payments and applications:', error);
            showNotification('Failed to fetch payment data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Process payment
    const processPayment = async (paymentId) => {
        try {
            // Check if this is an application payment or existing payment
            if (paymentId.startsWith('app_')) {
                showNotification('Please create a payment first for this approved application', 'info');
                return;
            }

            // Find the payment to check its current status
            const payment = payments.find(p => p.payment_id === paymentId);
            if (payment && payment.payment_status === 'completed') {
                showNotification('This payment has already been completed and cannot be processed again', 'warning');
                return;
            }

            const response = await fetch(`${API_BASE}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_id: paymentId }),
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('Payment processed successfully!', 'success');
                
                // Automatically create distribution log for completed payment
                try {
                    const distributionLogResponse = await fetch(`${API_BASE}/distribution-logs/create-from-payments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            payment_ids: [paymentId],
                            batch_number: `BATCH-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`,
                            processed_by: 'Admin User'
                        })
                    });

                    if (distributionLogResponse.ok) {
                        console.log('Distribution log created automatically for payment:', paymentId);
                    } else {
                        console.warn('Failed to create distribution log for payment:', paymentId);
                    }
                } catch (logError) {
                    console.warn('Error creating distribution log:', logError);
                }
                
                // Refresh the payments data
                await fetchPayments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to process payment');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showNotification(`Failed to process payment: ${error.message}`, 'error');
        }
    };

    // Cancel application
    const cancelApplication = async (applicationId) => {
        try {
            // Remove the 'app_' prefix to get the actual application ID
            const actualApplicationId = applicationId.replace('app_', '');
            
            const response = await fetch(`${API_BASE}/aid-applications/${actualApplicationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: 'cancelled',
                    rejection_reason: 'Application cancelled by administrator'
                }),
            });

            if (response.ok) {
                showNotification('Application cancelled successfully!', 'success');
                await fetchPayments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel application');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            showNotification(`Failed to cancel application: ${error.message}`, 'error');
        }
    };

    // Cancel payment
    const cancelPayment = async (paymentId) => {
        try {
            const response = await fetch(`${API_BASE}/payments/${paymentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    payment_status: 'cancelled',
                    notes: 'Payment cancelled by administrator'
                }),
            });

            if (response.ok) {
                showNotification('Payment cancelled successfully!', 'success');
                await fetchPayments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel payment');
            }
        } catch (error) {
            console.error('Error cancelling payment:', error);
            showNotification(`Failed to cancel payment: ${error.message}`, 'error');
        }
    };

    // Process bulk payments
    const processBulkPayments = async () => {
        if (selectedPayments.length === 0) {
            showNotification('Please select payments to process', 'error');
            return;
        }

        // Filter out application payments and completed payments from bulk processing
        const actualPaymentIds = selectedPayments.filter(id => {
            if (id.startsWith('app_')) return false;
            const payment = payments.find(p => p.payment_id === id);
            return payment && payment.payment_status !== 'completed';
        });
        const applicationPaymentIds = selectedPayments.filter(id => id.startsWith('app_'));
        const completedPaymentIds = selectedPayments.filter(id => {
            if (id.startsWith('app_')) return false;
            const payment = payments.find(p => p.payment_id === id);
            return payment && payment.payment_status === 'completed';
        });

        // Check if any selected payments are already being processed
        const alreadyProcessing = selectedPayments.filter(id => 
            processingApplications.has(id)
        );
        
        if (alreadyProcessing.length > 0) {
            showNotification('Some payments are already being processed. Please wait for them to complete.', 'warning');
            return;
        }

        if (applicationPaymentIds.length > 0) {
            showNotification(`${applicationPaymentIds.length} selected items are approved applications. They are ready to process immediately.`, 'info');
        }

        if (completedPaymentIds.length > 0) {
            showNotification(`${completedPaymentIds.length} selected payments are already completed and cannot be processed again.`, 'warning');
        }

        if (actualPaymentIds.length === 0) {
            showNotification('No payments available for processing', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/payments/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payment_ids: actualPaymentIds }),
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(`Bulk processing completed: ${data.summary.successful} successful, ${data.summary.failed} failed`, 'success');
                setSelectedPayments([]);
                
                // Refresh the payments data
                await fetchPayments();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to process bulk payments');
            }
        } catch (error) {
            console.error('Error processing bulk payments:', error);
            showNotification(`Failed to process bulk payments: ${error.message}`, 'error');
        }
    };

    // Process approved applications directly
    const processApprovedApplications = async (paymentMethod = null, scheduledDate = null) => {
        // Get selected applications from the payments array
        const selectedAppPayments = payments.filter(p => 
            p.payment_id.startsWith('app_') && 
            selectedPayments.includes(p.payment_id)
        );
        
        if (selectedAppPayments.length === 0) {
            showNotification('Please select approved applications to process', 'error');
            return;
        }

        // Check if any selected applications are already being processed
        const alreadyProcessing = selectedAppPayments.filter(p => 
            processingApplications.has(p.payment_id)
        );
        
        if (alreadyProcessing.length > 0) {
            showNotification('Some applications are already being processed. Please wait for them to complete.', 'warning');
            return;
        }

        // Note: We trust the current state from fetchPayments() since it already filters
        // for approved applications that don't have payments yet

        try {
            setLoading(true); // Show loading state
            
            // Mark applications as being processed
            const appIds = selectedAppPayments.map(p => p.payment_id);
            setProcessingApplications(prev => new Set([...prev, ...appIds]));
            
            // First create payments, then process them immediately
            const payload = {
                application_ids: selectedAppPayments.map(p => p.application_data.application_id),
                payment_method: paymentMethod || null,
                scheduled_date: scheduledDate || null
            };
            
            const response = await fetch(`${API_BASE}/payments/create-from-applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                
                // Now process the created payments immediately
                const paymentIds = result.results
                    .filter(r => r.status === 'success')
                    .map(r => r.payment_id);
                
                if (paymentIds.length > 0) {
                    // Process all created payments
                    const processResponse = await fetch(`${API_BASE}/payments/bulk`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            payment_ids: paymentIds,
                            notes: 'Processed immediately after creation'
                        }),
                    });

                    if (processResponse.ok) {
                        showNotification(`Successfully processed ${paymentIds.length} payments for approved applications`, 'success');
                        
                        // Clear selections and close modal
                        setSelectedPayments([]);
                        setShowProcessPaymentModal(false);
                        
                        // Clear processing state
                        setProcessingApplications(new Set());
                        
                        // Fetch fresh data to update stats and get the new completed payments
                        await fetchPayments();
                        
                    } else {
                        showNotification(`Payments created but processing failed`, 'warning');
                        // Still refresh to show created payments
                        await fetchPayments();
                    }
                } else {
                    showNotification(`No payments were created successfully. Please check if the applications are still valid.`, 'warning');
                    // Refresh data to get current state
                    await fetchPayments();
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payments');
            }
        } catch (error) {
            console.error('Error processing applications:', error);
            showNotification(`Failed to process applications: ${error.message}`, 'error');
        } finally {
            setLoading(false); // Hide loading state
            // Clear processing state in case of error
            setProcessingApplications(new Set());
        }
    };

    // Initialize data
    useEffect(() => {
        fetchPayments();
    }, []);

    const paymentMethods = [
        // Bank account types
        'savings', 'checking', 'current',
        // Digital wallets
        'gcash', 'maya', 'paymaya', 'coins_ph', 'grabpay', 'shopee_pay', 'other_digital_wallet',
        // Traditional payment methods
        'direct_deposit', 'bank_transfer', 'check', 'cash', 'mobile_money'
    ];
    const paymentStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'scheduled'];

    // Format payment method for display
    const formatPaymentMethod = (method) => {
        if (!method) return 'N/A';
        
        // Handle account types from applications
        const accountTypeMap = {
            'savings': 'Savings Account',
            'checking': 'Checking Account', 
            'current': 'Current Account',
            'gcash': 'GCash',
            'maya': 'Maya',
            'paymaya': 'PayMaya',
            'coins_ph': 'Coins.ph',
            'grabpay': 'GrabPay',
            'shopee_pay': 'ShopeePay',
            'other_digital_wallet': 'Digital Wallet'
        };
        
        // Check if it's an account type first
        if (accountTypeMap[method]) {
            return accountTypeMap[method];
        }
        
        // Otherwise format as payment method
        return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.aid_transaction?.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.aidTransaction?.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.recipient_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.aid_transaction?.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.aidTransaction?.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.recipient_info?.student_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
        const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
        
        return matchesSearch && matchesStatus && matchesMethod;
    });

    // Apply pagination to filtered payments
    const paginatedPayments = filteredPayments.slice((currentPage - 1) * perPage, currentPage * perPage);
    
    // Update pagination state
    useEffect(() => {
        setTotalPages(Math.ceil(filteredPayments.length / perPage));
        setCurrentPage(1); // Reset to first page when filters change
    }, [filteredPayments.length, perPage]);

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const pendingPayments = filteredPayments.filter(p => p.payment_status === 'pending').length;
    const completedPayments = filteredPayments.filter(p => p.payment_status === 'completed').length;
    const totalFees = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.transaction_fee || 0), 0);

    const handlePaymentSelection = (paymentId) => {
        setSelectedPayments(prev => 
            prev.includes(paymentId) 
                ? prev.filter(id => id !== paymentId)
                : [...prev, paymentId]
        );
    };

    const handleApplicationSelection = (applicationId) => {
        setSelectedApplications(prev => 
            prev.includes(applicationId) 
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const handleSelectAllPayments = () => {
        if (selectedPayments.length === filteredPayments.length) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(filteredPayments.map(p => p.payment_id));
        }
    };

    const handleSelectAllApplications = () => {
        if (selectedApplications.length === filteredApplications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(filteredApplications.map(a => a.application_id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : notification.type === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                }`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : notification.type === 'error' ? (
                            <AlertCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <CreditCard className="w-8 h-8 text-orange-500 mr-3" />
                        Payment Processing
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Process approved applications and manage educational aid payments
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <button 
                        onClick={() => setShowApplicationsModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <FileText className="w-5 h-5" />
                        <span>Approved Applications</span>
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Payment</span>
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₱{stats.totalAmount?.toLocaleString() || '0'}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completed}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pendingApplications}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Applications</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Payment Records & Approved Applications
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Process existing payments and create payments for approved applications
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by student name, ID, or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="pending">Ready to Process</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="all">All Statuses</option>
                        </select>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="all">All Methods</option>
                            {paymentMethods.map(method => (
                                <option key={method} value={method}>
                                    {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Unified Payment Records Table */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    {/* Payments Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Payment Records & Approved Applications</h2>
                                                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                      {filteredPayments.length} records found ({payments.filter(p => p.payment_status !== 'pending').length} payments, {payments.filter(p => p.payment_status === 'pending').length} ready to process)
                                      <br />
                                      <span className="text-xs">
                                          💡 Approved applications can be processed directly. Use the status filter to view different payment statuses.
                                      </span>
                                  </p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                {selectedPayments.length > 0 ? (
                                    <>
                                        {selectedPayments.some(id => !id.startsWith('app_')) && (
                                            <button
                                                onClick={processBulkPayments}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                                            >
                                                <Zap className="w-4 h-4" />
                                                <span>Process Selected Payments</span>
                                            </button>
                                        )}
                                        {selectedPayments.some(id => id.startsWith('app_')) && (
                                            <button
                                                onClick={() => setShowProcessPaymentModal(true)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                                            >
                                                <Play className="w-4 h-4" />
                                                <span>Process Selected Applications</span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Please select approved applications to process</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Legend */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Status Legend:</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Ready to Process
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Processing
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Completed
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Failed
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Cancelled
                            </span>
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                                            onChange={handleSelectAllPayments}
                                            className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {paginatedPayments.map((payment) => (
                                    <tr key={payment.payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedPayments.includes(payment.payment_id)}
                                                onChange={() => handlePaymentSelection(payment.payment_id)}
                                                disabled={payment.payment_status === 'completed' || 
                                                         payment.payment_status === 'cancelled' || 
                                                         processingApplications.has(payment.payment_id)}
                                                className={`rounded border-slate-300 text-orange-500 focus:ring-orange-500 ${
                                                    payment.payment_status === 'completed' || 
                                                    payment.payment_status === 'cancelled' || 
                                                    processingApplications.has(payment.payment_id) ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                title={payment.payment_status === 'completed' ? 'Payment already completed' : 
                                                       payment.payment_status === 'cancelled' ? 'Payment cancelled' : 
                                                       processingApplications.has(payment.payment_id) ? 'Processing in progress...' : 'Select payment'}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {payment.aid_transaction?.student_name || 
                                                     payment.aidTransaction?.student_name || 
                                                     payment.recipient_info?.name || 
                                                     'N/A'}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {payment.aid_transaction?.student_number || 
                                                     payment.aidTransaction?.student_number || 
                                                     payment.recipient_info?.student_number || 
                                                     'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                ₱{parseFloat(payment.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {payment.currency}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                                {formatPaymentMethod(payment.payment_method)}
                                            </span>
                                        </td>
                                                                                <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                processingApplications.has(payment.payment_id) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse' :
                                                payment.payment_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                payment.payment_status === 'pending' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                payment.payment_status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                payment.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                payment.payment_status === 'cancelled' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                            }`}>
                                                {processingApplications.has(payment.payment_id) ? '🔄 Processing...' :
                                                 payment.payment_status === 'completed' ? '✓ Completed' :
                                                 payment.payment_status === 'pending' ? 'Ready to Process' :
                                                 payment.payment_status === 'cancelled' ? 'Cancelled' :
                                                 payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-slate-900 dark:text-white font-mono">
                                                {payment.payment_reference}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                {payment.payment_id.startsWith('app_') ? (
                                                    // Actions for approved applications (not yet payments)
                                                    <>
                                                        {/* View Application Details */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowViewApplicationModal(true);
                                                            }}
                                                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                                                            title="View Application Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {/* Process Application */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayments([payment.payment_id]);
                                                                setShowProcessPaymentModal(true);
                                                            }}
                                                            disabled={processingApplications.has(payment.payment_id)}
                                                            className={`${
                                                                processingApplications.has(payment.payment_id) 
                                                                    ? 'text-slate-400 cursor-not-allowed' 
                                                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                            }`}
                                                            title={processingApplications.has(payment.payment_id) ? 'Processing in progress...' : 'Process Application'}
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {/* Cancel Application */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowCancelApplicationModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Cancel Application"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    // Actions for existing payments
                                                    <>
                                                        {/* View/Details Button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayment(payment);
                                                                setShowViewModal(true);
                                                            }}
                                                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {/* Process Button - only for pending payments */}
                                                        {payment.payment_status === 'pending' && (
                                                            <button
                                                                onClick={() => processPayment(payment.payment_id)}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                title="Process Payment"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        
                                                        {/* Cancel Button - only for pending/scheduled payments */}
                                                        {(payment.payment_status === 'pending' || payment.payment_status === 'scheduled') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPayment(payment);
                                                                    setShowCancelModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Cancel Payment"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        
                                                        {/* Edit Button - only for pending/scheduled payments */}
                                                        {(payment.payment_status === 'pending' || payment.payment_status === 'scheduled') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPayment(payment);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                title="Edit Payment"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* No records message */}
                    {filteredPayments.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="text-slate-400 dark:text-slate-500 mb-4">
                                <CreditCard className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                No payment records found
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {statusFilter === 'pending' 
                                    ? "No pending payments or approved applications found. Try changing the status filter to view other payment statuses."
                                    : "No payment records match your current filters. Try adjusting your search or filter criteria."
                                }
                            </p>
                            {statusFilter === 'pending' && (
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    View All Payments
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredPayments.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                            {/* Pagination Info */}
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filteredPayments.length)} of {filteredPayments.length} payments
                            </div>
                            
                            {/* Per Page Selector */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(parseInt(e.target.value))}
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm text-slate-600 dark:text-slate-400">per page</span>
                            </div>
                            
                            {/* Page Navigation */}
                            <div className="flex items-center space-x-2">
                                {/* Previous Page */}
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-600"
                                >
                                    Previous
                                </button>
                                
                                {/* Page Numbers */}
                                <div className="flex items-center space-x-1">
                                    {/* First page */}
                                    {currentPage > 3 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                                            >
                                                1
                                            </button>
                                            {currentPage > 4 && (
                                                <span className="px-2 text-slate-400">...</span>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Current page range */}
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        const page = Math.max(1, currentPage - 1) + i;
                                        if (page > totalPages) return null;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                                                    page === currentPage
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                    
                                    {/* Last page */}
                                    {currentPage < totalPages - 2 && (
                                        <>
                                            {currentPage < totalPages - 3 && (
                                                <span className="px-2 text-slate-400">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                {/* Next Page */}
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-600"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            {/* Process Applications Modal */}
            {showProcessPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Process Selected Applications
                        </h3>
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                This will create payment records and process them immediately, completing the applications.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Payment Method (Optional)
                                </label>
                                <select 
                                    id="paymentMethod"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Use default from application</option>
                                    {paymentMethods.map(method => (
                                        <option key={method} value={method}>
                                            {method.replace('_', ' ', 'g').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Scheduled Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="scheduledDate"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowProcessPaymentModal(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const paymentMethod = document.getElementById('paymentMethod').value || null;
                                    const scheduledDate = document.getElementById('scheduledDate').value || null;
                                    processApprovedApplications(paymentMethod, scheduledDate);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                            >
                                Process Applications
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Payment Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Add New Payment
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            This feature will be implemented to manually create payments.
                        </p>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Payment Modal Placeholder */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Edit Payment
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            This feature will be implemented to edit payment details.
                        </p>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal Placeholder */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Delete Payment
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            This feature will be implemented to delete payments.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* View Payment Details Modal */}
            {showViewModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Payment Details
                            </h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Basic Payment Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Payment Reference
                                    </label>
                                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                                        {selectedPayment.payment_reference}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        selectedPayment.payment_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        selectedPayment.payment_status === 'pending' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        selectedPayment.payment_status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        selectedPayment.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        selectedPayment.payment_status === 'cancelled' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                    }`}>
                                        {selectedPayment.payment_status === 'completed' ? '✓ Completed' :
                                         selectedPayment.payment_status === 'pending' ? 'Ready to Process' :
                                         selectedPayment.payment_status === 'cancelled' ? 'Cancelled' :
                                         selectedPayment.payment_status?.charAt(0).toUpperCase() + selectedPayment.payment_status?.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Student Information
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Name:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.aid_transaction?.student_name || 
                                                 selectedPayment.aidTransaction?.student_name || 
                                                 selectedPayment.recipient_info?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Student Number:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.aid_transaction?.student_number || 
                                                 selectedPayment.aidTransaction?.student_number || 
                                                 selectedPayment.recipient_info?.student_number || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Payment Details
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                ₱{parseFloat(selectedPayment.amount || 0).toLocaleString()} {selectedPayment.currency}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Method:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {formatPaymentMethod(selectedPayment.payment_method)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Transaction Fee:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                ₱{parseFloat(selectedPayment.transaction_fee || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                ₱{(parseFloat(selectedPayment.amount || 0) + parseFloat(selectedPayment.transaction_fee || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            {selectedPayment.bank_details && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Bank Details
                                    </label>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Bank Name:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.bank_details?.bank_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Number:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2 font-mono">
                                                    {selectedPayment.bank_details?.account_number || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Holder:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.bank_details?.account_holder_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.bank_details?.account_type ? 
                                                        selectedPayment.bank_details.account_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                                                </span>
                                            </div>
                                            {selectedPayment.bank_details?.routing_number && (
                                                <div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Routing Number:</span>
                                                    <span className="text-sm text-slate-900 dark:text-white ml-2 font-mono">
                                                        {selectedPayment.bank_details.routing_number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recipient Information */}
                            {selectedPayment.recipient_info && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Recipient Information
                                    </label>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Email:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.recipient_info?.email || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.recipient_info?.phone || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Guardian Name:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.recipient_info?.guardian_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Guardian Contact:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.recipient_info?.guardian_contact || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Important Dates
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {new Date(selectedPayment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Scheduled:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.scheduled_date ? new Date(selectedPayment.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                                            </span>
                                        </div>
                                        {selectedPayment.processed_date && (
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Processed:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {new Date(selectedPayment.processed_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedPayment.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Notes
                                    </label>
                                    <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        {selectedPayment.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Application Details Modal */}
            {showViewApplicationModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Application Details
                            </h3>
                            <button
                                onClick={() => setShowViewApplicationModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Basic Application Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Application Reference
                                    </label>
                                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                                        {selectedPayment.payment_reference}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Ready to Process
                                    </span>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Student Information
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Name:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.aidTransaction?.student_name || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Student Number:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.aidTransaction?.student_number || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* School Information */}
                            {selectedPayment.application_data?.school_name && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        School Information
                                    </label>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">School Name:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.application_data?.school_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Campus:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.application_data?.campus || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Application Details */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Application Details
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                ₱{parseFloat(selectedPayment.amount || 0).toLocaleString()} {selectedPayment.currency}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Aid Type:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {selectedPayment.aidTransaction?.aid_type || 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Method:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {formatPaymentMethod(selectedPayment.payment_method)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created:</span>
                                            <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                {new Date(selectedPayment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            {selectedPayment.application_data?.bank_name && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Bank Details
                                    </label>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Bank Name:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.application_data?.bank_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Number:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2 font-mono">
                                                    {selectedPayment.application_data?.account_number || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Holder:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.application_data?.account_holder_name || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type:</span>
                                                <span className="text-sm text-slate-900 dark:text-white ml-2">
                                                    {selectedPayment.application_data?.account_type ? 
                                                        selectedPayment.application_data.account_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                                                </span>
                                            </div>
                                            {selectedPayment.application_data?.routing_number && (
                                                <div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Routing Number:</span>
                                                    <span className="text-sm text-slate-900 dark:text-white ml-2 font-mono">
                                                        {selectedPayment.application_data.routing_number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedPayment.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Notes
                                    </label>
                                    <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        {selectedPayment.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowViewApplicationModal(false)}
                                className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Application Confirmation Modal */}
            {showCancelApplicationModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Cancel Application
                            </h3>
                            <button
                                onClick={() => setShowCancelApplicationModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Are you sure you want to cancel this approved application?
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Application:</strong> {selectedPayment.payment_reference}
                                </p>
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Student:</strong> {selectedPayment.aidTransaction?.student_name || 'N/A'}
                                </p>
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Amount:</strong> ₱{parseFloat(selectedPayment.amount || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCancelApplicationModal(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                Keep Application
                            </button>
                            <button
                                onClick={() => {
                                    cancelApplication(selectedPayment.payment_id);
                                    setShowCancelApplicationModal(false);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                Cancel Application
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Payment Confirmation Modal */}
            {showCancelModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Cancel Payment
                            </h3>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Are you sure you want to cancel this payment?
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Payment:</strong> {selectedPayment.payment_reference}
                                </p>
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Student:</strong> {selectedPayment.aid_transaction?.student_name || 
                                                              selectedPayment.aidTransaction?.student_name || 
                                                              selectedPayment.recipient_info?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-slate-900 dark:text-white">
                                    <strong>Amount:</strong> ₱{parseFloat(selectedPayment.amount || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                Keep Payment
                            </button>
                            <button
                                onClick={() => {
                                    cancelPayment(selectedPayment.payment_id);
                                    setShowCancelModal(false);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                Cancel Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentProcessing; 