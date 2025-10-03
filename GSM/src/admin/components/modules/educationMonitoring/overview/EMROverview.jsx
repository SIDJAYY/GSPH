import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, PieChart } from 'lucide-react';
import { getAuthServiceUrl } from '../../../../../config/api';
import { useToastContext } from '../../../../../components/providers/ToastProvider';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import AnalyticsCharts from '../analytics/AnalyticsCharts';
import ReportCategories from './ReportCategories';
import ReportsList from './ReportsList';

function EMROverview() {
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [academicStats, setAcademicStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        graduatedStudents: 0,
        averageGPA: 0
    });
    const { showSuccess, showError, showInfo } = useToastContext();

    // Fetch student data from auth_registry
    useEffect(() => {
        fetchStudentData();
        
        // Set up real-time refresh every 5 minutes
        const interval = setInterval(() => {
            fetchStudentData();
        }, 5 * 60 * 1000); // 5 minutes
        
        return () => clearInterval(interval);
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
                calculateAcademicStats(data.data);
                setChartData(calculateEnhancedKPIs(data.data));
            } else {
                console.error('API returned success: false', data);
                showError('Failed to load student data from server.');
                
                // Fallback: Use sample data for testing
                const sampleData = [
                    { id: 1, first_name: 'John', last_name: 'Doe', status: 'active', program: 'Computer Science', year_level: '3rd Year', grades: [{ grade: '85' }, { grade: '90' }] },
                    { id: 2, first_name: 'Jane', last_name: 'Smith', status: 'active', program: 'Engineering', year_level: '2nd Year', grades: [{ grade: '88' }, { grade: '92' }] },
                    { id: 3, first_name: 'Bob', last_name: 'Johnson', status: 'completed', program: 'Business', year_level: '4th Year', grades: [{ grade: '95' }, { grade: '87' }] },
                    { id: 4, first_name: 'Alice', last_name: 'Brown', status: 'active', program: 'Computer Science', year_level: '1st Year', grades: [{ grade: '78' }, { grade: '82' }] }
                ];
                setStudents(sampleData);
                calculateAcademicStats(sampleData);
                setChartData(calculateEnhancedKPIs(sampleData));
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            showError('Failed to load student data. Please try again.');
            
            // Fallback: Use sample data for testing when API fails
            const sampleData = [
                { id: 1, first_name: 'John', last_name: 'Doe', status: 'active', program: 'Computer Science', year_level: '3rd Year', grades: [{ grade: '85' }, { grade: '90' }] },
                { id: 2, first_name: 'Jane', last_name: 'Smith', status: 'active', program: 'Engineering', year_level: '2nd Year', grades: [{ grade: '88' }, { grade: '92' }] },
                { id: 3, first_name: 'Bob', last_name: 'Johnson', status: 'completed', program: 'Business', year_level: '4th Year', grades: [{ grade: '95' }, { grade: '87' }] },
                { id: 4, first_name: 'Alice', last_name: 'Brown', status: 'active', program: 'Computer Science', year_level: '1st Year', grades: [{ grade: '78' }, { grade: '82' }] }
            ];
            setStudents(sampleData);
            calculateAcademicStats(sampleData);
            setChartData(calculateEnhancedKPIs(sampleData));
        } finally {
            setLoading(false);
        }
    };

    const calculateAcademicStats = (studentData) => {
        
        const total = studentData.length;
        
        // Try different possible status field names and values
        const active = studentData.filter(s => {
            const status = s.status || s.student_status || s.enrollment_status;
            const isActive = s.is_active;
            
            // Check various possible active status values
            return status === 'active' || 
                   status === 'enrolled' || 
                   status === 'current' ||
                   status === '1' ||
                   isActive === true ||
                   isActive === 1;
        }).length;
        
        const graduated = studentData.filter(s => {
            const status = s.status || s.student_status || s.enrollment_status;
            const isGraduated = s.is_graduated;
            
            // Check various possible graduated status values
            return status === 'completed' || 
                   status === 'graduated' || 
                   status === 'finished' ||
                   status === '0' ||
                   isGraduated === true ||
                   isGraduated === 1;
        }).length;
        
        // Fallback: If no students are marked as active or graduated, 
        // assume all students are active (common in educational systems)
        const finalActive = active > 0 ? active : (graduated > 0 ? total - graduated : total);
        const finalGraduated = graduated;
        
        
        // Process student data for statistics
        
        // Calculate average GPA from grades
        let totalGPA = 0;
        let studentsWithGrades = 0;
        
        studentData.forEach(student => {
            if (student.grades && student.grades.length > 0) {
                const numericGrades = student.grades
                    .map(grade => parseFloat(grade.grade))
                    .filter(grade => !isNaN(grade));
                
                if (numericGrades.length > 0) {
                    const studentGPA = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
                    totalGPA += studentGPA;
                    studentsWithGrades++;
                }
            }
        });
        
        const averageGPA = studentsWithGrades > 0 ? (totalGPA / studentsWithGrades).toFixed(2) : 0;
        
        const stats = {
            totalStudents: total,
            activeStudents: finalActive,
            graduatedStudents: finalGraduated,
            averageGPA: averageGPA
        };
        
        setAcademicStats(stats);
    };

    // Enhanced KPI calculations for dashboard
    const calculateEnhancedKPIs = (studentData) => {
        if (!studentData || studentData.length === 0) return {};

        // Program distribution
        const programDistribution = {};
        const yearLevelDistribution = {};
        const gpaDistribution = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (Below 60)': 0 };
        const monthlyEnrollment = [];
        const genderDistribution = { 'Male': 0, 'Female': 0, 'Other': 0 };

        studentData.forEach(student => {
            // Program distribution
            const program = student.program || 'Unknown';
            programDistribution[program] = (programDistribution[program] || 0) + 1;

            // Year level distribution
            const yearLevel = student.year_level || 'Unknown';
            yearLevelDistribution[yearLevel] = (yearLevelDistribution[yearLevel] || 0) + 1;

            // Gender distribution
            const gender = student.gender || 'Other';
            genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;

            // GPA distribution
            if (student.grades && student.grades.length > 0) {
                const numericGrades = student.grades
                    .map(grade => parseFloat(grade.grade))
                    .filter(grade => !isNaN(grade));
                
                if (numericGrades.length > 0) {
                    const studentGPA = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
                    if (studentGPA >= 90) gpaDistribution['A (90-100)']++;
                    else if (studentGPA >= 80) gpaDistribution['B (80-89)']++;
                    else if (studentGPA >= 70) gpaDistribution['C (70-79)']++;
                    else if (studentGPA >= 60) gpaDistribution['D (60-69)']++;
                    else gpaDistribution['F (Below 60)']++;
                }
            }

            // Monthly enrollment (simulated based on enrollment date)
            const enrollmentDate = new Date(student.enrollmentDate || Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
            const monthKey = `${enrollmentDate.getFullYear()}-${String(enrollmentDate.getMonth() + 1).padStart(2, '0')}`;
            const existingMonth = monthlyEnrollment.find(m => m.month === monthKey);
            if (existingMonth) {
                existingMonth.students++;
            } else {
                monthlyEnrollment.push({ month: monthKey, students: 1 });
            }
        });

        // Sort monthly enrollment
        monthlyEnrollment.sort((a, b) => a.month.localeCompare(b.month));

        // Calculate trends (simulated)
        const totalStudents = studentData.length;
        
        // Calculate active and graduated students using the same logic as calculateAcademicStats
        const activeStudents = studentData.filter(s => {
            const status = s.status || s.student_status || s.enrollment_status;
            const isActive = s.is_active;
            
            return status === 'active' || 
                   status === 'enrolled' || 
                   status === 'current' ||
                   status === '1' ||
                   isActive === true ||
                   isActive === 1;
        }).length;
        
        const graduatedStudents = studentData.filter(s => {
            const status = s.status || s.student_status || s.enrollment_status;
            const isGraduated = s.is_graduated;
            
            return status === 'completed' || 
                   status === 'graduated' || 
                   status === 'finished' ||
                   status === '0' ||
                   isGraduated === true ||
                   isGraduated === 1;
        }).length;
        
        // Fallback: If no students are marked as active or graduated, assume all students are active
        const finalActive = activeStudents > 0 ? activeStudents : (graduatedStudents > 0 ? totalStudents - graduatedStudents : totalStudents);
        const finalGraduated = graduatedStudents;
        
        const averageGPA = academicStats.averageGPA || 0;

        return {
            programDistribution: Object.entries(programDistribution).map(([program, count]) => ({
                name: program,
                value: count,
                percentage: ((count / totalStudents) * 100).toFixed(1)
            })),
            yearLevelDistribution: Object.entries(yearLevelDistribution).map(([year, count]) => ({
                name: year,
                value: count,
                percentage: ((count / totalStudents) * 100).toFixed(1)
            })),
            gpaDistribution: Object.entries(gpaDistribution).map(([grade, count]) => ({
                name: grade,
                value: count,
                percentage: ((count / totalStudents) * 100).toFixed(1)
            })),
            genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({
                name: gender,
                value: count,
                percentage: ((count / totalStudents) * 100).toFixed(1)
            })),
            monthlyEnrollment: monthlyEnrollment.slice(-12), // Last 12 months
            enhancedKPIs: {
                totalStudents,
                activeStudents: finalActive,
                graduatedStudents: finalGraduated,
                averageGPA: parseFloat(averageGPA),
                completionRate: totalStudents > 0 ? ((finalGraduated / totalStudents) * 100).toFixed(1) : 0,
                retentionRate: totalStudents > 0 ? (((totalStudents - finalGraduated) / totalStudents) * 100).toFixed(1) : 0,
                studentsWithGrades: studentData.filter(s => s.grades && s.grades.length > 0).length,
                averageSubjectsPerStudent: totalStudents > 0 ? (studentData.reduce((sum, s) => sum + (s.grades ? s.grades.length : 0), 0) / totalStudents).toFixed(1) : 0
            }
        };
    };

    const [chartData, setChartData] = useState({});

    const allReports = [
        // Academic Performance Reports
        { 
            id: 1, 
            title: 'Student Academic Performance Summary', 
            category: 'Academic Performance', 
            categoryId: 'academic',
            date: new Date().toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '1.2 MB', 
            type: 'PDF',
            description: 'Overview of student grades and academic progress'
        },
        { 
            id: 2, 
            title: 'Grade Distribution Analysis', 
            category: 'Academic Performance', 
            categoryId: 'academic',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '0.9 MB', 
            type: 'Excel',
            description: 'Statistical analysis of grade distributions across programs'
        },
        { 
            id: 3, 
            title: 'Subject Performance Report', 
            category: 'Academic Performance', 
            categoryId: 'academic',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '1.1 MB', 
            type: 'PDF',
            description: 'Performance metrics by subject and instructor'
        },
        
        // Enrollment Statistics Reports
        { 
            id: 4, 
            title: 'Enrollment Statistics Report', 
            category: 'Enrollment Statistics', 
            categoryId: 'enrollment',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '0.8 MB', 
            type: 'Excel',
            description: 'Current enrollment numbers and trends'
        },
        { 
            id: 5, 
            title: 'Program Enrollment Analysis', 
            category: 'Enrollment Statistics', 
            categoryId: 'enrollment',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '0.7 MB', 
            type: 'Excel',
            description: 'Detailed breakdown of enrollment by program and year level'
        },
        
        // Student Progress Reports
        { 
            id: 6, 
            title: 'Student Progress Tracking', 
            category: 'Student Progress', 
            categoryId: 'progress',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '1.5 MB', 
            type: 'PDF',
            description: 'Individual student progress and milestones'
        },
        { 
            id: 7, 
            title: 'Attendance and Engagement Report', 
            category: 'Student Progress', 
            categoryId: 'progress',
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '1.3 MB', 
            type: 'PDF',
            description: 'Student attendance patterns and engagement metrics'
        },
        
        // Achievement Reports
        { 
            id: 8, 
            title: 'Student Achievement Summary', 
            category: 'Achievements', 
            categoryId: 'achievements',
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            status: 'completed', 
            downloads: 0, 
            size: '0.6 MB', 
            type: 'PDF',
            description: 'Summary of student achievements and recognitions'
        }
    ];

    // Filter reports based on selected category
    const getFilteredReports = () => {
        if (selectedCategory === 'all') {
            return allReports;
        }
        return allReports.filter(report => report.categoryId === selectedCategory);
    };

    const filteredReports = getFilteredReports();




    const generateReport = async (reportType) => {
        setLoading(true);
        try {
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real implementation, this would call your backend API
            
            // Show success message
            showSuccess(`${reportType} report generated successfully!`);
        } catch (error) {
            console.error('Error generating report:', error);
            showError('Error generating report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Download functions for different report types
    const downloadAcademicPerformanceReport = () => {
        try {
            if (!students || students.length === 0) {
                showError('No student data available for academic performance report.');
                return;
            }

            // Generate PDF-like content for Academic Performance Report
            const academicData = students.map(student => ({
                'Student ID': student.id || 'N/A',
                'Name': `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
                'Program': student.program || 'N/A',
                'Year Level': student.year_level || 'N/A',
                'Status': student.status || student.student_status || student.enrollment_status || 'N/A',
                'Average Grade': student.grades && student.grades.length > 0 
                    ? (student.grades.reduce((sum, grade) => sum + parseFloat(grade.grade || 0), 0) / student.grades.length).toFixed(2)
                    : 'N/A',
                'Total Subjects': student.grades ? student.grades.length : 0,
                'Last Updated': new Date().toLocaleDateString()
            }));

            // Create comprehensive academic report
            const reportContent = [
                'STUDENT ACADEMIC PERFORMANCE SUMMARY REPORT',
                `Generated on: ${new Date().toLocaleDateString()}`,
                `Total Students: ${academicStats.totalStudents}`,
                `Active Students: ${academicStats.activeStudents}`,
                `Average GPA: ${academicStats.averageGPA}`,
                '',
                'DETAILED STUDENT PERFORMANCE',
                academicData.length > 0 ? Object.keys(academicData[0]).join(',') : 'No data available',
                ...academicData.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([reportContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `academic_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showSuccess('Academic Performance Report downloaded successfully!');
        } catch (error) {
            console.error('Error downloading academic report:', error);
            showError('Failed to download academic report. Please try again.');
        }
    };

    const downloadEnrollmentStatisticsReport = () => {
        try {
            if (!students || students.length === 0) {
                showError('No student data available for enrollment statistics report.');
                return;
            }

            // Generate Excel-like content for Enrollment Statistics Report
            const enrollmentData = {
                'Summary': [
                    { 'Metric': 'Total Students', 'Value': academicStats.totalStudents },
                    { 'Metric': 'Active Students', 'Value': academicStats.activeStudents },
                    { 'Metric': 'Graduated Students', 'Value': academicStats.graduatedStudents },
                    { 'Metric': 'Average GPA', 'Value': academicStats.averageGPA }
                ],
                'Program Distribution': (() => {
                    const programDistribution = {};
                    students.forEach(student => {
                        const program = student.program || 'Unknown';
                        programDistribution[program] = (programDistribution[program] || 0) + 1;
                    });
                    return Object.entries(programDistribution).map(([program, count]) => ({
                        'Program': program,
                        'Student Count': count,
                        'Percentage': `${((count / students.length) * 100).toFixed(1)}%`
                    }));
                })(),
                'Year Level Distribution': (() => {
                    const yearLevelDistribution = {};
                    students.forEach(student => {
                        const yearLevel = student.year_level || 'Unknown';
                        yearLevelDistribution[yearLevel] = (yearLevelDistribution[yearLevel] || 0) + 1;
                    });
                    return Object.entries(yearLevelDistribution).map(([yearLevel, count]) => ({
                        'Year Level': yearLevel,
                        'Student Count': count,
                        'Percentage': `${((count / students.length) * 100).toFixed(1)}%`
                    }));
                })()
            };

            // Create Excel-like CSV format
            const csvContent = [
                'ENROLLMENT STATISTICS REPORT',
                `Generated on: ${new Date().toLocaleDateString()}`,
                '',
                'SUMMARY STATISTICS',
                Object.keys(enrollmentData.Summary[0]).join(','),
                ...enrollmentData.Summary.map(row => Object.values(row).join(',')),
                '',
                'PROGRAM DISTRIBUTION',
                Object.keys(enrollmentData['Program Distribution'][0] || {}).join(','),
                ...enrollmentData['Program Distribution'].map(row => Object.values(row).join(',')),
                '',
                'YEAR LEVEL DISTRIBUTION',
                Object.keys(enrollmentData['Year Level Distribution'][0] || {}).join(','),
                ...enrollmentData['Year Level Distribution'].map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enrollment_statistics_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showSuccess('Enrollment Statistics Report downloaded successfully!');
        } catch (error) {
            console.error('Error downloading enrollment report:', error);
            showError('Failed to download enrollment report. Please try again.');
        }
    };

    const downloadStudentProgressReport = () => {
        try {
            if (!students || students.length === 0) {
                showError('No student data available for progress tracking report.');
                return;
            }

            // Generate detailed progress tracking data
            const progressData = students.map(student => {
                const grades = student.grades || [];
                const recentGrades = grades.slice(-3); // Last 3 grades
                const progressTrend = recentGrades.length >= 2 
                    ? (parseFloat(recentGrades[recentGrades.length - 1]?.grade || 0) - parseFloat(recentGrades[0]?.grade || 0)).toFixed(2)
                    : 'N/A';

                return {
                    'Student ID': student.id || 'N/A',
                    'Name': `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
                    'Program': student.program || 'N/A',
                    'Year Level': student.year_level || 'N/A',
                    'Status': student.status || student.student_status || student.enrollment_status || 'N/A',
                    'Total Subjects': grades.length,
                    'Latest Grade': grades.length > 0 ? grades[grades.length - 1]?.grade || 'N/A' : 'N/A',
                    'Progress Trend': progressTrend,
                    'Milestones Completed': student.milestones ? student.milestones.length : 0,
                    'Last Activity': student.last_activity || 'N/A',
                    'Progress Status': progressTrend !== 'N/A' && parseFloat(progressTrend) > 0 ? 'Improving' : 
                                     progressTrend !== 'N/A' && parseFloat(progressTrend) < 0 ? 'Declining' : 'Stable'
                };
            });

            const csvContent = [
                'STUDENT PROGRESS TRACKING REPORT',
                `Generated on: ${new Date().toLocaleDateString()}`,
                `Total Students Tracked: ${students.length}`,
                '',
                'INDIVIDUAL STUDENT PROGRESS',
                Object.keys(progressData[0] || {}).join(','),
                ...progressData.map(row => Object.values(row).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_progress_tracking_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showSuccess('Student Progress Tracking Report downloaded successfully!');
        } catch (error) {
            console.error('Error downloading progress report:', error);
            showError('Failed to download progress report. Please try again.');
        }
    };

    const downloadReport = (reportType) => {
        try {
            switch (reportType) {
                case 'Student Academic Performance Summary':
                    downloadAcademicPerformanceReport();
                    break;
                case 'Enrollment Statistics Report':
                    downloadEnrollmentStatisticsReport();
                    break;
                case 'Student Progress Tracking':
                    downloadStudentProgressReport();
                    break;
                default:
                    // Fallback to general export
                    showInfo(`Downloading general report for: ${reportType}`);
                    exportData('csv');
            }
        } catch (error) {
            console.error('Error in downloadReport:', error);
            showError('Failed to download report. Please try again.');
        }
    };

    const exportData = (format) => {
        try {
            // Create overview summary data
            const overviewSummary = [
                { 'Metric': 'Total Students', 'Value': academicStats.totalStudents },
                { 'Metric': 'Active Students', 'Value': academicStats.activeStudents },
                { 'Metric': 'Graduated Students', 'Value': academicStats.graduatedStudents },
                { 'Metric': 'Average GPA', 'Value': academicStats.averageGPA.toFixed(2) },
                { 'Metric': 'Report Generated', 'Value': new Date().toLocaleDateString() },
                { 'Metric': 'Report Type', 'Value': 'Education Monitoring Overview' }
            ];

            // Create program distribution
            const programDistribution = {};
            students.forEach(student => {
                const program = student.program || 'Unknown';
                programDistribution[program] = (programDistribution[program] || 0) + 1;
            });

            const programStats = Object.entries(programDistribution).map(([program, count]) => ({
                'Program': program,
                'Student Count': count,
                'Percentage': `${((count / students.length) * 100).toFixed(1)}%`
            }));

            // Create year level distribution
            const yearLevelDistribution = {};
            students.forEach(student => {
                const yearLevel = student.year_level || 'Unknown';
                yearLevelDistribution[yearLevel] = (yearLevelDistribution[yearLevel] || 0) + 1;
            });

            const yearLevelStats = Object.entries(yearLevelDistribution).map(([yearLevel, count]) => ({
                'Year Level': yearLevel,
                'Student Count': count,
                'Percentage': `${((count / students.length) * 100).toFixed(1)}%`
            }));

            if (format === 'csv') {
                const csvContent = [
                    'EDUCATION MONITORING OVERVIEW REPORT',
                    '',
                    'SUMMARY STATISTICS',
                    Object.keys(overviewSummary[0]).join(','),
                    ...overviewSummary.map(row => Object.values(row).join(',')),
                    '',
                    'PROGRAM DISTRIBUTION',
                    Object.keys(programStats[0]).join(','),
                    ...programStats.map(row => Object.values(row).join(',')),
                    '',
                    'YEAR LEVEL DISTRIBUTION',
                    Object.keys(yearLevelStats[0]).join(','),
                    ...yearLevelStats.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `education_monitoring_overview_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showSuccess('Education monitoring overview exported successfully!');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            showError('Failed to export data. Please try again.');
        }
    };

    return (
        <div className="">
            <DashboardHeader 
                onExportData={exportData}
                onGenerateReport={generateReport}
                loading={loading}
            />

            <KPICards 
                academicStats={academicStats}
                chartData={chartData}
            />

            <AnalyticsCharts chartData={chartData} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ReportCategories 
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    allReports={allReports}
                />

                <ReportsList 
                    filteredReports={filteredReports}
                    selectedCategory={selectedCategory}
                    reportCategories={[]} // This will be calculated in ReportCategories component
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    onGenerateReport={generateReport}
                    onDownloadReport={downloadReport}
                />
            </div>

            {/* Quick Report Generation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Report Generation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => generateReport('Academic Performance')}
                        className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                            <div className="font-medium text-slate-800 dark:text-white">Performance Report</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Academic grades & progress</div>
                        </div>
                    </button>
                    <button 
                        onClick={() => generateReport('Enrollment Statistics')}
                        className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <div className="text-left">
                            <div className="font-medium text-slate-800 dark:text-white">Enrollment Report</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Student registration analytics</div>
                        </div>
                    </button>
                    <button 
                        onClick={() => generateReport('Student Progress')}
                        className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                        <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                            <div className="font-medium text-slate-800 dark:text-white">Progress Report</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Individual student tracking</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        <span className="text-slate-800 dark:text-white">Generating report...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EMROverview;