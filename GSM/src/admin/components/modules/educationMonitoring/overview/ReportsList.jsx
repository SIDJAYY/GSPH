import React from 'react';
import { FileBarChart, FileText, BarChart3, Eye, Download } from 'lucide-react';

const ReportsList = ({ 
    filteredReports, 
    selectedCategory, 
    reportCategories, 
    selectedPeriod, 
    onPeriodChange,
    onGenerateReport,
    onDownloadReport 
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'PDF': return <FileText className="w-4 h-4 text-red-500" />;
            case 'Excel': return <BarChart3 className="w-4 h-4 text-green-500" />;
            default: return <FileText className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {selectedCategory === 'all' ? 'Available Reports' : `${reportCategories.find(c => c.id === selectedCategory)?.label} Reports`}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <select 
                        value={selectedPeriod} 
                        onChange={(e) => onPeriodChange(e.target.value)} 
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                    >
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="quarterly">This Quarter</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-slate-400 dark:text-slate-500 mb-2">
                            <FileBarChart className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            No reports found for this category
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                            Try selecting a different category or generate new reports
                        </p>
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">{getTypeIcon(report.type)}</div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-medium text-slate-800 dark:text-white truncate">{report.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{report.description}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{report.category}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(report.date).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{report.size}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => onGenerateReport(report.title)}
                                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        title="Generate Report"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDownloadReport(report.title)}
                                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportsList;
