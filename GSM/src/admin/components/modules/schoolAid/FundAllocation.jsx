import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, DollarSign, School, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

function FundAllocation({ onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [programFilter, setProgramFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    // Mock data - replace with API calls
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setAllocations([
                {
                    id: 1,
                    school: 'University of the Philippines - Diliman',
                    program: 'Financial Need Grant',
                    totalAmount: 1000000.00,
                    allocatedAmount: 250000.00,
                    remainingAmount: 750000.00,
                    currency: 'PHP',
                    period: 'Annual',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    status: 'active',
                    utilization: 25.0
                },
                {
                    id: 2,
                    school: 'Ateneo de Manila University',
                    program: 'Financial Need Grant',
                    totalAmount: 800000.00,
                    allocatedAmount: 150000.00,
                    remainingAmount: 650000.00,
                    currency: 'PHP',
                    period: 'Annual',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    status: 'active',
                    utilization: 18.75
                },
                {
                    id: 3,
                    school: 'De La Salle University',
                    program: 'Student Loan Program',
                    totalAmount: 1500000.00,
                    allocatedAmount: 300000.00,
                    remainingAmount: 1200000.00,
                    currency: 'PHP',
                    period: 'Annual',
                    startDate: '2024-01-01',
                    endDate: '2028-12-31',
                    status: 'active',
                    utilization: 20.0
                },
                {
                    id: 4,
                    school: 'University of Santo Tomas',
                    program: 'Research Stipend',
                    totalAmount: 600000.00,
                    allocatedAmount: 100000.00,
                    remainingAmount: 500000.00,
                    currency: 'PHP',
                    period: 'Annual',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    status: 'active',
                    utilization: 16.67
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const schools = ['University of the Philippines - Diliman', 'Ateneo de Manila University', 'De La Salle University', 'University of Santo Tomas'];
    const programs = ['Financial Need Grant', 'Student Loan Program', 'Research Stipend', 'Emergency Financial Aid'];

    const filteredAllocations = allocations.filter(allocation => {
        const matchesSearch = allocation.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            allocation.program.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSchool = schoolFilter === 'all' || allocation.school === schoolFilter;
        const matchesProgram = programFilter === 'all' || allocation.program === programFilter;
        const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
        
        return matchesSearch && matchesSchool && matchesProgram && matchesStatus;
    });

    const totalBudget = allocations.reduce((sum, allocation) => sum + allocation.totalAmount, 0);
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocatedAmount, 0);
    const totalRemaining = allocations.reduce((sum, allocation) => sum + allocation.remainingAmount, 0);
    const averageUtilization = allocations.length > 0 ? allocations.reduce((sum, allocation) => sum + allocation.utilization, 0) / allocations.length : 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'exhausted':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'expired':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getUtilizationColor = (utilization) => {
        if (utilization >= 80) return 'text-red-600 dark:text-red-400';
        if (utilization >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const handleAddAllocation = (newAllocation) => {
        const newId = Math.max(...allocations.map(allocation => allocation.id)) + 1;
        const allocationWithId = { ...newAllocation, id: newId };
        setAllocations(prev => [...prev, allocationWithId]);
        setShowAddModal(false);
        showNotification('Fund allocation added successfully!', 'success');
    };

    const handleEditAllocation = (editedAllocation) => {
        setAllocations(prev => prev.map(allocation => 
            allocation.id === editedAllocation.id ? editedAllocation : allocation
        ));
        setShowEditModal(false);
        setSelectedAllocation(null);
        showNotification('Fund allocation updated successfully!', 'success');
    };

    const handleDeleteAllocation = (allocationId) => {
        setAllocations(prev => prev.filter(allocation => allocation.id !== allocationId));
        setShowDeleteModal(false);
        setSelectedAllocation(null);
        showNotification('Fund allocation deleted successfully!', 'success');
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
                        : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
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
                        <DollarSign className="w-8 h-8 text-orange-500 mr-3" />
                        Fund Allocation Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage and monitor fund allocations for educational programs
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Allocation</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budget</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₱{totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg shadow-sm">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Allocated</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₱{totalAllocated.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg shadow-sm">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Remaining</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₱{totalRemaining.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg shadow-sm">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Utilization</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{averageUtilization.toFixed(1)}%</p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg shadow-sm">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by school or program..."
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
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                        >
                            <option value="all">All Programs</option>
                            {programs.map(program => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="exhausted">Exhausted</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Allocations Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">School</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Program</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Total Budget</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Allocated</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Remaining</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Utilization</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Period</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllocations.map((allocation) => (
                                <tr key={allocation.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <School className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="text-slate-600 dark:text-slate-400">{allocation.school}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {allocation.program}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">
                                        ₱{allocation.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-green-600 dark:text-green-400">
                                        ₱{allocation.allocatedAmount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400">
                                        ₱{allocation.remainingAmount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`font-semibold ${getUtilizationColor(allocation.utilization)}`}>
                                            {allocation.utilization.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {allocation.period}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedAllocation(allocation);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedAllocation(allocation);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAllocations.length === 0 && (
                    <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">No fund allocations found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedAllocation && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Confirm Deletion</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to delete the fund allocation for <strong>{selectedAllocation.school}</strong> - <strong>{selectedAllocation.program}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteAllocation(selectedAllocation.id)}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FundAllocation; 