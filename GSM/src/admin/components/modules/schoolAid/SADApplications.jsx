import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Plus, Download, School, Calendar, User, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import ApplicationModal from './components/ApplicationModal';
import StatusUpdateModal from './components/StatusUpdateModal';
import ApplicationFormModal from './components/ApplicationFormModal';
import { getScholarshipServiceUrl, API_CONFIG } from '../../../../config/api';

function SADApplications({ onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [schoolFilter, setSchoolFilter] = useState('all');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [applications, setApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]); // For status cards
    const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [paginationLoading, setPaginationLoading] = useState(false);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);

    const schools = ['Caloocan High School', 'Bagong Silang Elementary', 'Grace Park High School', 'Camarin Elementary'];
    const aidTypes = ['Educational Supplies', 'Transportation Aid', 'Meal Allowance', 'Uniform Assistance'];

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    // Helper function to reload all applications for status cards
    const reloadAllApplications = async () => {
        try {
            // Get all applications without pagination limit
            const allResponse = await schoolAidService.getApplications({ perPage: 1000 });
            const applicationsData = allResponse.data || allResponse;
            const allFormattedApplications = applicationsData.map(app => schoolAidService.formatApplicationForFrontend(app));
            setAllApplications(allFormattedApplications);
            
            // Update statistics from the new data
            const stats = {
                all: allFormattedApplications.length,
                pending: allFormattedApplications.filter(app => app.status === 'pending').length,
                approved: allFormattedApplications.filter(app => app.status === 'approved').length,
                rejected: allFormattedApplications.filter(app => app.status === 'rejected').length
            };
            setStatusCounts(stats);
            
            // Reload filtered applications for table display
            loadApplications();
        } catch (error) {
            console.error('Failed to reload all applications:', error);
        }
    };

    // Load filtered applications from local data (no API call needed)
    const loadApplications = () => {
        try {
            setPaginationLoading(true);
            
            // Filter applications from local data
            let filteredData = allApplications.filter(app => {
                const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    app.school.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
                const matchesSchool = schoolFilter === 'all' || app.school === schoolFilter;
                
                return matchesSearch && matchesStatus && matchesSchool;
            });
            
            // Update total items for pagination
            setTotalItems(filteredData.length);
            setTotalPages(Math.ceil(filteredData.length / perPage));
            
            // Apply pagination to filtered data
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedData = filteredData.slice(startIndex, endIndex);
            
            setApplications(paginatedData);
            
        } catch (error) {
            console.error('Failed to filter applications:', error);
            showNotification('Failed to filter applications', 'error');
        } finally {
            setPaginationLoading(false);
        }
    };

    // Load all applications for status cards on component mount
    useEffect(() => {
        const loadAllApplications = async () => {
            try {
                setLoading(true);
                // Single API call to get all data at once
                const response = await schoolAidService.getApplications({ perPage: 1000 });
                const applicationsData = response.data || response;
                const formattedApplications = applicationsData.map(app => schoolAidService.formatApplicationForFrontend(app));
                
                // Set all applications for status cards
                setAllApplications(formattedApplications);
                
                // Set initial table data (first page)
                const initialPageData = formattedApplications.slice(0, perPage);
                setApplications(initialPageData);
                
                // Calculate pagination from the data we already have
                setTotalItems(formattedApplications.length);
                setTotalPages(Math.ceil(formattedApplications.length / perPage));
                setCurrentPage(1);
                
                // Calculate statistics from the data we already have (no need for separate API call)
                const stats = {
                    all: formattedApplications.length,
                    pending: formattedApplications.filter(app => app.status === 'pending').length,
                    approved: formattedApplications.filter(app => app.status === 'approved').length,
                    rejected: formattedApplications.filter(app => app.status === 'rejected').length
                };
                setStatusCounts(stats);
                
            } catch (error) {
                console.error('Failed to load applications:', error);
                showNotification('Failed to load applications', 'error');
            } finally {
                setLoading(false);
            }
        };
        
        loadAllApplications();
    }, []);

    // Load filtered applications when filters change
    useEffect(() => {
        if (allApplications.length > 0) { // Only run after initial load
            setCurrentPage(1); // Reset to first page when filters change
            loadApplications();
        }
    }, [statusFilter, schoolFilter, searchTerm]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll to top of table for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle per page change
    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to first page
        // Scroll to top of table for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, schoolFilter, searchTerm]);

    // Reload applications when pagination changes
    useEffect(() => {
        if (allApplications.length > 0) {
            loadApplications();
        }
    }, [currentPage, perPage]);

    // Reset loading states when component unmounts
    useEffect(() => {
        return () => {
            setPaginationLoading(false);
            setIsLoadingApplications(false);
        };
    }, []);

    // Manual reset function for loading states
    const resetLoadingStates = () => {
        setPaginationLoading(false);
        setIsLoadingApplications(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus, remarks = '') => {
        try {
            console.log('Starting status update:', { applicationId, newStatus, remarks });
            
            const statusData = schoolAidService.formatStatusUpdateForAPI(newStatus, remarks, 'admin_user');
            console.log('Formatted status data:', statusData);
            
            await schoolAidService.updateApplicationStatus(applicationId, statusData);
            console.log('API call successful');
            
            // Get the old status before updating for accurate count updates
            const oldApplication = allApplications.find(app => app.id === applicationId);
            const oldStatus = oldApplication ? oldApplication.status : 'pending';
            console.log('Status update:', { oldStatus, newStatus });
            
            // Check if the application is currently visible in the table
            const isCurrentlyVisible = applications.some(app => app.id === applicationId);
            const currentPageInfo = `Page ${currentPage} of ${totalPages}`;
            
            // Check if the application matches current search filters
            const matchesSearch = searchTerm === '' || 
                oldApplication?.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                oldApplication?.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                oldApplication?.school.toLowerCase().includes(searchTerm.toLowerCase());
            
            console.log('Application visibility:', { 
                isCurrentlyVisible, 
                currentFilters: { statusFilter, schoolFilter, searchTerm },
                pagination: currentPageInfo,
                matchesSearch
            });
            
            // Immediately update local state for instant UI feedback
            setAllApplications(prevAll => {
                const updated = prevAll.map(app => 
                    app.id === applicationId 
                        ? { ...app, status: newStatus }
                        : app
                );
                console.log('Updated allApplications:', updated.find(app => app.id === applicationId));
                return updated;
            });
            
            // Update applications table immediately
            setApplications(prev => {
                const updated = prev.map(app => 
                    app.id === applicationId 
                        ? { ...app, status: newStatus }
                        : app
                );
                console.log('Updated applications table:', updated.find(app => app.id === applicationId));
                return updated;
            });
            
            // Update status counts immediately
            setStatusCounts(prev => {
                const newCounts = { ...prev };
                
                // Decrease count for old status
                if (oldStatus && prev[oldStatus] > 0) {
                    newCounts[oldStatus]--;
                }
                
                // Increase count for new status
                if (newStatus === 'rejected') {
                    newCounts.rejected++;
                } else if (newStatus === 'approved') {
                    newCounts.approved++;
                }
                
                console.log('Updated status counts:', newCounts);
                return newCounts;
            });
            
            // Reset status filter to 'all' so users can see all applications including the updated one
            setStatusFilter('all');
            
            // Also clear search term if the application doesn't match current search
            if (!matchesSearch && searchTerm !== '') {
                setSearchTerm('');
            }
            
            // Reset to first page to ensure the updated application is visible
            if (currentPage !== 1) {
                setCurrentPage(1);
            }
            
            setShowStatusModal(false);
            setSelectedApplication(null);
            
            // Provide more informative feedback
            let visibilityMessage = '';
            if (isCurrentlyVisible) {
                visibilityMessage = 'The application is still visible in the current view.';
            } else if (!matchesSearch && searchTerm !== '') {
                visibilityMessage = 'The application may not match your current search. Search has been cleared to show all applications.';
            } else {
                visibilityMessage = 'The application may have been filtered out. Filters have been reset to show all applications.';
            }
            
            const paginationMessage = totalPages > 1 ? ` (Currently on ${currentPageInfo})` : '';
            
            showNotification(`Application ${newStatus} successfully! ${visibilityMessage}${paginationMessage}`, 'success');
            
            console.log('Status update completed successfully');
        } catch (error) {
            console.error('Failed to update status:', error);
            showNotification(`Failed to ${newStatus} application`, 'error');
        }
    };

    const handleAddApplication = async (newApplication) => {
        try {
            const apiData = schoolAidService.formatApplicationForAPI(newApplication);
            const response = await schoolAidService.createApplication(apiData);
            
            // Get the created application from response and format it
            const createdApp = schoolAidService.formatApplicationForFrontend(response.data || response);
            
            // Immediately update local state for instant UI feedback
            setAllApplications(prev => [createdApp, ...prev]);
            
            // Update applications table immediately if it matches current filters
            const matchesCurrentFilters = 
                (statusFilter === 'all' || createdApp.status === statusFilter) &&
                (schoolFilter === 'all' || createdApp.school === schoolFilter) &&
                (searchTerm === '' || 
                    createdApp.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    createdApp.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    createdApp.school.toLowerCase().includes(searchTerm.toLowerCase())
                );
            
            if (matchesCurrentFilters) {
                setApplications(prev => [createdApp, ...prev.slice(0, -1)]);
            }
            
            // Update status counts immediately
            setStatusCounts(prev => ({
                ...prev,
                all: prev.all + 1,
                pending: prev.pending + 1
            }));
            
            // Reset filters to show all applications including the new one
            setStatusFilter('all');
            setSchoolFilter('all');
            setSearchTerm('');
            
            setShowAddModal(false);
            showNotification('Application added successfully! Filters reset to show all applications.', 'success');
        } catch (error) {
            console.error('Failed to add application:', error);
            showNotification('Failed to add application', 'error');
        }
    };

    const handleEditApplication = async (editedApplication) => {
        try {
            const apiData = schoolAidService.formatApplicationForAPI(editedApplication);
            const response = await schoolAidService.updateApplication(editedApplication.id, apiData);
            
            // Get the updated application from response and format it
            const updatedApp = schoolAidService.formatApplicationForFrontend(response.data || response);
            
            // Immediately update local state for instant UI feedback
            setAllApplications(prev => 
                prev.map(app => app.id === editedApplication.id ? updatedApp : app)
            );
            
            // Update applications table immediately
            setApplications(prev => 
                prev.map(app => app.id === editedApplication.id ? updatedApp : app)
            );
            
            setShowEditModal(false);
            setSelectedApplication(null);
            showNotification('Application updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update application:', error);
            showNotification('Failed to update application', 'error');
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        try {
            await schoolAidService.deleteApplication(applicationId);
            
            // Get the application details before deletion for status count updates
            const deletedApp = allApplications.find(app => app.id === applicationId);
            
            // Immediately update local state for instant UI feedback
            setAllApplications(prev => prev.filter(app => app.id !== applicationId));
            
            // Update applications table immediately
            setApplications(prev => prev.filter(app => app.id !== applicationId));
            
            // Update status counts immediately
            if (deletedApp) {
                setStatusCounts(prev => ({
                    ...prev,
                    all: prev.all - 1,
                    [deletedApp.status]: Math.max(0, prev[deletedApp.status] - 1)
                }));
            }
            
            setShowDeleteModal(false);
            setSelectedApplication(null);
            showNotification('Application deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete application:', error);
            showNotification('Failed to delete application', 'error');
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
                        <User className="w-8 h-8 text-orange-500 mr-3" />
                        Aid Applications Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Review and manage school aid applications
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Application</span>
                    </button>
                    <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <div 
                        key={status}
                        className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                            statusFilter === status 
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                        }`}
                        onClick={() => setStatusFilter(status)}
                    >
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{count}</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                                {status === 'all' ? 'Total' : status}
                            </p>
                        </div>
                    </div>
                ))}
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
                                placeholder="Search by name, ID, or school..."
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
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Pagination Loading Indicator */}
                {paginationLoading && (
                    <div className="flex items-center justify-center py-4 bg-slate-50 dark:bg-slate-700/50">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                        <span className="text-slate-600 dark:text-slate-400 mr-4">Loading applications...</span>
                        <button
                            onClick={resetLoadingStates}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Reset loading state if stuck"
                        >
                            Reset
                        </button>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Student</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">School</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Aid Type</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Date</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Status</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((application) => (
                                <tr key={application.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">{application.studentName}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{application.studentId}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <School className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="text-slate-600 dark:text-slate-400">{application.school}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {application.aidType}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-green-600 dark:text-green-400">{application.amount}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {application.applicationDate}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(application.status)}`}>
                                            {application.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedApplication(application)}
                                                className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {application.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApplication(application);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deny"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {applications.length === 0 && (
                    <div className="text-center py-12">
                        <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                            {searchTerm || statusFilter !== 'all' || schoolFilter !== 'all' 
                                ? 'No applications found matching your criteria.' 
                                : 'No applications available.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        {/* Pagination Info */}
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} applications
                        </div>
                        
                        {/* Per Page Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                disabled={paginationLoading}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || paginationLoading}
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
                                            onClick={() => handlePageChange(1)}
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
                                            onClick={() => handlePageChange(page)}
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
                                            onClick={() => handlePageChange(totalPages)}
                                            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Next Page */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || paginationLoading}
                                className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-600"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedApplication && !showStatusModal && !showEditModal && !showDeleteModal && (
                <ApplicationModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}

            {showStatusModal && selectedApplication && (
                <StatusUpdateModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedApplication(null);
                    }}
                    onUpdate={handleStatusUpdate}
                />
            )}

            {showAddModal && (
                <ApplicationFormModal
                    mode="add"
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddApplication}
                />
            )}

            {showEditModal && selectedApplication && (
                <ApplicationFormModal
                    mode="edit"
                    application={selectedApplication}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedApplication(null);
                    }}
                    onSave={handleEditApplication}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Confirm Deletion</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Are you sure you want to delete the application for <strong>{selectedApplication.studentName}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteApplication(selectedApplication.id)}
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

export default SADApplications; 