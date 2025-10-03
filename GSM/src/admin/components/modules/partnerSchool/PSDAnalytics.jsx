import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Calendar, Users, GraduationCap, DollarSign, Award, Activity, Eye } from 'lucide-react';

function PSDAnalytics() {
    const [dateRange, setDateRange] = React.useState('6months');
    const [selectedSchool, setSelectedSchool] = React.useState('all');
    const [loading, setLoading] = React.useState(false);

    // Mock data for demonstration
    const mockAnalytics = {
        totalSchools: 15,
        totalStudents: 25000,
        totalScholars: 1200,
        totalBudget: 50000000,
        growthRate: 12.5,
        topPerformingSchools: [
            { name: "Caloocan City Science High School", score: 98, students: 2500, scholars: 150 },
            { name: "University of Caloocan City", score: 95, students: 15000, scholars: 800 },
            { name: "Caloocan City Technical Institute", score: 88, students: 3000, scholars: 120 }
        ],
        scholarshipDistribution: [
            { type: "Academic Excellence", count: 600, percentage: 50 },
            { type: "Financial Aid", count: 300, percentage: 25 },
            { type: "Leadership", count: 180, percentage: 15 },
            { type: "Sports", count: 120, percentage: 10 }
        ],
        monthlyTrends: [
            { month: "Jan", applications: 45, approvals: 40, budget: 2500000 },
            { month: "Feb", applications: 52, approvals: 48, budget: 2800000 },
            { month: "Mar", applications: 38, approvals: 35, budget: 2200000 },
            { month: "Apr", applications: 61, approvals: 55, budget: 3200000 },
            { month: "May", applications: 47, approvals: 42, budget: 2600000 },
            { month: "Jun", applications: 55, approvals: 50, budget: 3000000 }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics and reporting for partner school data</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="3months">Last 3 Months</option>
                                    <option value="6months">Last 6 Months</option>
                                    <option value="1year">Last Year</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                            <button className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md">
                                <Download className="w-4 h-4 mr-2" />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Schools</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalSchools}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +{mockAnalytics.growthRate}% from last period
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                <GraduationCap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalStudents.toLocaleString()}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +8.2% from last period
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Scholarship Recipients</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalScholars.toLocaleString()}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +15.3% from last period
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Budget</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₱{(mockAnalytics.totalBudget / 1000000).toFixed(1)}M</p>
                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +22.1% from last period
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Trends Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Trends</h3>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    Applications
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    Approvals
                                </div>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Chart visualization will be implemented here</p>
                            </div>
                        </div>
                    </div>

                    {/* Scholarship Distribution Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scholarship Distribution</h3>
                            <PieChart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Chart visualization will be implemented here</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing Schools */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Schools</h3>
                        <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Performance Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Scholars</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Scholarship Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {mockAnalytics.topPerformingSchools.map((school, index) => {
                                    const scholarshipRate = ((school.scholars / school.students) * 100).toFixed(1);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                                            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">#{index + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{school.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{school.score}%</div>
                                                    <div className="ml-2 w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                                        <div 
                                                            className="bg-orange-500 h-2 rounded-full" 
                                                            style={{ width: `${school.score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{school.students.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{school.scholars}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{scholarshipRate}%</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Scholarship Distribution Details */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scholarship Distribution Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mockAnalytics.scholarshipDistribution.map((item, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.type}</h4>
                                    <span className="text-sm text-gray-500 dark:text-slate-400">{item.percentage}%</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</div>
                                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-orange-500 h-2 rounded-full" 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PSDAnalytics;
