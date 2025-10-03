import React from 'react';
import { BarChart3, PieChart, TrendingUp, Users, GraduationCap, Download, Calendar, Filter } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function ReportsAnalytics() {
    const [students, setStudents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [dateRange, setDateRange] = React.useState('all');
    const [campusFilter, setCampusFilter] = React.useState('all');
    const [programFilter, setProgramFilter] = React.useState('all');

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
        let scholarshipType = 'Unknown';
        let scholarshipAmount = 0;
        if (Array.isArray(s.scholarships) && s.scholarships.length > 0) {
            const latest = s.scholarships[0];
            scholarshipStatus = (latest.status || '').toLowerCase() === 'awarded' ? 'scholar' : 'applicant';
            scholarshipType = latest.type || latest.scholarship_type || 'Unknown';
            scholarshipAmount = latest.amount || latest.scholarship_amount || 0;
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
            scholarshipType,
            scholarshipAmount,
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

    // Filter students based on selected filters
    const filteredStudents = students.filter(student => {
        const matchesCampus = campusFilter === 'all' || (student.campus || '').toLowerCase() === campusFilter.toLowerCase();
        const matchesProgram = programFilter === 'all' || (student.program || '').toLowerCase().includes(programFilter.toLowerCase());
        
        let matchesDateRange = true;
        if (dateRange !== 'all') {
            const now = new Date();
            const studentDate = new Date(student.enrollmentDate);
            const daysDiff = Math.floor((now - studentDate) / (1000 * 60 * 60 * 24));
            
            switch (dateRange) {
                case '7days':
                    matchesDateRange = daysDiff <= 7;
                    break;
                case '30days':
                    matchesDateRange = daysDiff <= 30;
                    break;
                case '90days':
                    matchesDateRange = daysDiff <= 90;
                    break;
                case '1year':
                    matchesDateRange = daysDiff <= 365;
                    break;
            }
        }
        
        return matchesCampus && matchesProgram && matchesDateRange;
    });

    // Calculate statistics
    const totalStudents = filteredStudents.length;
    const activeStudents = filteredStudents.filter(s => s.status === 'active').length;
    const archivedStudents = filteredStudents.filter(s => s.status === 'archived').length;
    const scholars = filteredStudents.filter(s => s.scholarshipStatus === 'scholar').length;
    const regularStudents = activeStudents - scholars;

    // Program distribution
    const programDistribution = filteredStudents.reduce((acc, student) => {
        const program = student.program || 'Unknown';
        acc[program] = (acc[program] || 0) + 1;
        return acc;
    }, {});

    // Campus distribution
    const campusDistribution = filteredStudents.reduce((acc, student) => {
        const campus = student.campus || 'Unknown';
        acc[campus] = (acc[campus] || 0) + 1;
        return acc;
    }, {});

    // Year level distribution
    const yearLevelDistribution = filteredStudents.reduce((acc, student) => {
        const yearLevel = student.year_level || 'Unknown';
        acc[yearLevel] = (acc[yearLevel] || 0) + 1;
        return acc;
    }, {});

    // Scholarship type distribution
    const scholarshipTypeDistribution = filteredStudents
        .filter(s => s.scholarshipStatus === 'scholar')
        .reduce((acc, student) => {
            const type = student.scholarshipType || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

    // Monthly enrollment trends (last 12 months)
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        
        const count = filteredStudents.filter(student => {
            const studentDate = new Date(student.enrollmentDate);
            return studentDate.toISOString().slice(0, 7) === monthKey;
        }).length;
        
        return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count
        };
    }).reverse();

    const handleExportReport = (type) => {
        let csvContent = [];
        let filename = '';
        
        switch (type) {
            case 'overview':
                csvContent = [
                    ['Metric', 'Value'],
                    ['Total Students', totalStudents],
                    ['Active Students', activeStudents],
                    ['Archived Students', archivedStudents],
                    ['Scholars', scholars],
                    ['Regular Students', regularStudents]
                ];
                filename = 'student_overview_report.csv';
                break;
            case 'programs':
                csvContent = [
                    ['Program', 'Count', 'Percentage'],
                    ...Object.entries(programDistribution).map(([program, count]) => [
                        program,
                        count,
                        ((count / totalStudents) * 100).toFixed(2) + '%'
                    ])
                ];
                filename = 'program_distribution_report.csv';
                break;
            case 'campuses':
                csvContent = [
                    ['Campus', 'Count', 'Percentage'],
                    ...Object.entries(campusDistribution).map(([campus, count]) => [
                        campus,
                        count,
                        ((count / totalStudents) * 100).toFixed(2) + '%'
                    ])
                ];
                filename = 'campus_distribution_report.csv';
                break;
            case 'scholarships':
                csvContent = [
                    ['Scholarship Type', 'Count', 'Percentage'],
                    ...Object.entries(scholarshipTypeDistribution).map(([type, count]) => [
                        type,
                        count,
                        ((count / scholars) * 100).toFixed(2) + '%'
                    ])
                ];
                filename = 'scholarship_distribution_report.csv';
                break;
        }
        
        const csvString = csvContent.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-gray-600 dark:text-gray-400">Comprehensive student data analysis and reporting</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => handleExportReport('overview')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Overview</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Time</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="1year">Last Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campus</label>
                        <select
                            value={campusFilter}
                            onChange={(e) => setCampusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Campuses</option>
                            <option value="main">Main Campus</option>
                            <option value="satellite">Satellite Campus</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
                        <select
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStudents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scholars</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{scholars}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Regular Students</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{regularStudents}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Program Distribution</h3>
                        <button
                            onClick={() => handleExportReport('programs')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(programDistribution).map(([program, count]) => {
                            const percentage = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : 0;
                            return (
                                <div key={program} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{program}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Campus Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campus Distribution</h3>
                        <button
                            onClick={() => handleExportReport('campuses')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(campusDistribution).map(([campus, count]) => {
                            const percentage = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : 0;
                            return (
                                <div key={campus} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{campus}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Scholarship Distribution */}
            {scholars > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scholarship Type Distribution</h3>
                        <button
                            onClick={() => handleExportReport('scholarships')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(scholarshipTypeDistribution).map(([type, count]) => {
                            const percentage = scholars > 0 ? ((count / scholars) * 100).toFixed(1) : 0;
                            return (
                                <div key={type} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{type}</span>
                                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{count}</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div 
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Monthly Trends */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Enrollment Trends</h3>
                <div className="space-y-2">
                    {monthlyTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{trend.month}</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${Math.max(5, (trend.count / Math.max(...monthlyTrends.map(t => t.count), 1)) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                                    {trend.count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}
        </div>
    );
}

export default ReportsAnalytics;
