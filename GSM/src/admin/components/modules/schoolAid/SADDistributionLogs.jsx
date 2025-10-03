import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, HandCoins, School, User, TrendingUp, Plus, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

function SADDistributionLogs({ onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [aidTypeFilter, setAidTypeFilter] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [distributionLogs, setDistributionLogs] = useState([]);
    const [stats, setStats] = useState({
        total_logs: 0,
        completed_logs: 0,
        pending_logs: 0,
        total_amount: 0,
        unique_students: 0,
        unique_schools: 0
    });
    const [showCreateFromPaymentsModal, setShowCreateFromPaymentsModal] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [availablePayments, setAvailablePayments] = useState([]);
    const [batchNumber, setBatchNumber] = useState('');
    const [processedBy, setProcessedBy] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // API base URL
    const API_BASE = 'http://localhost:8002/api';

    // Fetch distribution logs from API
    const fetchDistributionLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: itemsPerPage,
                search: searchTerm,
                aid_type: aidTypeFilter !== 'all' ? aidTypeFilter : '',
                school: schoolFilter !== 'all' ? schoolFilter : '',
                status: statusFilter !== 'all' ? statusFilter : '',
            });

            const response = await fetch(`${API_BASE}/distribution-logs?${params}`);
            if (response.ok) {
                const data = await response.json();
                setDistributionLogs(data.data || []);
            } else {
                console.error('Failed to fetch distribution logs');
            }
        } catch (error) {
            console.error('Error fetching distribution logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/distribution-logs/stats/overview`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch available payments for creating logs
    const fetchAvailablePayments = async () => {
        try {
            const response = await fetch(`${API_BASE}/payments?status=completed&per_page=100`);
            if (response.ok) {
                const data = await response.json();
                setAvailablePayments(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    // Create distribution logs from payments
    const createLogsFromPayments = async () => {
        try {
            const response = await fetch(`${API_BASE}/distribution-logs/create-from-payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_ids: selectedPayments,
                    batch_number: batchNumber || `BATCH-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`,
                    processed_by: processedBy || 'Admin User'
                })
            });

            if (response.ok) {
                const data = await response.json();
                showNotification('Distribution logs created successfully!', 'success');
                setShowCreateFromPaymentsModal(false);
                setSelectedPayments([]);
                setBatchNumber('');
                setProcessedBy('');
                fetchDistributionLogs();
                fetchStats();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to create distribution logs', 'error');
            }
        } catch (error) {
            console.error('Error creating distribution logs:', error);
            showNotification('Error creating distribution logs', 'error');
        }
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    // Load data on component mount and when filters change
    useEffect(() => {
        fetchDistributionLogs();
        fetchStats();
    }, [currentPage, itemsPerPage, searchTerm, aidTypeFilter, schoolFilter, statusFilter]);

    // Load available payments when modal opens
    useEffect(() => {
        if (showCreateFromPaymentsModal) {
            fetchAvailablePayments();
        }
    }, [showCreateFromPaymentsModal]);

    const schools = [...new Set(distributionLogs.map(log => log.school_name))];
    const aidTypes = [...new Set(distributionLogs.map(log => log.aid_type))];
    const statuses = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'];

    // Get status icon and color
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'in_progress':
                return <RefreshCw className="w-4 h-4 text-blue-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-gray-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const formatAmount = (amount) => {
        return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-PH');
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <HandCoins className="w-8 h-8 text-orange-500 mr-3" />
                        Aid Distribution Logs
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Track and monitor all distributed educational aid
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <button 
                        onClick={() => setShowCreateFromPaymentsModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create from Payments</span>
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Export Logs</span>
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <HandCoins className="w-8 h-8 text-orange-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_logs || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Distributions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatAmount(stats.total_amount || 0)}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <User className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.unique_students || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Beneficiaries</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <School className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.unique_schools || 0}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Schools Served</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, school, or batch..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={aidTypeFilter}
                            onChange={(e) => setAidTypeFilter(e.target.value)}
                        >
                            <option value="all">All Aid Types</option>
                            {aidTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                        >
                            <option value="all">All Schools</option>
                            {schools.map(school => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Distribution Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-600 dark:text-slate-400">Loading distribution logs...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Student</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">School</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Aid Type</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Date Processed</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Batch</th>
                                    <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Processed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {distributionLogs.map((log) => (
                                    <tr key={log.log_id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">{log.student_name}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{log.student_number || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <School className="w-4 h-4 text-slate-400 mr-2" />
                                                <span className="text-slate-600 dark:text-slate-400">{log.school_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {log.aid_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-semibold text-green-600 dark:text-green-400">{formatAmount(log.amount)}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(log.distribution_status)}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.distribution_status)}`}>
                                                    {log.distribution_status.charAt(0).toUpperCase() + log.distribution_status.slice(1).replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {formatDate(log.processed_date)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                {log.batch_number || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">{log.processed_by || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && distributionLogs.length === 0 && (
                    <div className="text-center py-12">
                        <HandCoins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">No distribution logs found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Create from Payments Modal */}
            {showCreateFromPaymentsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create Distribution Logs from Payments</h3>
                            <button
                                onClick={() => setShowCreateFromPaymentsModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Batch Number
                                    </label>
                                    <input
                                        type="text"
                                        value={batchNumber}
                                        onChange={(e) => setBatchNumber(e.target.value)}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Processed By
                                    </label>
                                    <input
                                        type="text"
                                        value={processedBy}
                                        onChange={(e) => setProcessedBy(e.target.value)}
                                        placeholder="Admin User"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Select Completed Payments</h4>
                            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                                {availablePayments.map((payment) => (
                                    <div key={payment.payment_id} className="flex items-center p-3 border-b border-slate-100 dark:border-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedPayments.includes(payment.payment_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPayments([...selectedPayments, payment.payment_id]);
                                                } else {
                                                    setSelectedPayments(selectedPayments.filter(id => id !== payment.payment_id));
                                                }
                                            }}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">
                                                        {payment.aidTransaction?.student_name || 'Unknown Student'}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {payment.school_name} • {payment.payment_method}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600 dark:text-green-400">
                                                        {formatAmount(payment.amount)}
                                                    </p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {payment.payment_reference || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateFromPaymentsModal(false)}
                                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createLogsFromPayments}
                                disabled={selectedPayments.length === 0}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create {selectedPayments.length} Distribution Log{selectedPayments.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                    notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default SADDistributionLogs; 