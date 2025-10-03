import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, Award, BookOpen, 
    Download, Filter, Calendar, AlertCircle, CheckCircle 
} from 'lucide-react';
import { getAuthServiceUrl } from '../../../../../config/api';
import { useToastContext } from '../../../../../components/providers/ToastProvider';

function AcademicPerformanceReport() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        yearLevel: 'all',
        program: 'all',
        status: 'all'
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

    const getGradeDistribution = () => {
        const distribution = {
            'A (90-100)': 0,
            'B (80-89)': 0,
            'C (70-79)': 0,
            'D (60-69)': 0,
            'F (Below 60)': 0
        };

        students.forEach(student => {
            if (student.grades && student.grades.length > 0) {
                const gpa = parseFloat(calculateGPA(student.grades));
                if (gpa >= 90) distribution['A (90-100)']++;
                else if (gpa >= 80) distribution['B (80-89)']++;
                else if (gpa >= 70) distribution['C (70-79)']++;
                else if (gpa >= 60) distribution['D (60-69)']++;
                else distribution['F (Below 60)']++;
            }
        });

        return distribution;
    };

    const getProgramStats = () => {
        const programStats = {};
        students.forEach(student => {
            const program = student.program || 'Unknown';
            if (!programStats[program]) {
                programStats[program] = {
                    total: 0,
                    withGrades: 0,
                    averageGPA: 0,
                    totalGPA: 0
                };
            }
            programStats[program].total++;
            
            if (student.grades && student.grades.length > 0) {
                programStats[program].withGrades++;
                const gpa = parseFloat(calculateGPA(student.grades));
                programStats[program].totalGPA += gpa;
            }
        });

        // Calculate averages
        Object.keys(programStats).forEach(program => {
            if (programStats[program].withGrades > 0) {
                programStats[program].averageGPA = (programStats[program].totalGPA / programStats[program].withGrades).toFixed(2);
            }
        });

        return programStats;
    };

    const getYearLevelStats = () => {
        const yearStats = {};
        students.forEach(student => {
            const year = student.year_level || 'Unknown';
            if (!yearStats[year]) {
                yearStats[year] = {
                    total: 0,
                    withGrades: 0,
                    averageGPA: 0,
                    totalGPA: 0
                };
            }
            yearStats[year].total++;
            
            if (student.grades && student.grades.length > 0) {
                yearStats[year].withGrades++;
                const gpa = parseFloat(calculateGPA(student.grades));
                yearStats[year].totalGPA += gpa;
            }
        });

        // Calculate averages
        Object.keys(yearStats).forEach(year => {
            if (yearStats[year].withGrades > 0) {
                yearStats[year].averageGPA = (yearStats[year].totalGPA / yearStats[year].withGrades).toFixed(2);
            }
        });

        return yearStats;
    };

    const getGradeTrend = (student) => {
        if (!student.grades || student.grades.length < 2) return 'Insufficient Data';
        
        const recentGrades = student.grades.slice(-3); // Last 3 grades
        const firstGrade = parseFloat(recentGrades[0].grade);
        const lastGrade = parseFloat(recentGrades[recentGrades.length - 1].grade);
        
        if (lastGrade > firstGrade) return 'Improving';
        if (lastGrade < firstGrade) return 'Declining';
        return 'Stable';
    };

    const filteredStudents = students.filter(student => {
        if (filters.yearLevel !== 'all' && student.year_level !== filters.yearLevel) return false;
        if (filters.program !== 'all' && student.program !== filters.program) return false;
        if (filters.status !== 'all' && student.status !== filters.status) return false;
        return true;
    });

    const gradeDistribution = getGradeDistribution();
    const programStats = getProgramStats();
    const yearLevelStats = getYearLevelStats();

    const exportReport = () => {
        try {
            // Create academic performance summary
            const performanceSummary = [
                { 'Metric': 'Total Students', 'Value': filteredStudents.length },
                { 'Metric': 'Average GPA', 'Value': (filteredStudents.reduce((sum, s) => sum + calculateGPA(s.grades), 0) / filteredStudents.length).toFixed(2) },
                { 'Metric': 'Excellent Students (3.5+)', 'Value': filteredStudents.filter(s => calculateGPA(s.grades) >= 3.5).length },
                { 'Metric': 'Good Students (3.0-3.4)', 'Value': filteredStudents.filter(s => calculateGPA(s.grades) >= 3.0 && calculateGPA(s.grades) < 3.5).length },
                { 'Metric': 'Satisfactory Students (2.5-2.9)', 'Value': filteredStudents.filter(s => calculateGPA(s.grades) >= 2.5 && calculateGPA(s.grades) < 3.0).length },
                { 'Metric': 'Needs Improvement (<2.5)', 'Value': filteredStudents.filter(s => calculateGPA(s.grades) < 2.5).length },
                { 'Metric': 'Report Generated', 'Value': new Date().toLocaleDateString() },
                { 'Metric': 'Report Type', 'Value': 'Academic Performance Analysis' }
            ];

            // Create grade distribution analysis
            const gradeDistribution = getGradeDistribution();
            const gradeStats = Object.entries(gradeDistribution).map(([gradeRange, count]) => ({
                'Grade Range': gradeRange,
                'Student Count': count,
                'Percentage': `${((count / filteredStudents.length) * 100).toFixed(1)}%`
            }));

            // Create program performance analysis
            const programStats = getProgramStats();
            const programPerformance = Object.entries(programStats).map(([program, stats]) => ({
                'Program': program,
                'Total Students': stats.total,
                'Students with Grades': stats.withGrades,
                'Average GPA': stats.averageGPA || '0.00'
            }));

            // Create year level performance analysis
            const yearLevelStats = getYearLevelStats();
            const yearLevelPerformance = Object.entries(yearLevelStats).map(([yearLevel, stats]) => ({
                'Year Level': yearLevel,
                'Total Students': stats.total,
                'Students with Grades': stats.withGrades,
                'Average GPA': stats.averageGPA || '0.00'
            }));

            const csvContent = [
                'ACADEMIC PERFORMANCE REPORT',
                '',
                'PERFORMANCE SUMMARY',
                Object.keys(performanceSummary[0]).join(','),
                ...performanceSummary.map(row => Object.values(row).join(',')),
                '',
                'GRADE DISTRIBUTION ANALYSIS',
                Object.keys(gradeStats[0]).join(','),
                ...gradeStats.map(row => Object.values(row).join(',')),
                '',
                'PROGRAM PERFORMANCE ANALYSIS',
                Object.keys(programPerformance[0]).join(','),
                ...programPerformance.map(row => Object.values(row).join(',')),
                '',
                'YEAR LEVEL PERFORMANCE ANALYSIS',
                Object.keys(yearLevelPerformance[0]).join(','),
                ...yearLevelPerformance.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `academic_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            showSuccess('Academic performance report exported successfully!');
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
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Performance Report</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Comprehensive analysis of student academic performance and progress
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
                            {Object.keys(programStats).map(program => (
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
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{filteredStudents.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">With Grades</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {filteredStudents.filter(s => s.grades && s.grades.length > 0).length}
                            </p>
                        </div>
                        <BookOpen className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average GPA</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {(() => {
                                    const studentsWithGrades = filteredStudents.filter(s => s.grades && s.grades.length > 0);
                                    if (studentsWithGrades.length === 0) return '0.00';
                                    const totalGPA = studentsWithGrades.reduce((sum, s) => sum + parseFloat(calculateGPA(s.grades)), 0);
                                    return (totalGPA / studentsWithGrades.length).toFixed(2);
                                })()}
                            </p>
                        </div>
                        <Award className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Passing Rate</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {(() => {
                                    const studentsWithGrades = filteredStudents.filter(s => s.grades && s.grades.length > 0);
                                    if (studentsWithGrades.length === 0) return '0%';
                                    const passingStudents = studentsWithGrades.filter(s => parseFloat(calculateGPA(s.grades)) >= 70).length;
                                    return `${((passingStudents / studentsWithGrades.length) * 100).toFixed(1)}%`;
                                })()}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Grade Distribution</h3>
                <div className="space-y-3">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                        <div key={grade} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{grade}</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                        className="bg-orange-500 h-2 rounded-full" 
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

            {/* Program Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance by Program</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Program</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">With Grades</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Average GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(programStats).map(([program, stats]) => (
                                <tr key={program} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="py-3 px-4 text-sm text-slate-800 dark:text-white">{program}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.total}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.withGrades}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.averageGPA}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Year Level Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance by Year Level</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Year Level</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">With Grades</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Average GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(yearLevelStats).map(([year, stats]) => (
                                <tr key={year} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="py-3 px-4 text-sm text-slate-800 dark:text-white">{year}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.total}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.withGrades}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{stats.averageGPA}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AcademicPerformanceReport;
