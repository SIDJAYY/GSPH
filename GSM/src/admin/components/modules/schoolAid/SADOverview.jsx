import React from 'react';
import { HandCoins, Users, CheckCircle, Clock, TrendingUp, Calendar, School, DollarSign, CreditCard, BarChart3 } from 'lucide-react';

function SADOverview({ onPageChange }) {
    const stats = [
        {
            title: 'Total Aid Distributed',
            value: '₱12.5M',
            change: '+15.2%',
            icon: DollarSign,
            color: 'bg-green-500',
            description: 'Year to date'
        },
        {
            title: 'Active Fund Allocations',
            value: '₱8.2M',
            change: '+8.7%',
            icon: TrendingUp,
            color: 'bg-blue-500',
            description: 'Available funds'
        },
        {
            title: 'Pending Payments',
            value: '89',
            change: '-12.3%',
            icon: Clock,
            color: 'bg-yellow-500',
            description: 'Awaiting processing'
        },
        {
            title: 'Total Beneficiaries',
            value: '1,567',
            change: '+9.1%',
            icon: Users,
            color: 'bg-purple-500',
            description: 'Active recipients'
        }
    ];

    const aidTypes = [
        { name: 'Financial Grants', amount: '₱5.5M', recipients: 823, color: 'bg-blue-500' },
        { name: 'Student Loans', amount: '₱3.5M', recipients: 612, color: 'bg-green-500' },
        { name: 'Research Stipends', amount: '₱2.0M', recipients: 189, color: 'bg-orange-500' },
        { name: 'Emergency Aid', amount: '₱1.5M', recipients: 143, color: 'bg-purple-500' }
    ];

    const recentDistributions = [
        { id: 1, student: 'Maria Santos', school: 'University of the Philippines', amount: '₱45,000', type: 'Financial Need Grant', date: '2024-01-15' },
        { id: 2, student: 'Juan Dela Cruz', school: 'Ateneo de Manila University', amount: '₱25,000', type: 'Financial Need Grant', date: '2024-01-15' },
        { id: 3, student: 'Ana Rodriguez', school: 'De La Salle University', amount: '₱15,000', type: 'Student Loan', date: '2024-01-14' },
        { id: 4, student: 'Carlos Mendoza', school: 'University of Santo Tomas', amount: '₱30,000', type: 'Research Stipend', date: '2024-01-14' }
    ];

    const handleNavigation = (pageId) => {
        if (onPageChange) {
            onPageChange(pageId);
        }
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                        <HandCoins className="w-8 h-8 text-orange-500 mr-3" />
                        School Aid Distribution Overview
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Monitor and manage educational aid distribution in Caloocan City
                    </p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date().toLocaleDateString('en-PH', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
                                <div className="flex items.center mt-2">
                                    <span className={`text-sm font-medium ${
                                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-2">{stat.description}</span>
                                </div>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aid Distribution by Type */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Aid Distribution by Type</h3>
                    <div className="space-y-4">
                        {aidTypes.map((aid, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-4 h-4 ${aid.color} rounded-full`}></div>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{aid.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{aid.recipients} recipients</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-800 dark:text-white">{aid.amount}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">distributed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleNavigation('sad-applications')}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span>Review Applications</span>
                        </button>
                        <button 
                            onClick={() => handleNavigation('sad-fund-allocation')}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <DollarSign className="w-5 h-5" />
                            <span>Manage Fund Allocation</span>
                        </button>
                        <button 
                            onClick={() => handleNavigation('sad-payment-processing')}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            <span>Process Payments</span>
                        </button>
                        <button 
                            onClick={() => handleNavigation('sad-analytics')}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span>View Analytics</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Distributions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Recent Distributions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Student</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">University</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Program Type</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentDistributions.map((distribution) => (
                                <tr key={distribution.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{distribution.student}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{distribution.school}</td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                            {distribution.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-green-600 dark:text-green-400">{distribution.amount}</td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{distribution.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SADOverview; 