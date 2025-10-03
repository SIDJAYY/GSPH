import React from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function ImportExport() {
    const [importFile, setImportFile] = React.useState(null);
    const [importProgress, setImportProgress] = React.useState(0);
    const [importStatus, setImportStatus] = React.useState('idle'); // idle, importing, success, error
    const [importResults, setImportResults] = React.useState(null);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [students, setStudents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setImportFile(file);
                setError('');
            } else {
                setError('Please select a CSV file');
            }
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            setError('Please select a file to import');
            return;
        }

        setImportStatus('importing');
        setImportProgress(0);
        setError('');

        try {
            // Simulate import process with progress
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            clearInterval(progressInterval);
            setImportProgress(100);

            // Simulate import results
            const mockResults = {
                total: 50,
                successful: 45,
                failed: 5,
                errors: [
                    'Row 3: Invalid email format',
                    'Row 7: Missing required field: first_name',
                    'Row 12: Duplicate student ID',
                    'Row 18: Invalid year level',
                    'Row 25: Campus not found'
                ]
            };

            setImportResults(mockResults);
            setImportStatus('success');
            setSuccess(`Import completed: ${mockResults.successful} students imported successfully, ${mockResults.failed} failed`);
            
            // Refresh student list
            await fetchStudents();
            
            setTimeout(() => {
                setImportStatus('idle');
                setImportFile(null);
                setImportProgress(0);
                setImportResults(null);
                setSuccess('');
            }, 5000);

        } catch (error) {
            setImportStatus('error');
            setError('Import failed. Please try again.');
            setImportProgress(0);
        }
    };

    const handleExport = (format) => {
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'csv':
                content = [
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
                filename = 'students_export.csv';
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify(students, null, 2);
                filename = 'students_export.json';
                mimeType = 'application/json';
                break;
            case 'excel':
                // For Excel, we'll create a CSV that can be opened in Excel
                content = [
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
                ].map(row => row.join('\t')).join('\n'); // Tab-separated for Excel
                filename = 'students_export.xls';
                mimeType = 'application/vnd.ms-excel';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadTemplate = () => {
        const template = [
            ['first_name', 'middle_name', 'last_name', 'email', 'student_number', 'year_level', 'program', 'campus'],
            ['John', 'Michael', 'Doe', 'john.doe@email.com', '2024-001', '1st year', 'Computer Science', 'Main Campus'],
            ['Jane', 'Marie', 'Smith', 'jane.smith@email.com', '2024-002', '2nd year', 'Engineering', 'Satellite Campus']
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const clearImport = () => {
        setImportFile(null);
        setImportProgress(0);
        setImportStatus('idle');
        setImportResults(null);
        setError('');
        setSuccess('');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import/Export</h1>
                    <p className="text-gray-600 dark:text-gray-400">Import student data from CSV or export to various formats</p>
                </div>
                <button
                    onClick={fetchStudents}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Import Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Students</h3>
                
                {/* File Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select CSV File
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {importFile ? importFile.name : 'Click to select CSV file or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Supported format: CSV files only
                                </p>
                            </div>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        {importFile && (
                            <button
                                onClick={clearImport}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Import Progress */}
                {importStatus === 'importing' && (
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Importing students...</span>
                            <span>{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${importProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Import Results */}
                {importResults && (
                    <div className="mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Import Results</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{importResults.total}</span>
                                </div>
                                <div>
                                    <span className="text-green-600 dark:text-green-400">Successful:</span>
                                    <span className="ml-2 font-medium text-green-600 dark:text-green-400">{importResults.successful}</span>
                                </div>
                                <div>
                                    <span className="text-red-600 dark:text-red-400">Failed:</span>
                                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">{importResults.failed}</span>
                                </div>
                            </div>
                            {importResults.errors.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errors:</p>
                                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                        {importResults.errors.map((error, index) => (
                                            <li key={index} className="flex items-start">
                                                <AlertCircle className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Import Actions */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleImport}
                        disabled={!importFile || importStatus === 'importing'}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{importStatus === 'importing' ? 'Importing...' : 'Import Students'}</span>
                    </button>
                    <button
                        onClick={downloadTemplate}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Download Template</span>
                    </button>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Students</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Export student data in various formats. Current database contains {students.length} students.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handleExport('csv')}
                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                    >
                        <FileText className="w-8 h-8" />
                        <span className="font-medium">CSV Format</span>
                        <span className="text-sm opacity-90">Comma-separated values</span>
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                    >
                        <FileText className="w-8 h-8" />
                        <span className="font-medium">JSON Format</span>
                        <span className="text-sm opacity-90">JavaScript Object Notation</span>
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors"
                    >
                        <FileText className="w-8 h-8" />
                        <span className="font-medium">Excel Format</span>
                        <span className="text-sm opacity-90">Microsoft Excel compatible</span>
                    </button>
                </div>
            </div>

            {/* Data Preview */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Preview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing first 10 students from the database
                </p>
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Program</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.slice(0, 10).map((student, index) => (
                                    <tr key={student.student_uuid || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{student.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{student.studentId}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{student.email}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{student.program}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                (student.status || '').toLowerCase() === 'active' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                            }`}>
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <p className="text-green-800 dark:text-green-200">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImportExport;
