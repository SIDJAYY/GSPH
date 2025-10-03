import React from 'react';
import { Users, UserPlus, GraduationCap, School, Search, Filter, MoreVertical, Eye, Edit, Archive, RotateCcw, Trash2, X } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import ViewStudentModal from './ViewStudentModal';
import EditStudentModal from './EditStudentModal';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function StudentRegistryOverview() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('active');
    const [filterCampus, setFilterCampus] = React.useState('all');
    const [filterYear, setFilterYear] = React.useState('all');
    const [filterProgram, setFilterProgram] = React.useState('all');
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    const [tempFilterCampus, setTempFilterCampus] = React.useState(filterCampus);
    const [tempFilterYear, setTempFilterYear] = React.useState(filterYear);
    const [tempFilterProgram, setTempFilterProgram] = React.useState(filterProgram);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [showFilters, setShowFilters] = React.useState(false);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showArchiveModal, setShowArchiveModal] = React.useState(false);
    const [studentToArchive, setStudentToArchive] = React.useState(null);
    const [showRestoreModal, setShowRestoreModal] = React.useState(false);
    const [studentToRestore, setStudentToRestore] = React.useState(null);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [studentToDelete, setStudentToDelete] = React.useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
    const [selectedStudent, setSelectedStudent] = React.useState(null);
    const [students, setStudents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [actionError, setActionError] = React.useState('');
    const [actionSuccess, setActionSuccess] = React.useState('');

    React.useEffect(() => {
        fetchStudents();
    }, []);

    const shortId = (uuid) => {
        if (!uuid) return '';
        const parts = String(uuid);
        return `${parts.slice(0, 8)}…${parts.slice(-4)}`;
    };

    const mapToViewModel = (s) => {
        const firstName = s.first_name || s.firstName || '';
        const middleName = s.middle_name || s.middleName || '';
        const lastName = s.last_name || s.lastName || '';
        const nameFromParts = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
        const fullName = (s.name && s.name.trim()) || nameFromParts;
        const email = s.email_address || s.email || (s.user && s.user.email) || '';
        const studentUuid = s.student_id || s.studentId || s.id || '';
        const studentNumber = s.student_id_number || s.student_number || s.studentNumber || '';
        const enrollmentDate = s.current_academic_record?.enrollment_date || s.enrollmentDate || s.created_at || s.enrollment_date || Date.now();
        const yearLevel = s.current_academic_record?.year_level || s.year_level || s.yearLevel || '';
        const program = s.current_academic_record?.program || s.current_academic_record?.track_specialization || s.current_academic_record?.area_of_specialization || s.program || '';
        const schoolName = s.current_academic_record?.school?.name || s.school?.name || '';
        const campus = s.campus || '';
        const contactNumber = s.contact_number || '';
        const citizenId = s.citizen_id || '';

        let scholarshipStatus = 'none';
        if (Array.isArray(s.scholarships) && s.scholarships.length > 0) {
            const latest = s.scholarships[0];
            scholarshipStatus = (latest.status || '').toLowerCase() === 'awarded' ? 'scholar' : 'applicant';
        }

        return {
            name: fullName,
            studentId: studentNumber || shortId(studentUuid),
            student_uuid: studentUuid,
            email,
            contact_number: contactNumber,
            citizen_id: citizenId,
            year_level: yearLevel,
            program,
            school_name: schoolName,
            campus,
            status: (s.status || 'active'),
            scholarshipStatus,
            enrollmentDate,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            student_number: studentNumber,
        };
    };

    const fetchStudents = async () => {
        setActionError('');
        setActionSuccess('');
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS), {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                }
            });
            const result = await response.json();
            
            if (result.success) {
                const raw = Array.isArray(result.data) 
                    ? result.data 
                    : Array.isArray(result?.data?.data) 
                        ? result.data.data 
                        : [];
                const mapped = raw.map(mapToViewModel);
                setStudents(mapped);
            } else {
                setActionError(result.message || 'Failed to fetch students');
            }
        } catch (error) {
            setActionError('Network error while fetching students');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentAdded = async (studentData) => {
        if (studentData && studentData.error) {
            setActionError(studentData.error);
            return;
        }
        setActionError('');
        setActionSuccess('Student added successfully!');
        await fetchStudents();
        // Don't close modal immediately - let the modal handle its own closing with success toast
        // setShowAddModal(false);
        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(''), 3000);
    };

    const openView = (s) => {
        setSelectedStudent(s);
        setShowViewModal(true);
    };

    const openEdit = (s) => {
        setSelectedStudent(s);
        setShowEditModal(true);
        setActionError('');
        setActionSuccess('');
    };

    const handleUpdated = async (studentData) => {
        if (studentData && studentData.error) {
            setActionError(studentData.error);
            return;
        }
        setActionError('');
        setActionSuccess('Student updated successfully!');
        await fetchStudents();
        // Don't close modal immediately - let the modal handle its own closing with success toast
        // setShowEditModal(false);
        // Clear success message after 3 seconds
        setTimeout(() => setActionSuccess(''), 3000);
    };

    const openArchiveModal = (s) => {
        setStudentToArchive(s);
        setShowArchiveModal(true);
    };

    const openRestoreModal = (s) => {
        setStudentToRestore(s);
        setShowRestoreModal(true);
    };

    const openDeleteModal = (s) => {
        setStudentToDelete(s);
        setDeleteConfirmation('');
        setShowDeleteModal(true);
    };

    const openFilterModal = () => {
        setTempFilterCampus(filterCampus);
        setTempFilterYear(filterYear);
        setTempFilterProgram(filterProgram);
        setShowFilterModal(true);
    };

    const applyFilters = () => {
        setFilterCampus(tempFilterCampus);
        setFilterYear(tempFilterYear);
        setFilterProgram(tempFilterProgram);
        setShowFilterModal(false);
    };

    const resetFilters = () => {
        setTempFilterCampus('all');
        setTempFilterYear('all');
        setTempFilterProgram('all');
    };

    const handleArchive = async () => {
        if (!studentToArchive) return;
        
        setActionError('');
        setActionSuccess('');
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS)}/${studentToArchive.student_uuid}`, {
                method: 'DELETE',
                headers: { 
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            const result = await res.json();
            if (result.success) {
                // Close modal first
                setShowArchiveModal(false);
                setStudentToArchive(null);
                // Clear any existing messages first
                setActionError('');
                // Then set success message with a small delay to ensure state is cleared first
                setTimeout(() => {
                    setActionSuccess('Student archived successfully!');
                }, 100);
                await fetchStudents();
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setActionSuccess('');
                }, 5000);
            } else {
                setActionError(result.message || 'Failed to archive student');
                // Close modal immediately on error
                setShowArchiveModal(false);
                setStudentToArchive(null);
            }
        } catch (err) {
            setActionError('Network error while archiving student');
            // Close modal immediately on error
            setShowArchiveModal(false);
            setStudentToArchive(null);
        }
    };

    const handleRestore = async () => {
        if (!studentToRestore) return;
        
        setActionError('');
        setActionSuccess('');
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_RESTORE(studentToRestore.student_uuid)), {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            const result = await res.json();
            if (result.success) {
                // Close modal first
                setShowRestoreModal(false);
                setStudentToRestore(null);
                // Clear any existing messages first
                setActionError('');
                // Then set success message with a small delay to ensure state is cleared first
                setTimeout(() => {
                    setActionSuccess('Student restored successfully!');
                }, 100);
                await fetchStudents();
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setActionSuccess('');
                }, 5000);
            } else {
                setActionError(result.message || 'Failed to restore student');
                // Close modal immediately on error
                setShowRestoreModal(false);
                setStudentToRestore(null);
            }
        } catch (err) {
            setActionError('Network error while restoring student');
            // Close modal immediately on error
            setShowRestoreModal(false);
            setStudentToRestore(null);
        }
    };

    const handleDelete = async () => {
        if (!studentToDelete || deleteConfirmation !== 'Delete') return;
        
        setActionError('');
        setActionSuccess('');
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_FORCE_DELETE(studentToDelete.student_uuid)), {
                method: 'DELETE',
                headers: { 
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            const result = await res.json();
            if (result.success) {
                setActionSuccess('Student permanently deleted!');
                await fetchStudents();
                // Clear success message after 3 seconds
                setTimeout(() => setActionSuccess(''), 3000);
            } else {
                setActionError(result.message || 'Failed to delete student');
            }
        } catch (err) {
            setActionError('Network error while deleting student');
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
            setDeleteConfirmation('');
        }
    };

    // Calculate real stats from student data
    const activeStudents = students.filter(student => (student.status || '').toLowerCase() === 'active').length;
    const archivedStudents = students.filter(student => (student.status || '').toLowerCase() === 'archived').length;
    const totalStudents = students.length;
    
    // Calculate new registrations (students created in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = students.filter(student => {
        const enrollmentDate = new Date(student.enrollmentDate);
        return enrollmentDate >= thirtyDaysAgo;
    }).length;

    // Calculate scholars (students with scholarship status)
    const scholars = students.filter(student => (student.scholarshipStatus || '').toLowerCase() === 'scholar').length;

    const stats = [
        { title: 'Total Students', value: totalStudents.toString(), change: '', changeType: 'neutral', icon: Users, color: 'bg-blue-500' },
        { title: 'Active Students', value: activeStudents.toString(), change: '', changeType: 'neutral', icon: UserPlus, color: 'bg-green-500' },
        { title: 'Archived Students', value: archivedStudents.toString(), change: '', changeType: 'neutral', icon: GraduationCap, color: 'bg-orange-500' },
        { title: 'Scholars', value: scholars.toString(), change: '', changeType: 'neutral', icon: School, color: 'bg-purple-500' },
    ];

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatusFilter = filterStatus === 'all' || (student.status || '').toLowerCase() === filterStatus.toLowerCase();
        const matchesCampusFilter = filterCampus === 'all' || (student.campus || '').toLowerCase() === filterCampus.toLowerCase();
        const matchesYearFilter = filterYear === 'all' || (student.year_level || '').toLowerCase() === filterYear.toLowerCase();
        const matchesProgramFilter = filterProgram === 'all' || (student.program || '').toLowerCase().includes(filterProgram.toLowerCase());
        return matchesSearch && matchesStatusFilter && matchesCampusFilter && matchesYearFilter && matchesProgramFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterCampus, filterYear, filterProgram]);


    return (
        <div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Registry</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage and monitor student information</p>
                </div>
                <button 
                    onClick={() => {
                        setShowAddModal(true);
                        setActionError('');
                        setActionSuccess('');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Student</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                                {stat.change && (
                                    <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                                        {stat.change}
                                    </p>
                                )}
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                        <button
                            onClick={openFilterModal}
                            className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            title="Advanced Filters"
                        >
                            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Records</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading students...' : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredStudents.length)} of ${filteredStudents.length} students`}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Citizen ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">School</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-gray-500 dark:text-gray-400">Loading students...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No students found. {students.length === 0 ? 'Add your first student to get started.' : 'Try adjusting your search or filters.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((student) => (
                                <tr key={student.student_uuid || student.email} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold text-sm">
                                                    {(student.name || '').split(' ').map(n => n[0]).join('') || 'S'}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.citizen_id || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.studentId || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.program || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.school_name || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.year_level || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.contact_number || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{student.email || '—'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => openView(student)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(student)} className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                                            {(student.status || '').toLowerCase() === 'archived' ? (
                                                <>
                                                    <button onClick={() => openRestoreModal(student)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded transition-colors" title="Restore student"><RotateCcw className="w-4 h-4" /></button>
                                                    <button onClick={() => openDeleteModal(student)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors" title="Permanently delete student"><Trash2 className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => openArchiveModal(student)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded transition-colors" title="Archive student"><Archive className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {loading ? 'Loading...' : `Showing ${startIndex + 1} to ${Math.min(endIndex, filteredStudents.length)} of ${filteredStudents.length} results`}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 text-sm rounded transition-colors ${
                                            currentPage === page
                                                ? 'bg-orange-500 text-white'
                                                : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button 
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddStudentModal 
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setActionError('');
                    setActionSuccess('');
                }}
                onStudentAdded={handleStudentAdded}
            />
            <ViewStudentModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                student={selectedStudent}
            />
            <EditStudentModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setActionError('');
                    setActionSuccess('');
                }}
                student={selectedStudent}
                onUpdated={handleUpdated}
            />
            
            <ConfirmationModal
                isOpen={showArchiveModal}
                onClose={() => {
                    setShowArchiveModal(false);
                    setStudentToArchive(null);
                }}
                onConfirm={handleArchive}
                title="Archive Student"
                message={`Are you sure you want to archive ${studentToArchive?.name || 'this student'}? This will mark the student as archived but preserve all data.`}
                confirmText="Archive Student"
                cancelText="Cancel"
                type="warning"
            />
            
            <ConfirmationModal
                isOpen={showRestoreModal}
                onClose={() => {
                    setShowRestoreModal(false);
                    setStudentToRestore(null);
                }}
                onConfirm={handleRestore}
                title="Restore Student"
                message={`Are you sure you want to restore ${studentToRestore?.name || 'this student'}? This will mark the student as active again.`}
                confirmText="Restore Student"
                cancelText="Cancel"
                type="success"
            />
            
            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permanently Delete Student</h3>
                                <button 
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setStudentToDelete(null);
                                        setDeleteConfirmation('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to permanently delete <strong>{studentToDelete?.name || 'this student'}</strong>? 
                                    This action cannot be undone and will permanently remove all associated data.
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
                                        setStudentToDelete(null);
                                        setDeleteConfirmation('');
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
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

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                                <button 
                                    onClick={() => setShowFilterModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Campus
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        value={tempFilterCampus}
                                        onChange={(e) => setTempFilterCampus(e.target.value)}
                                    >
                                        <option value="all">All Campus</option>
                                        <option value="north campus">North Campus</option>
                                        <option value="south campus">South Campus</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Year Level
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        value={tempFilterYear}
                                        onChange={(e) => setTempFilterYear(e.target.value)}
                                    >
                                        <option value="all">All Years</option>
                                        <option value="1st year">1st Year</option>
                                        <option value="2nd year">2nd Year</option>
                                        <option value="3rd year">3rd Year</option>
                                        <option value="4th year">4th Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Program
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                        value={tempFilterProgram}
                                        onChange={(e) => setTempFilterProgram(e.target.value)}
                                    >
                                        <option value="all">All Programs</option>
                                        <option value="bachelor of science in information technology">Bachelor of Science in Information Technology</option>
                                        <option value="bachelor of science in computer science">Bachelor of Science in Computer Science</option>
                                        <option value="bachelor of science in accountancy">Bachelor of Science in Accountancy</option>
                                        <option value="bachelor of science in business administration">Bachelor of Science in Business Administration</option>
                                        <option value="bachelor of science in criminology">Bachelor of Science in Criminology</option>
                                        <option value="bachelor of science in nursing">Bachelor of Science in Nursing</option>
                                        <option value="bachelor of science in education">Bachelor of Science in Education</option>
                                        <option value="bachelor of science in engineering">Bachelor of Science in Engineering</option>
                                        <option value="bachelor of arts in psychology">Bachelor of Arts in Psychology</option>
                                        <option value="bachelor of science in hospitality management">Bachelor of Science in Hospitality Management</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentRegistryOverview; 