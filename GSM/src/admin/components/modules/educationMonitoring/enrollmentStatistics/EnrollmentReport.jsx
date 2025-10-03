import React, { useState, useEffect } from 'react';
import { 
    Users, TrendingUp, Calendar, School, BarChart3, 
    Download, Filter, PieChart, Activity, UserPlus 
} from 'lucide-react';
import { getAuthServiceUrl } from '../../../../../config/api';
import { useToastContext } from '../../../../../components/providers/ToastProvider';

function EnrollmentReport() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        yearLevel: 'all',
        program: 'all',
        status: 'all',
        dateRange: 'all'
    });
    const { showSuccess, showError } = useToastContext();

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const response = await fetch(getAuthServiceUrl('/api/students'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            showError('Failed to load student data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getEnrollmentTrends = () => {
        const trends = {};
        students.forEach(student => {
            const month = new Date(student.enrollmentDate || student.created_at).toISOString().slice(0, 7);
            if (!trends[month]) {
                trends[month] = 0;
            }
            trends[month]++;
        });
        return trends;
    };

    const getProgramDistribution = () => {
        const distribution = {};
        students.forEach(student => {
            const program = student.program || 'Unknown';
            distribution[program] = (distribution[program] || 0) + 1;
        });
        return distribution;
    };

    const getYearLevelDistribution = () => {
        const distribution = {};
        students.forEach(student => {
            const year = student.year_level || 'Unknown';
            distribution[year] = (distribution[year] || 0) + 1;
        });
        return distribution;
    };

    const getStatusDistribution = () => {
        const distribution = {};
        students.forEach(student => {
            const status = student.status || 'Unknown';
            distribution[status] = (distribution[status] || 0) + 1;
        });
        return distribution;
    };

    const getRecentEnrollments = () => {
        return students
            .filter(student => {
                const enrollmentDate = new Date(student.enrollmentDate || student.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return enrollmentDate >= thirtyDaysAgo;
            })
            .sort((a, b) => new Date(b.enrollmentDate || b.created_at) - new Date(a.enrollmentDate || a.created_at))
            .slice(0, 10);
    };

    const filteredStudents = students.filter(student => {
        if (filters.yearLevel !== 'all' && student.year_level !== filters.yearLevel) return false;
        if (filters.program !== 'all' && student.program !== filters.program) return false;
        if (filters.status !== 'all' && student.status !== filters.status) return false;
        
        if (filters.dateRange !== 'all') {
            const enrollmentDate = new Date(student.enrollmentDate || student.created_at);
            const now = new Date();
            
            switch (filters.dateRange) {
                case 'last30days':
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    if (enrollmentDate < thirtyDaysAgo) return false;
                    break;
                case 'last90days':
                    const ninetyDaysAgo = new Date();
                    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                    if (enrollmentDate < ninetyDaysAgo) return false;
                    break;
                case 'thisyear':
                    if (enrollmentDate.getFullYear() !== now.getFullYear()) return false;
                    break;
            }
        }
        
        return true;
    });

    const enrollmentTrends = getEnrollmentTrends();
    const programDistribution = getProgramDistribution();
    const yearLevelDistribution = getYearLevelDistribution();
    const statusDistribution = getStatusDistribution();
    const recentEnrollments = getRecentEnrollments();

    const exportReport = () => {
        try {
            // Create enrollment statistics summary
            const enrollmentStats = [
                { 'Metric': 'Total Students', 'Value': filteredStudents.length },
                { 'Metric': 'Active Students', 'Value': filteredStudents.filter(s => s.status === 'active').length },
                { 'Metric': 'Graduated Students', 'Value': filteredStudents.filter(s => s.status === 'graduated').length },
                { 'Metric': 'Inactive Students', 'Value': filteredStudents.filter(s => s.status !== 'active' && s.status !== 'graduated').length },
                { 'Metric': 'Enrollment Rate', 'Value': `${((filteredStudents.filter(s => s.status === 'active').length / filteredStudents.length) * 100).toFixed(1)}%` },
                { 'Metric': 'Graduation Rate', 'Value': `${((filteredStudents.filter(s => s.status === 'graduated').length / filteredStudents.length) * 100).toFixed(1)}%` },
                { 'Metric': 'Report Generated', 'Value': new Date().toLocaleDateString() },
                { 'Metric': 'Report Type', 'Value': 'Enrollment Statistics Analysis' }
            ];

            // Create program distribution analysis
            const programDistribution = getProgramDistribution();
            const programStats = Object.entries(programDistribution).map(([program, count]) => ({
                'Program': program,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`,
                'Active Students': filteredStudents.filter(s => s.program === program && s.status === 'active').length,
                'Graduated Students': filteredStudents.filter(s => s.program === program && s.status === 'graduated').length
            }));

            // Create year level distribution analysis
            const yearLevelDistribution = getYearLevelDistribution();
            const yearLevelStats = Object.entries(yearLevelDistribution).map(([yearLevel, count]) => ({
                'Year Level': yearLevel,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`,
                'Active Students': filteredStudents.filter(s => s.year_level === yearLevel && s.status === 'active').length,
                'Graduated Students': filteredStudents.filter(s => s.year_level === yearLevel && s.status === 'graduated').length
            }));

            // Create status distribution analysis
            const statusDistribution = getStatusDistribution();
            const statusStats = Object.entries(statusDistribution).map(([status, count]) => ({
                'Status': status,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`
            }));

            const csvContent = [
                'ENROLLMENT STATISTICS REPORT',
                '',
                'ENROLLMENT SUMMARY',
                Object.keys(enrollmentStats[0]).join(','),
                ...enrollmentStats.map(row => Object.values(row).join(',')),
                '',
                'PROGRAM DISTRIBUTION ANALYSIS',
                Object.keys(programStats[0]).join(','),
                ...programStats.map(row => Object.values(row).join(',')),
                '',
                'YEAR LEVEL DISTRIBUTION ANALYSIS',
                Object.keys(yearLevelStats[0]).join(','),
                ...yearLevelStats.map(row => Object.values(row).join(',')),
                '',
                'STATUS DISTRIBUTION ANALYSIS',
                Object.keys(statusStats[0]).join(','),
                ...statusStats.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enrollment_statistics_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            showSuccess('Enrollment statistics report exported successfully!');
        } catch (error) {
            console.error('Error exporting report:', error);
            showError('Failed to export report. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Enrollment Statistics Report</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Comprehensive analysis of student enrollment patterns and trends
                        </p>
                    </div>
                    <button 
                        onClick={exportReport}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 mt-4 lg:mt-0"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Year Level</label>
                        <select 
                            value={filters.yearLevel}
                            onChange={(e) => setFilters({...filters, yearLevel: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="all">All Year Levels</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Program</label>
                        <select 
                            value={filters.program}
                            onChange={(e) => setFilters({...filters, program: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="all">All Programs</option>
                            {Object.keys(programDistribution).map(program => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <select 
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
                        <select 
                            value={filters.dateRange}
                            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="all">All Time</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="last90days">Last 90 Days</option>
                            <option value="thisyear">This Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Enrollments</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredStudents.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Students</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {filteredStudents.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Enrollments</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{recentEnrollments.length}</p>
                        </div>
                        <UserPlus className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Programs</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{Object.keys(programDistribution).length}</p>
                        </div>
                        <School className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Program Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Enrollment by Program</h3>
                <div className="space-y-3">
                    {Object.entries(programDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([program, count]) => (
                        <div key={program} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{program}</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ 
                                            width: `${filteredStudents.length > 0 ? (count / filteredStudents.length) * 100 : 0}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-8">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Year Level Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Enrollment by Year Level</h3>
                <div className="space-y-3">
                    {Object.entries(yearLevelDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([year, count]) => (
                        <div key={year} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{year}</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ 
                                            width: `${filteredStudents.length > 0 ? (count / filteredStudents.length) * 100 : 0}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-8">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Enrollment Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(statusDistribution).map(([status, count]) => {
                        const colorClasses = {
                            'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                            'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                            'inactive': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        };
                        return (
                            <div key={status} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{status}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[status] || 'bg-slate-100 text-slate-800'}`}>
                                        {count}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                        <div 
                                            className="bg-orange-500 h-2 rounded-full" 
                                            style={{ 
                                                width: `${filteredStudents.length > 0 ? (count / filteredStudents.length) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Enrollments (Last 30 Days)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Student</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Program</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Year Level</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Enrollment Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEnrollments.map((student) => (
                                <tr key={student.student_id} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="py-3 px-4 text-sm text-slate-800 dark:text-white">{student.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.program || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.year_level || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{student.status}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(student.enrollmentDate || student.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EnrollmentReport;
