import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, MapPin, DollarSign, Users, School, Calendar, Download, Filter } from 'lucide-react';

function Analytics({ onPageChange }) {
    const [selectedPeriod, setSelectedPeriod] = useState('ytd');
    const [selectedSchool, setSelectedSchool] = useState('all');
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({});

    // Mock data - replace with API calls
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setAnalyticsData({
                overview: {
                    totalAidDistributed: 12500000,
                    totalRecipients: 1567,
                    totalSchools: 45,
                    averageAidPerStudent: 7970,
                    ytdGrowth: 15.2,
                    mtdGrowth: 8.7
                },
                distributionPatterns: {
                    byMonth: [
                        { month: 'Jan', amount: 1200000, recipients: 156 },
                        { month: 'Feb', amount: 1350000, recipients: 178 },
                        { month: 'Mar', amount: 1420000, recipients: 189 },
                        { month: 'Apr', amount: 1380000, recipients: 182 },
                        { month: 'May', amount: 1450000, recipients: 195 },
                        { month: 'Jun', amount: 1500000, recipients: 201 }
                    ],
                    byProgram: [
                        { program: 'Grant', amount: 5500000, percentage: 44.0 },
                        { program: 'Loan', amount: 3500000, percentage: 28.0 },
                        { program: 'Stipend', amount: 2000000, percentage: 16.0 },
                        { program: 'Emergency', amount: 1500000, percentage: 12.0 }
                    ]
                },
                impactMetrics: {
                    studentRetention: 94.5,
                    academicPerformance: 87.2,
                    graduationRate: 89.1,
                    employmentRate: 76.8
                },
                geographicCoverage: {
                    regions: [
                        { region: 'NCR', schools: 18, students: 678, amount: 4500000 },
                        { region: 'CALABARZON', schools: 12, students: 445, amount: 3200000 },
                        { region: 'Central Luzon', schools: 8, students: 234, amount: 1800000 },
                        { region: 'Ilocos Region', schools: 7, students: 210, amount: 1500000 }
                    ]
                },
                financialImpact: {
                    budgetUtilization: 78.5,
                    costPerStudent: 7970,
                    roi: 3.2,
                    administrativeCosts: 8.5
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    const periods = [
        { value: 'ytd', label: 'Year to Date' },
        { value: 'mtd', label: 'Month to Date' },
        { value: 'qtd', label: 'Quarter to Date' },
        { value: 'last_year', label: 'Last Year' }
    ];

    const schools = ['All Schools', 'University of the Philippines', 'Ateneo de Manila University', 'De La Salle University'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <BarChart3 className="w-8 h-8 text-orange-500 mr-3" />
                        Analytics & Reporting
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Comprehensive insights into school aid distribution performance
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        {periods.map(period => (
                            <option key={period.value} value={period.value}>{period.label}</option>
                        ))}
                    </select>
                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                    >
                        {schools.map(school => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </select>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₱{(analyticsData.overview?.totalAidDistributed / 1000000).toFixed(1)}M</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Aid Distributed</p>
                            <p className="text-xs text-green-600">+{analyticsData.overview?.ytdGrowth}% YTD</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{analyticsData.overview?.totalRecipients?.toLocaleString()}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Recipients</p>
                            <p className="text-xs text-blue-600">+{analyticsData.overview?.mtdGrowth}% MTD</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <School className="w-8 h-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{analyticsData.overview?.totalSchools}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Schools Served</p>
                            <p className="text-xs text-purple-600">Active Partners</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₱{analyticsData.overview?.averageAidPerStudent?.toLocaleString()}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Aid/Student</p>
                            <p className="text-xs text-orange-600">Per Recipient</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Distribution Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Monthly Distribution Trend</h3>
                    <div className="space-y-3">
                        {analyticsData.distributionPatterns?.byMonth?.map((month, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{month.month}</span>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{month.recipients} recipients</span>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">₱{(month.amount / 1000000).toFixed(1)}M</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Program Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Aid Distribution by Program</h3>
                    <div className="space-y-3">
                        {analyticsData.distributionPatterns?.byProgram?.map((program, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{program.program}</span>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-orange-500 h-2 rounded-full" 
                                            style={{ width: `${program.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{program.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Impact Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{analyticsData.impactMetrics?.studentRetention}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Student Retention</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{analyticsData.impactMetrics?.academicPerformance}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Academic Performance</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{analyticsData.impactMetrics?.graduationRate}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Graduation Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{analyticsData.impactMetrics?.employmentRate}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Employment Rate</div>
                    </div>
                </div>
            </div>

            {/* Geographic Coverage */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Geographic Coverage</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Region</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Schools</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Students</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.geographicCoverage?.regions?.map((region, index) => (
                                <tr key={index} className="border-b border-slate-100 dark:border-slate-700">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="font-medium text-slate-800 dark:text-white">{region.region}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{region.schools}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{region.students}</td>
                                    <td className="py-3 px-4 font-semibold text-green-600">₱{(region.amount / 1000000).toFixed(1)}M</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financial Impact */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Financial Impact Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.financialImpact?.budgetUtilization}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Budget Utilization</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">₱{analyticsData.financialImpact?.costPerStudent?.toLocaleString()}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Cost per Student</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.financialImpact?.roi}x</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">ROI</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.financialImpact?.administrativeCosts}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Admin Costs</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics; 