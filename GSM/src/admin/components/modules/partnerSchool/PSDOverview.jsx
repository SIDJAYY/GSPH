import React from 'react';
import { School as SchoolIcon, Users, MapPin, TrendingUp, Plus, Search, Filter, Download, Eye, Edit, Trash2, Archive, RotateCcw, X } from 'lucide-react';
import ConfirmationModal from '../../ui/ConfirmationModal';
// import { API_CONFIG, getApiUrl, getPartnerSchoolUrl } from '../../../../config/api';

function PSDOverview() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('active');
    const [showAddModal, setShowAddModal] = React.useState(false);

    const [schools, setSchools] = React.useState([]);
    const [allSchools, setAllSchools] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [actionError, setActionError] = React.useState('');
    const [actionSuccess, setActionSuccess] = React.useState('');
    const [showProgramsModal, setShowProgramsModal] = React.useState(false);
    const [selectedSchool, setSelectedSchool] = React.useState(null);
    const [programs, setPrograms] = React.useState([]);
    const [programsLoading, setProgramsLoading] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [schoolToDelete, setSchoolToDelete] = React.useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
    const [showArchiveModal, setShowArchiveModal] = React.useState(false);
    const [schoolToArchive, setSchoolToArchive] = React.useState(null);
    const [showRestoreModal, setShowRestoreModal] = React.useState(false);
    const [schoolToRestore, setSchoolToRestore] = React.useState(null);
    const [selectedSchoolForAction, setSelectedSchoolForAction] = React.useState(null);

    const [formData, setFormData] = React.useState({
        name: '',
        address: '',
        city: '',
        region: '',
        province: '',
        postal_code: '',
        contact_info_email: '',
        contact_info_phone: '',
        contact_info_website: '',
        contact_info_contact_person: '',
        contact_info_mobile: '',
        accreditation: '',
        total_students: '',
        male_students: '',
        female_students: '',
        scholarship_recipients: '',
        population_date: '',
        population_notes: '',
    });

    const fetchAllSchools = React.useCallback(async () => {
        try {
            const url = getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load all schools (${res.status})`);
            const data = await res.json();
            const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            setAllSchools(items);
        } catch (e) {
            console.error('Failed to load all schools for stats:', e.message);
        }
    }, []);

    const fetchSchools = React.useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            // filterStatus is UI-only for now; backend has no status field
            const url = `${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}?${params.toString()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load schools (${res.status})`);
            const data = await res.json();
            const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            setSchools(items);
            // Reset to first page when data changes
            setCurrentPage(1);
        } catch (e) {
            setError(e.message || 'Failed to load schools');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    React.useEffect(() => {
        fetchAllSchools();
        fetchSchools();
    }, [fetchAllSchools, fetchSchools]);

    // Reset to first page when search or filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const fetchPrograms = React.useCallback(async (schoolId) => {
        try {
            setProgramsLoading(true);
            setError('');
            const url = `${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}/${schoolId}/programs`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to load programs (${res.status})`);
            const data = await res.json();
            setPrograms(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message || 'Failed to load programs');
        } finally {
            setProgramsLoading(false);
        }
    }, []);

    const handleViewPrograms = async (school) => {
        setSelectedSchool(school);
        setShowProgramsModal(true);
        await fetchPrograms(school.id);
    };

    const partnerSchools = schools.map((s) => ({
        id: s.school_id,
        name: s.name,
        type: s.accreditation || '—',
        // Keep individual address fields for proper display
        address: s.address || '',
        city: s.city || '',
        region: s.region || '',
        province: s.province || '',
        postal_code: s.postal_code || '',
        // Keep full contact info structure
        contact_info: s.contact_info || {},
        principal: s.contact_info?.contact_person || '—',
        students: s.total_students || 0,
        male_students: s.male_students || 0,
        female_students: s.female_students || 0,
        scholarship_recipients: s.scholarship_recipients || 0,
        population_date: s.population_date || '',
        population_notes: s.population_notes || '',
        status: s.status || 'active',
        partnership_date: '',
        programs: s.programs || [],
        contact: s.contact_info?.phone || '—',
    }));

    const activeSchools = allSchools.filter(school => (school.status || 'active').toLowerCase() === 'active').length;
    const archivedSchools = allSchools.filter(school => (school.status || 'active').toLowerCase() === 'archived').length;

    const stats = [
        { title: 'Total Partner Schools', value: allSchools.length, icon: SchoolIcon, color: 'bg-blue-500', change: '+0%', changeType: 'positive' },
        { title: 'Active Schools', value: activeSchools, icon: TrendingUp, color: 'bg-green-500', change: '+0%', changeType: 'positive' },
        { title: 'Archived Schools', value: archivedSchools, icon: Archive, color: 'bg-orange-500', change: '+0%', changeType: 'positive' },
        { title: 'Total Students', value: allSchools.reduce((sum, school) => sum + (parseInt(school.total_students) || 0), 0).toLocaleString(), icon: Users, color: 'bg-purple-500', change: '+0%', changeType: 'positive' },
    ];

    const filteredSchools = partnerSchools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.province.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || school.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSchools = filteredSchools.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    const handleViewSchool = (school) => {
        setSelectedSchoolForAction(school);
        setShowViewModal(true);
    };

    const handleEditSchool = (school) => {
        setSelectedSchoolForAction(school);
        // Populate form with existing data
        setFormData({
            name: school.name,
            address: school.address || '',
            city: school.city || '',
            region: school.region || '',
            province: school.province || '',
            postal_code: school.postal_code || '',
            contact_info_email: school.contact_info?.email || '',
            contact_info_phone: school.contact_info?.phone || '',
            contact_info_website: school.contact_info?.website || '',
            contact_info_contact_person: school.contact_info?.contact_person || '',
            contact_info_mobile: school.contact_info?.mobile || '',
            accreditation: school.accreditation || '',
            total_students: school.total_students?.toString() || '',
            male_students: school.male_students?.toString() || '',
            female_students: school.female_students?.toString() || '',
            scholarship_recipients: school.scholarship_recipients?.toString() || '',
            population_date: school.population_date || '',
            population_notes: school.population_notes || '',
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (school) => {
        setSchoolToDelete(school);
        setDeleteConfirmation('');
        setShowDeleteModal(true);
    };

    const openArchiveModal = (school) => {
        setSchoolToArchive(school);
        setShowArchiveModal(true);
    };

    const openRestoreModal = (school) => {
        setSchoolToRestore(school);
        setShowRestoreModal(true);
    };

    const handleArchiveSchool = async () => {
        if (!schoolToArchive) return;
        
        setActionError('');
        setActionSuccess('');
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}/${schoolToArchive.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' }),
            });
            if (!res.ok) throw new Error('Failed to archive school');
            
            // Update local state
            setSchools(prev => prev.map(s => 
                s.school_id === schoolToArchive.id ? { ...s, status: 'archived' } : s
            ));
            setAllSchools(prev => prev.map(s => 
                s.school_id === schoolToArchive.id ? { ...s, status: 'archived' } : s
            ));
            
            // Close modal first
            setShowArchiveModal(false);
            setSchoolToArchive(null);
            // Clear any existing messages first
            setActionError('');
            // Then set success message with a small delay to ensure state is cleared first
            setTimeout(() => {
                setActionSuccess('Partner school archived successfully!');
            }, 100);
            // Clear success message after 5 seconds
            setTimeout(() => {
                setActionSuccess('');
            }, 5000);
        } catch (e) {
            setActionError(e.message || 'Failed to archive school');
            // Close modal immediately on error
            setShowArchiveModal(false);
            setSchoolToArchive(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreSchool = async () => {
        if (!schoolToRestore) return;
        
        setActionError('');
        setActionSuccess('');
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}/${schoolToRestore.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
            if (!res.ok) throw new Error('Failed to restore school');
            
            // Update local state
            setSchools(prev => prev.map(s => 
                s.school_id === schoolToRestore.id ? { ...s, status: 'active' } : s
            ));
            setAllSchools(prev => prev.map(s => 
                s.school_id === schoolToRestore.id ? { ...s, status: 'active' } : s
            ));
            
            // Close modal first
            setShowRestoreModal(false);
            setSchoolToRestore(null);
            // Clear any existing messages first
            setActionError('');
            // Then set success message with a small delay to ensure state is cleared first
            setTimeout(() => {
                setActionSuccess('Partner school restored successfully!');
            }, 100);
            // Clear success message after 5 seconds
            setTimeout(() => {
                setActionSuccess('');
            }, 5000);
        } catch (e) {
            setActionError(e.message || 'Failed to restore school');
            // Close modal immediately on error
            setShowRestoreModal(false);
            setSchoolToRestore(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchool = async () => {
        if (!schoolToDelete || deleteConfirmation !== 'Delete') return;
        
        setActionError('');
        setActionSuccess('');
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}/${schoolToDelete.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete school');
            
            // Remove from local state
            setSchools(prev => prev.filter(s => s.school_id !== schoolToDelete.id));
            setAllSchools(prev => prev.filter(s => s.school_id !== schoolToDelete.id));
            
            // Close modal first
            setShowDeleteModal(false);
            setSchoolToDelete(null);
            // Clear any existing messages first
            setActionError('');
            // Then set success message with a small delay to ensure state is cleared first
            setTimeout(() => {
                setActionSuccess('Partner school permanently deleted!');
            }, 100);
            // Clear success message after 5 seconds
            setTimeout(() => {
                setActionSuccess('');
            }, 5000);
        } catch (e) {
            setActionError(e.message || 'Failed to delete school');
            // Close modal immediately on error
            setShowDeleteModal(false);
            setSchoolToDelete(null);
            setDeleteConfirmation('');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            // Debug: Log form data
            console.log('Form Data:', formData);
            
            const payload = {
                name: formData.name,
                address: formData.address || null,
                city: formData.city || null,
                region: formData.region || null,
                province: formData.province || null,
                postal_code: formData.postal_code || null,
                accreditation: formData.accreditation || null,
                total_students: formData.total_students ? parseInt(formData.total_students) : null,
                male_students: formData.male_students ? parseInt(formData.male_students) : null,
                female_students: formData.female_students ? parseInt(formData.female_students) : null,
                scholarship_recipients: formData.scholarship_recipients ? parseInt(formData.scholarship_recipients) : null,
                population_date: formData.population_date || null,
                population_notes: formData.population_notes || null,
                contact_info: {
                    email: formData.contact_info_email || null,
                    phone: formData.contact_info_phone || null,
                    website: formData.contact_info_website || null,
                    contact_person: formData.contact_info_contact_person || null,
                    mobile: formData.contact_info_mobile || null,
                },
            };
            
            // Debug: Log payload
            console.log('Payload:', payload);

            let res;
            if (showEditModal && selectedSchoolForAction) {
                // Update existing school
                res = await fetch(`${getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS)}/${selectedSchoolForAction.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('Failed to update school');
            } else {
                // Create new school
                res = await fetch(getPartnerSchoolUrl(API_CONFIG.PARTNER_SCHOOL.ENDPOINTS.SCHOOLS), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error('Failed to add school');
            }

            // Close modal and reset form
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedSchoolForAction(null);
            setFormData({
                name: '', address: '', city: '', region: '', province: '', postal_code: '',
                contact_info_email: '', contact_info_phone: '', contact_info_website: '', 
                contact_info_contact_person: '', contact_info_mobile: '', accreditation: '',
                total_students: '', male_students: '', female_students: '', scholarship_recipients: '',
                population_date: '', population_notes: '',
            });
            fetchSchools();
        } catch (e) {
            setError(e.message || 'Failed to save school');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Fixed Position Toast Notifications */}
            {actionError && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-[500px]">
                    <span className="font-semibold">{actionError}</span>
                    <button 
                        onClick={() => setActionError('')}
                        className="text-white hover:text-red-200 font-bold text-lg ml-4"
                    >
                        ×
                    </button>
                </div>
            )}
            {actionSuccess && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-green-500 text-white rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-[500px]">
                    <span className="font-semibold">{actionSuccess}</span>
                    <button 
                        onClick={() => setActionSuccess('')}
                        className="text-white hover:text-green-200 font-bold text-lg ml-4"
                    >
                        ×
                    </button>
                </div>
            )}
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner School Database</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage and monitor partner school information, programs, and student populations</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New School
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <span className={`text-sm font-medium ${
                                    stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {stat.change}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">from last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search schools or addresses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schools Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Schools</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    
                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">School Information</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Population</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Programs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {currentSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{school.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">{school.type}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {[school.address, school.city, school.region, school.province].filter(Boolean).join(', ')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{school.students.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    M: {school.male_students.toLocaleString()} | F: {school.female_students.toLocaleString()}
                                                </div>
                                                {school.scholarship_recipients > 0 && (
                                                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                        🎓 {school.scholarship_recipients} scholarship recipients
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.status)}`}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onClick={() => handleViewPrograms(school)}
                                                className="inline-flex items-center px-3 py-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View Programs
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleViewSchool(school)}
                                                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View School Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditSchool(school)}
                                                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Edit School"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {school.status === 'archived' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => openRestoreModal(school)}
                                                            className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            title="Restore School"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => openDeleteModal(school)}
                                                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete School Permanently"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => openArchiveModal(school)}
                                                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                                                        title="Archive School"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {loading && (
                            <div className="px-6 py-8 text-center">
                                <div className="text-gray-500 dark:text-gray-400">Loading schools...</div>
                            </div>
                        )}
                        {!loading && filteredSchools.length === 0 && (
                            <div className="px-6 py-8 text-center">
                                <div className="text-gray-500 dark:text-gray-400">No schools found matching your criteria.</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Enhanced Pagination Controls */}
                    {!loading && filteredSchools.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredSchools.length)}</span> of <span className="font-medium">{filteredSchools.length}</span> schools
                                    {totalPages > 1 && (
                                        <span className="ml-2 text-gray-500">
                                            (Page {currentPage} of {totalPages})
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Go to first page"
                                    >
                                        «
                                    </button>
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-orange-500 text-white shadow-sm'
                                                            : 'text-gray-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-500'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Go to last page"
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Partner School</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">×</button>
                            </div>
                        </div>
                        <form className="space-y-6 p-6" onSubmit={onSubmitForm}>
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Essential details about the school</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Name *</label>
                                        <input 
                                            value={formData.name} 
                                            onChange={(e)=>setFormData(v=>({...v,name:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            required 
                                            placeholder="Enter school name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accreditation</label>
                                        <input 
                                            value={formData.accreditation} 
                                            onChange={(e)=>setFormData(v=>({...v,accreditation:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="e.g., PAASCU Level II"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Information</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">School address and location details</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complete Address</label>
                                    <input 
                                        value={formData.address} 
                                        onChange={(e)=>setFormData(v=>({...v,address:e.target.value}))} 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                        placeholder="Street address, building, etc."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                                        <input 
                                            value={formData.city} 
                                            onChange={(e)=>setFormData(v=>({...v,city:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="e.g., Manila"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
                                        <select 
                                            value={formData.region} 
                                            onChange={(e)=>setFormData(v=>({...v,region:e.target.value}))} 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                                        >
                                            <option value="">Select Region</option>
                                            <option value="NCR">NCR</option>
                                            <option value="Region I">Region I</option>
                                            <option value="Region II">Region II</option>
                                            <option value="Region III">Region III</option>
                                            <option value="Region IV-A">Region IV-A</option>
                                            <option value="Region IV-B">Region IV-B</option>
                                            <option value="Region V">Region V</option>
                                            <option value="Region VI">Region VI</option>
                                            <option value="Region VII">Region VII</option>
                                            <option value="Region VIII">Region VIII</option>
                                            <option value="Region IX">Region IX</option>
                                            <option value="Region X">Region X</option>
                                            <option value="Region XI">Region XI</option>
                                            <option value="Region XII">Region XII</option>
                                            <option value="CAR">CAR</option>
                                            <option value="CARAGA">CARAGA</option>
                                            <option value="BARMM">BARMM</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Province</label>
                                        <input 
                                            value={formData.province} 
                                            onChange={(e)=>setFormData(v=>({...v,province:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="e.g., Metro Manila"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                                        <input 
                                            value={formData.postal_code} 
                                            onChange={(e)=>setFormData(v=>({...v,postal_code:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="e.g., 1000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">How to reach the school administration</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
                                        <input 
                                            value={formData.contact_info_contact_person} 
                                            onChange={(e)=>setFormData(v=>({...v,contact_info_contact_person:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="e.g., Dr. Maria Santos"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                        <input 
                                            value={formData.contact_info_email} 
                                            onChange={(e)=>setFormData(v=>({...v,contact_info_email:e.target.value}))} 
                                            type="email" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="admin@school.edu.ph"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input 
                                            value={formData.contact_info_phone} 
                                            onChange={(e)=>setFormData(v=>({...v,contact_info_phone:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="+63 2 8888 0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
                                        <input 
                                            value={formData.contact_info_mobile} 
                                            onChange={(e)=>setFormData(v=>({...v,contact_info_mobile:e.target.value}))} 
                                            type="text" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="+63 917 123 4567"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                                    <input 
                                        value={formData.contact_info_website} 
                                        onChange={(e)=>setFormData(v=>({...v,contact_info_website:e.target.value}))} 
                                        type="url" 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                        placeholder="https://www.school.edu.ph"
                                    />
                                </div>
                            </div>
                            
                            {/* Student Population Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Population</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current student enrollment statistics</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Students</label>
                                        <input 
                                            value={formData.total_students} 
                                            onChange={(e)=>setFormData(v=>({...v,total_students:e.target.value}))} 
                                            type="number" 
                                            min="0" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Male Students</label>
                                        <input 
                                            value={formData.male_students} 
                                            onChange={(e)=>setFormData(v=>({...v,male_students:e.target.value}))} 
                                            type="number" 
                                            min="0" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Female Students</label>
                                        <input 
                                            value={formData.female_students} 
                                            onChange={(e)=>setFormData(v=>({...v,female_students:e.target.value}))} 
                                            type="number" 
                                            min="0" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scholarship Recipients</label>
                                        <input 
                                            value={formData.scholarship_recipients} 
                                            onChange={(e)=>setFormData(v=>({...v,scholarship_recipients:e.target.value}))} 
                                            type="number" 
                                            min="0" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Population Date</label>
                                        <input 
                                            value={formData.population_date} 
                                            onChange={(e)=>setFormData(v=>({...v,population_date:e.target.value}))} 
                                            type="date" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Population Notes</label>
                                        <textarea 
                                            value={formData.population_notes} 
                                            onChange={(e)=>setFormData(v=>({...v,population_notes:e.target.value}))} 
                                            rows="3" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors" 
                                            placeholder="Additional notes about student population..."
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Form Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-600">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)} 
                                    className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md" 
                                    disabled={loading}
                                >
                                    {loading ? 'Adding School...' : 'Add School'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View School Modal */}
            {showViewModal && selectedSchoolForAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">School Details</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedSchoolForAction.name}</p>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">×</button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedSchoolForAction.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accreditation</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.accreditation || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.address || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.city || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.region || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.province || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.postal_code || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.contact_info?.contact_person || selectedSchoolForAction.principal || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.contact_info?.phone || selectedSchoolForAction.contact || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.contact_info?.mobile || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <p className="text-gray-900 dark:text-white">{selectedSchoolForAction.contact_info?.email || 'Not specified'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedSchoolForAction.contact_info?.website ? (
                                                <a 
                                                    href={selectedSchoolForAction.contact_info.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                >
                                                    {selectedSchoolForAction.contact_info.website}
                                                </a>
                                            ) : (
                                                'Not specified'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Student Population Section */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-slate-600 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Population</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg border border-blue-200 dark:border-slate-600">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Students</label>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedSchoolForAction.total_students?.toLocaleString() || selectedSchoolForAction.students?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-slate-700 p-4 rounded-lg border border-green-200 dark:border-slate-600">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Male Students</label>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedSchoolForAction.male_students?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-slate-700 p-4 rounded-lg border border-purple-200 dark:border-slate-600">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Female Students</label>
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedSchoolForAction.female_students?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-slate-700 p-4 rounded-lg border border-yellow-200 dark:border-slate-600">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Recipients</label>
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedSchoolForAction.scholarship_recipients?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>
                                {(selectedSchoolForAction.population_date || selectedSchoolForAction.population_notes) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {selectedSchoolForAction.population_date && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Population Date</label>
                                                <p className="text-gray-900 dark:text-white">{new Date(selectedSchoolForAction.population_date).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        {selectedSchoolForAction.population_notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Population Notes</label>
                                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border-l-4 border-gray-300 dark:border-slate-600">{selectedSchoolForAction.population_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-600">
                                <button 
                                    onClick={() => setShowViewModal(false)} 
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit School Modal */}
            {showEditModal && selectedSchoolForAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit School - {selectedSchoolForAction.name}</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
                        </div>
                        <form className="space-y-4" onSubmit={onSubmitForm}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Name</label>
                                    <input value={formData.name} onChange={(e)=>setFormData(v=>({...v,name:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accreditation</label>
                                    <input value={formData.accreditation} onChange={(e)=>setFormData(v=>({...v,accreditation:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <input value={formData.address} onChange={(e)=>setFormData(v=>({...v,address:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input value={formData.city} onChange={(e)=>setFormData(v=>({...v,city:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                                    <select value={formData.region} onChange={(e)=>setFormData(v=>({...v,region:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                                        <option value="">Select Region</option>
                                        <option value="NCR">NCR</option>
                                        <option value="Region I">Region I</option>
                                        <option value="Region II">Region II</option>
                                        <option value="Region III">Region III</option>
                                        <option value="Region IV-A">Region IV-A</option>
                                        <option value="Region IV-B">Region IV-B</option>
                                        <option value="Region V">Region V</option>
                                        <option value="Region VI">Region VI</option>
                                        <option value="Region VII">Region VII</option>
                                        <option value="Region VIII">Region VIII</option>
                                        <option value="Region IX">Region IX</option>
                                        <option value="Region X">Region X</option>
                                        <option value="Region XI">Region XI</option>
                                        <option value="Region XII">Region XII</option>
                                        <option value="CAR">CAR</option>
                                        <option value="CARAGA">CARAGA</option>
                                        <option value="BARMM">BARMM</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
                                    <input value={formData.province} onChange={(e)=>setFormData(v=>({...v,province:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                                    <input value={formData.postal_code} onChange={(e)=>setFormData(v=>({...v,postal_code:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                                    <input value={formData.contact_info_email} onChange={(e)=>setFormData(v=>({...v,contact_info_email:e.target.value}))} type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                                    <input value={formData.contact_info_phone} onChange={(e)=>setFormData(v=>({...v,contact_info_phone:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="+63 2 8888 0000" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                                    <input value={formData.contact_info_contact_person} onChange={(e)=>setFormData(v=>({...v,contact_info_contact_person:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Dr. Maria Santos" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                                    <input value={formData.contact_info_mobile} onChange={(e)=>setFormData(v=>({...v,contact_info_mobile:e.target.value}))} type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="+63 917 123 4567" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                                <input value={formData.contact_info_website} onChange={(e)=>setFormData(v=>({...v,contact_info_website:e.target.value}))} type="url" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Population</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Students</label>
                                        <input value={formData.total_students} onChange={(e)=>setFormData(v=>({...v,total_students:e.target.value}))} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Male Students</label>
                                        <input value={formData.male_students} onChange={(e)=>setFormData(v=>({...v,male_students:e.target.value}))} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Female Students</label>
                                        <input value={formData.female_students} onChange={(e)=>setFormData(v=>({...v,female_students:e.target.value}))} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Recipients</label>
                                        <input value={formData.scholarship_recipients} onChange={(e)=>setFormData(v=>({...v,scholarship_recipients:e.target.value}))} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Population Date</label>
                                        <input value={formData.population_date} onChange={(e)=>setFormData(v=>({...v,population_date:e.target.value}))} type="date" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Population Notes</label>
                                        <textarea value={formData.population_notes} onChange={(e)=>setFormData(v=>({...v,population_notes:e.target.value}))} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="Additional notes about student population..." />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" disabled={loading}>Update School</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProgramsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Programs Offered</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedSchool?.name}</p>
                                </div>
                                <button onClick={() => setShowProgramsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">×</button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {programsLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                                        Loading programs...
                                    </div>
                                </div>
                            ) : programs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex flex-col items-center p-6 bg-gray-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
                                        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📚</div>
                                        <div className="text-gray-500 dark:text-gray-400 font-medium">No programs found</div>
                                        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">This school hasn't added any programs yet.</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing <span className="font-medium">{programs.length}</span> program{programs.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    {programs.map((program) => (
                                        <div key={program.program_id} className="border border-gray-200 dark:border-slate-600 rounded-xl p-6 hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                        {program.name}
                                                    </h3>
                                                    {program.description && (
                                                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                                            {program.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-col items-end space-y-2">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                        program.is_active 
                                                            ? 'bg-green-100 text-green-800 border border-green-200' 
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                        {program.is_active ? '🟢 Active' : '🔴 Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level:</span>
                                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                            {program.level || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Duration:</span>
                                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                            {program.duration || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Accreditation:</span>
                                                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                                            program.accreditation_status === 'Accredited' 
                                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                                : program.accreditation_status === 'Candidate'
                                                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                            {program.accreditation_status || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Additional program details could go here */}
                                            {program.requirements && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Requirements:</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{program.requirements}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
                                <button 
                                    onClick={() => setShowProgramsModal(false)} 
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={showArchiveModal}
                onClose={() => {
                    setShowArchiveModal(false);
                    setSchoolToArchive(null);
                }}
                onConfirm={handleArchiveSchool}
                title="Archive Partner School"
                message={`Are you sure you want to archive "${schoolToArchive?.name || 'this school'}"? This will mark the school as archived but preserve all data.`}
                confirmText="Archive School"
                cancelText="Cancel"
                type="warning"
            />
            
            <ConfirmationModal
                isOpen={showRestoreModal}
                onClose={() => {
                    setShowRestoreModal(false);
                    setSchoolToRestore(null);
                }}
                onConfirm={handleRestoreSchool}
                title="Restore Partner School"
                message={`Are you sure you want to restore "${schoolToRestore?.name || 'this school'}"? This will mark the school as active again.`}
                confirmText="Restore School"
                cancelText="Cancel"
                type="success"
            />
            
            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permanently Delete Partner School</h3>
                                <button 
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSchoolToDelete(null);
                                        setDeleteConfirmation('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to permanently delete <strong>{schoolToDelete?.name || 'this school'}</strong>? 
                                    This action cannot be undone and will permanently remove all associated data including programs and student information.
                                </p>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Type <strong>Delete</strong> to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        placeholder="Type 'Delete' here"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSchoolToDelete(null);
                                        setDeleteConfirmation('');
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteSchool}
                                    disabled={deleteConfirmation !== 'Delete'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Permanently</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PSDOverview; 