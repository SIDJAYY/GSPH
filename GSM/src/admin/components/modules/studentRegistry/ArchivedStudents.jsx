import React from 'react';
import { Archive, RotateCcw, Trash2, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function ArchivedStudents() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterCampus, setFilterCampus] = React.useState('all');
    const [filterYear, setFilterYear] = React.useState('all');
    const [filterProgram, setFilterProgram] = React.useState('all');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const [students, setStudents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [showRestoreModal, setShowRestoreModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [studentToRestore, setStudentToRestore] = React.useState(null);
    const [studentToDelete, setStudentToDelete] = React.useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');

    React.useEffect(() => {
        fetchArchivedStudents();
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
        const email = s.email || (s.user && s.user.email) || '';
        const studentUuid = s.student_id || s.studentId || s.id || '';
        const studentNumber = s.student_number || s.studentNumber || '';
        const enrollmentDate = s.enrollmentDate || s.created_at || s.enrollment_date || s.enrollmentDate || Date.now();
        const yearLevel = s.year_level || s.yearLevel || '';
        const program = s.program || '';
        const campus = s.campus || '';

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
            year_level: yearLevel,
            program,
            campus,
            status: (s.status || 'archived'),
            scholarshipStatus,
            enrollmentDate,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            student_number: studentNumber,
        };
    };

    const fetchArchivedStudents = async () => {
        setError('');
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
                // Filter only archived students
                const archivedStudents = mapped.filter(student => (student.status || '').toLowerCase() === 'archived');
                setStudents(archivedStudents);
            } else {
                setError(result.message || 'Failed to fetch archived students');
            }
        } catch (error) {
            setError('Network error while fetching archived students');
        } finally {
            setLoading(false);
        }
    };

    const openRestoreModal = (student) => {
        setStudentToRestore(student);
        setShowRestoreModal(true);
    };

    const openDeleteModal = (student) => {
        setStudentToDelete(student);
        setDeleteConfirmation('');
        setShowDeleteModal(true);
    };

    const handleRestore = async () => {
        if (!studentToRestore) return;
        
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_RESTORE(studentToRestore.student_uuid)), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            
            const result = await res.json();
            
            if (result.success) {
                setSuccess('Student restored successfully!');
                await fetchArchivedStudents();
                setShowRestoreModal(false);
                setStudentToRestore(null);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.message || 'Failed to restore student');
            }
        } catch (error) {
            setError('Network error while restoring student');
        } finally {
            setShowRestoreModal(false);
            setStudentToRestore(null);
        }
    };

    const handleDelete = async () => {
        if (!studentToDelete || deleteConfirmation !== 'Delete') return;
        
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_FORCE_DELETE(studentToDelete.student_uuid)), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            
            const result = await res.json();
            
            if (result.success) {
                setSuccess('Student permanently deleted!');
                await fetchArchivedStudents();
                setShowDeleteModal(false);
                setStudentToDelete(null);
                setDeleteConfirmation('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.message || 'Failed to delete student');
            }
        } catch (error) {
            setError('Network error while deleting student');
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
            setDeleteConfirmation('');
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCampusFilter = filterCampus === 'all' || (student.campus || '').toLowerCase() === filterCampus.toLowerCase();
        const matchesYearFilter = filterYear === 'all' || (student.year_level || '').toLowerCase() === filterYear.toLowerCase();
        const matchesProgramFilter = filterProgram === 'all' || (student.program || '').toLowerCase().includes(filterProgram.toLowerCase());
        return matchesSearch && matchesCampusFilter && matchesYearFilter && matchesProgramFilter;
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    const handleExport = () => {
        const csvContent = [
            ['Name', 'Student ID', 'Email', 'Year Level', 'Program', 'Campus', 'Enrollment Date', 'Scholarship Status'],
            ...filteredStudents.map(student => [
                student.name,
                student.studentId,
                student.email,
                student.year_level,
                student.program,
                student.campus,
                new Date(student.enrollmentDate).toLocaleDateString(),
                student.scholarshipStatus
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archived_students.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const archivedStudentsCount = students.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Archived Students</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage archived student records</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={fetchArchivedStudents}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Archived</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{archivedStudentsCount}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Search archived students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            value={filterCampus}
                            onChange={(e) => setFilterCampus(e.target.value)}
                        >
                            <option value="all">All Campuses</option>
                            <option value="main">Main Campus</option>
                            <option value="satellite">Satellite Campus</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        >
                            <option value="all">All Years</option>
                            <option value="1st year">1st Year</option>
                            <option value="2nd year">2nd Year</option>
                            <option value="3rd year">3rd Year</option>
                            <option value="4th year">4th Year</option>
                        </select>
                        <select
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            value={filterProgram}
                            onChange={(e) => setFilterProgram(e.target.value)}
                        >
                            <option value="all">All Programs</option>
                            <option value="computer science">Computer Science</option>
                            <option value="engineering">Engineering</option>
                            <option value="business">Business</option>
                            <option value="education">Education</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading archived students...' : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredStudents.length)} of ${filteredStudents.length} archived students`}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campus</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Loading archived students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No archived students found. Try adjusting your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((student, index) => (
                                    <tr key={student.student_uuid || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.year_level}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.program}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.campus}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => openRestoreModal(student)} 
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded transition-colors" 
                                                    title="Restore student"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(student)} 
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors" 
                                                    title="Permanently delete student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Restore Modal */}
            {showRestoreModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Restore Student</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to restore <strong>{studentToRestore?.name}</strong>? This will make them active again.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRestore}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Restore
                            </button>
                            <button
                                onClick={() => setShowRestoreModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Permanently Delete Student</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            This action cannot be undone. This will permanently delete <strong>{studentToDelete?.name}</strong> and all their data.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type "Delete" to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Delete"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmation !== 'Delete'}
                                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Delete Permanently
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200">{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}
        </div>
    );
}

export default ArchivedStudents;
