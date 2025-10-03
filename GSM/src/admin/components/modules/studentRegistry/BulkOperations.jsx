import React from 'react';
import { Users, Upload, Download, Archive, RotateCcw, Trash2, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function BulkOperations() {
    const [selectedStudents, setSelectedStudents] = React.useState(new Set());
    const [students, setStudents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [showBulkArchiveModal, setShowBulkArchiveModal] = React.useState(false);
    const [showBulkRestoreModal, setShowBulkRestoreModal] = React.useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = React.useState(false);
    const [bulkAction, setBulkAction] = React.useState('');
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
    const [importFile, setImportFile] = React.useState(null);
    const [importProgress, setImportProgress] = React.useState(0);

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
                setStudents(mapped);
            } else {
                setError(result.message || 'Failed to fetch students');
            }
        } catch (error) {
            setError('Network error while fetching students');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(students.map(s => s.student_uuid)));
        }
    };

    const handleSelectStudent = (studentUuid) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentUuid)) {
            newSelected.delete(studentUuid);
        } else {
            newSelected.add(studentUuid);
        }
        setSelectedStudents(newSelected);
    };

    const handleBulkAction = (action) => {
        if (selectedStudents.size === 0) {
            setError('Please select at least one student');
            return;
        }
        
        setBulkAction(action);
        switch (action) {
            case 'archive':
                setShowBulkArchiveModal(true);
                break;
            case 'restore':
                setShowBulkRestoreModal(true);
                break;
            case 'delete':
                setShowBulkDeleteModal(true);
                break;
        }
    };

    const executeBulkAction = async () => {
        const selectedStudentList = students.filter(s => selectedStudents.has(s.student_uuid));
        let successCount = 0;
        let errorCount = 0;

        for (const student of selectedStudentList) {
            try {
                let endpoint = '';
                let method = 'POST';
                
                switch (bulkAction) {
                    case 'archive':
                        endpoint = `${getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS)}/${student.student_uuid}`;
                        method = 'DELETE';
                        break;
                    case 'restore':
                        endpoint = getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_RESTORE(student.student_uuid));
                        break;
                    case 'delete':
                        endpoint = getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT_FORCE_DELETE(student.student_uuid));
                        method = 'DELETE';
                        break;
                }

                const token = localStorage.getItem('auth_token');
                const res = await fetch(endpoint, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });
                
                const result = await res.json();
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        }

        setSuccess(`Bulk action completed: ${successCount} successful, ${errorCount} failed`);
        setSelectedStudents(new Set());
        await fetchStudents();
        
        // Close modals
        setShowBulkArchiveModal(false);
        setShowBulkRestoreModal(false);
        setShowBulkDeleteModal(false);
        setBulkAction('');
        setDeleteConfirmation('');
        
        setTimeout(() => setSuccess(''), 5000);
    };

    const handleExport = () => {
        const csvContent = [
            ['Name', 'Student ID', 'Email', 'Year Level', 'Program', 'Campus', 'Status', 'Scholarship Status', 'Enrollment Date'],
            ...students.map(student => [
                student.name,
                student.studentId,
                student.email,
                student.year_level,
                student.program,
                student.campus,
                student.status,
                student.scholarshipStatus,
                new Date(student.enrollmentDate).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_students.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImportFile(file);
            // Simulate import progress
            setImportProgress(0);
            const interval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setSuccess('Students imported successfully!');
                        setTimeout(() => setSuccess(''), 3000);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        }
    };

    const activeStudents = students.filter(s => s.status === 'active');
    const archivedStudents = students.filter(s => s.status === 'archived');
    const scholars = students.filter(s => s.scholarshipStatus === 'scholar');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h1>
                    <p className="text-gray-600 dark:text-gray-400">Perform bulk actions on student records</p>
                </div>
                <div className="flex items-center space-x-3">
                    <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Import CSV</span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileImport}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={handleExport}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export All</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStudents.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{archivedStudents.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scholars</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{scholars.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => handleBulkAction('archive')}
                        disabled={selectedStudents.size === 0}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Archive className="w-4 h-4" />
                        <span>Archive Selected ({selectedStudents.size})</span>
                    </button>
                    <button
                        onClick={() => handleBulkAction('restore')}
                        disabled={selectedStudents.size === 0}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore Selected ({selectedStudents.size})</span>
                    </button>
                    <button
                        onClick={() => handleBulkAction('delete')}
                        disabled={selectedStudents.size === 0}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Selected ({selectedStudents.size})</span>
                    </button>
                </div>
            </div>

            {/* Import Progress */}
            {importFile && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Progress</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Importing {importFile.name}</span>
                            <span>{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${importProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {loading ? 'Loading students...' : `${students.length} students found`}
                        </p>
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {selectedStudents.size === students.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            <span>Select All</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.size === students.length && students.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scholarship</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, index) => (
                                    <tr key={student.student_uuid || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.has(student.student_uuid)}
                                                onChange={() => handleSelectStudent(student.student_uuid)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.studentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                (student.status || '').toLowerCase() === 'active' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                            }`}>
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                (student.scholarshipStatus || '').toLowerCase() === 'scholar' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {(student.scholarshipStatus || '').toLowerCase() === 'scholar' ? 'Scholar' : 'Regular'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Archive Modal */}
            {showBulkArchiveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Archive</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to archive {selectedStudents.size} selected students? This will move them to the archived section.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={executeBulkAction}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Archive Students
                            </button>
                            <button
                                onClick={() => setShowBulkArchiveModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Restore Modal */}
            {showBulkRestoreModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Restore</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to restore {selectedStudents.size} selected students? This will make them active again.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={executeBulkAction}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Restore Students
                            </button>
                            <button
                                onClick={() => setShowBulkRestoreModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Bulk Delete</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            This action cannot be undone. This will permanently delete {selectedStudents.size} selected students and all their data.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type "DELETE" to confirm:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="DELETE"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={executeBulkAction}
                                disabled={deleteConfirmation !== 'DELETE'}
                                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Delete Permanently
                            </button>
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
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

export default BulkOperations;
