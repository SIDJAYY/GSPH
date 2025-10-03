import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, User, BookOpen, Award, Calendar, 
    Download, Filter, BarChart3, Activity, Target 
} from 'lucide-react';
import { getAuthServiceUrl } from '../../../../../config/api';
import { useToastContext } from '../../../../../components/providers/ToastProvider';

function StudentProgressReport() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [filters, setFilters] = useState({
        yearLevel: 'all',
        program: 'all',
        progressStatus: 'all'
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

    const calculateGPA = (grades) => {
        if (!grades || grades.length === 0) return 0;
        const numericGrades = grades
            .map(grade => parseFloat(grade.grade))
            .filter(grade => !isNaN(grade));
        
        if (numericGrades.length === 0) return 0;
        return (numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length).toFixed(2);
    };

    const getProgressStatus = (student) => {
        const gpa = parseFloat(calculateGPA(student.grades));
        const totalGrades = student.grades ? student.grades.length : 0;
        
        if (totalGrades === 0) return 'No Data';
        if (gpa >= 90) return 'Excellent';
        if (gpa >= 80) return 'Good';
        if (gpa >= 70) return 'Satisfactory';
        if (gpa >= 60) return 'Needs Improvement';
        return 'At Risk';
    };

    const getProgressColor = (status) => {
        switch (status) {
            case 'Excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'Good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Satisfactory': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Needs Improvement': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
            case 'At Risk': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400';
        }
    };

    const getRecentGrades = (student) => {
        if (!student.grades || student.grades.length === 0) return [];
        return student.grades
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
    };

    const getGradeTrend = (student) => {
        if (!student.grades || student.grades.length < 2) return 'stable';
        
        const recentGrades = student.grades
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .slice(-3)
            .map(grade => parseFloat(grade.grade))
            .filter(grade => !isNaN(grade));
        
        if (recentGrades.length < 2) return 'stable';
        
        const firstHalf = recentGrades.slice(0, Math.ceil(recentGrades.length / 2));
        const secondHalf = recentGrades.slice(Math.ceil(recentGrades.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, grade) => sum + grade, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, grade) => sum + grade, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 5) return 'improving';
        if (secondAvg < firstAvg - 5) return 'declining';
        return 'stable';
    };

    const getProgressStats = () => {
        const stats = {
            total: students.length,
            excellent: 0,
            good: 0,
            satisfactory: 0,
            needsImprovement: 0,
            atRisk: 0,
            noData: 0
        };

        students.forEach(student => {
            const status = getProgressStatus(student);
            stats[status.toLowerCase().replace(' ', '')]++;
        });

        return stats;
    };

    const filteredStudents = students.filter(student => {
        if (filters.yearLevel !== 'all' && student.year_level !== filters.yearLevel) return false;
        if (filters.program !== 'all' && student.program !== filters.program) return false;
        if (filters.progressStatus !== 'all') {
            const status = getProgressStatus(student);
            if (filters.progressStatus === 'excellent' && status !== 'Excellent') return false;
            if (filters.progressStatus === 'good' && status !== 'Good') return false;
            if (filters.progressStatus === 'satisfactory' && status !== 'Satisfactory') return false;
            if (filters.progressStatus === 'needs_improvement' && status !== 'Needs Improvement') return false;
            if (filters.progressStatus === 'at_risk' && status !== 'At Risk') return false;
            if (filters.progressStatus === 'no_data' && status !== 'No Data') return false;
        }
        return true;
    });

    const progressStats = getProgressStats();

    const exportReport = () => {
        try {
            // Create progress tracking summary
            const progressStats = getProgressStats();
            const progressSummary = [
                { 'Metric': 'Total Students', 'Value': filteredStudents.length },
                { 'Metric': 'On Track Students', 'Value': progressStats.onTrack },
                { 'Metric': 'At Risk Students', 'Value': progressStats.atRisk },
                { 'Metric': 'Needs Attention Students', 'Value': progressStats.needsAttention },
                { 'Metric': 'Average GPA', 'Value': (filteredStudents.reduce((sum, s) => sum + calculateGPA(s.grades), 0) / filteredStudents.length).toFixed(2) },
                { 'Metric': 'Report Generated', 'Value': new Date().toLocaleDateString() },
                { 'Metric': 'Report Type', 'Value': 'Student Progress Tracking Analysis' }
            ];

            // Create progress status distribution
            const progressStatusDistribution = {
                'On Track': filteredStudents.filter(s => getProgressStatus(s) === 'On Track').length,
                'At Risk': filteredStudents.filter(s => getProgressStatus(s) === 'At Risk').length,
                'Needs Attention': filteredStudents.filter(s => getProgressStatus(s) === 'Needs Attention').length
            };

            const progressStatusStats = Object.entries(progressStatusDistribution).map(([status, count]) => ({
                'Progress Status': status,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`
            }));

            // Create grade trend analysis
            const gradeTrendDistribution = {
                'Improving': filteredStudents.filter(s => getGradeTrend(s) === 'Improving').length,
                'Declining': filteredStudents.filter(s => getGradeTrend(s) === 'Declining').length,
                'Stable': filteredStudents.filter(s => getGradeTrend(s) === 'Stable').length,
                'Insufficient Data': filteredStudents.filter(s => getGradeTrend(s) === 'Insufficient Data').length
            };

            const gradeTrendStats = Object.entries(gradeTrendDistribution).map(([trend, count]) => ({
                'Grade Trend': trend,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`
            }));

            // Create performance level analysis
            const performanceDistribution = {
                'Excellent (3.5+)': filteredStudents.filter(s => calculateGPA(s.grades) >= 3.5).length,
                'Good (3.0-3.4)': filteredStudents.filter(s => calculateGPA(s.grades) >= 3.0 && calculateGPA(s.grades) < 3.5).length,
                'Satisfactory (2.5-2.9)': filteredStudents.filter(s => calculateGPA(s.grades) >= 2.5 && calculateGPA(s.grades) < 3.0).length,
                'Needs Improvement (<2.5)': filteredStudents.filter(s => calculateGPA(s.grades) < 2.5).length
            };

            const performanceStats = Object.entries(performanceDistribution).map(([level, count]) => ({
                'Performance Level': level,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`
            }));

            const csvContent = [
                'STUDENT PROGRESS TRACKING REPORT',
                '',
                'PROGRESS SUMMARY',
                Object.keys(progressSummary[0]).join(','),
                ...progressSummary.map(row => Object.values(row).join(',')),
                '',
                'PROGRESS STATUS DISTRIBUTION',
                Object.keys(progressStatusStats[0]).join(','),
                ...progressStatusStats.map(row => Object.values(row).join(',')),
                '',
                'GRADE TREND ANALYSIS',
                Object.keys(gradeTrendStats[0]).join(','),
                ...gradeTrendStats.map(row => Object.values(row).join(',')),
                '',
                'PERFORMANCE LEVEL ANALYSIS',
                Object.keys(performanceStats[0]).join(','),
                ...performanceStats.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_progress_tracking_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            showSuccess('Student progress tracking report exported successfully!');
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
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Progress Report</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Track individual student academic progress and performance trends
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            {[...new Set(students.map(s => s.program).filter(Boolean))].map(program => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Progress Status</label>
                        <select 
                            value={filters.progressStatus}
                            onChange={(e) => setFilters({...filters, progressStatus: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="satisfactory">Satisfactory</option>
                            <option value="needs_improvement">Needs Improvement</option>
                            <option value="at_risk">At Risk</option>
                            <option value="no_data">No Data</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progressStats.total}</p>
                        </div>
                        <User className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Excellent Progress</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progressStats.excellent}</p>
                        </div>
                        <Award className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">At Risk</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progressStats.atRisk}</p>
                        </div>
                        <Target className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No Data</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{progressStats.noData}</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Progress Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Progress Status Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { status: 'Excellent', count: progressStats.excellent, color: 'green' },
                        { status: 'Good', count: progressStats.good, color: 'blue' },
                        { status: 'Satisfactory', count: progressStats.satisfactory, color: 'yellow' },
                        { status: 'Needs Improvement', count: progressStats.needsImprovement, color: 'orange' },
                        { status: 'At Risk', count: progressStats.atRisk, color: 'red' },
                        { status: 'No Data', count: progressStats.noData, color: 'slate' }
                    ].map(({ status, count, color }) => {
                        const colorClasses = {
                            green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                            orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                            red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                            slate: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                        };
                        return (
                            <div key={status} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
                                        {count}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                        <div 
                                            className={`bg-${color}-500 h-2 rounded-full`}
                                            style={{ 
                                                width: `${progressStats.total > 0 ? (count / progressStats.total) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Student Progress List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Student Progress Details</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Student</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Program</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">GPA</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Trend</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Grades</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => {
                                const status = getProgressStatus(student);
                                const trend = getGradeTrend(student);
                                const gpa = calculateGPA(student.grades);
                                const recentGrades = getRecentGrades(student);
                                
                                return (
                                    <tr key={student.student_id} className="border-b border-slate-100 dark:border-slate-700">
                                        <td className="py-3 px-4 text-sm text-slate-800 dark:text-white">{student.name}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.program || 'N/A'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{gpa}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                                            <div className="flex items-center space-x-1">
                                                {trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                                {trend === 'declining' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                                                {trend === 'stable' && <Activity className="w-4 h-4 text-slate-500" />}
                                                <span>{trend}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                                            {student.grades ? student.grades.length : 0}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <button 
                                                onClick={() => setSelectedStudent(student)}
                                                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                {selectedStudent.name} - Progress Details
                            </h3>
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Program</p>
                                    <p className="text-slate-800 dark:text-white">{selectedStudent.program || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Year Level</p>
                                    <p className="text-slate-800 dark:text-white">{selectedStudent.year_level || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">GPA</p>
                                    <p className="text-slate-800 dark:text-white">{calculateGPA(selectedStudent.grades)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(getProgressStatus(selectedStudent))}`}>
                                        {getProgressStatus(selectedStudent)}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-md font-semibold text-slate-800 dark:text-white mb-2">Recent Grades</h4>
                                <div className="space-y-2">
                                    {getRecentGrades(selectedStudent).map((grade, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{grade.course_code}</span>
                                            <span className="text-sm font-medium text-slate-800 dark:text-white">{grade.grade}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{grade.term}</span>
                                        </div>
                                    ))}
                                    {getRecentGrades(selectedStudent).length === 0 && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No grades available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentProgressReport;
