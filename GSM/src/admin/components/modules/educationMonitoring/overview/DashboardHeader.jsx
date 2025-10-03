import React from 'react';
import { FileBarChart, Download } from 'lucide-react';

const DashboardHeader = ({ onExportData, onGenerateReport, loading }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Education Monitoring Reports</h1>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Live</span>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Real-time analytics dashboard for student academic progress and comprehensive reporting
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    <button 
                        onClick={() => onExportData('csv')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={() => onGenerateReport('Academic Performance')}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <FileBarChart className="w-4 h-4" />
                        <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
