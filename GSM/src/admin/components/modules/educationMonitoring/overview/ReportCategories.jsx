import React from 'react';
import { FileBarChart, BookOpen, Users, TrendingUp, Award } from 'lucide-react';

const ReportCategories = ({ selectedCategory, onCategoryChange, allReports }) => {
    const reportCategories = [
        { 
            id: 'all', 
            label: 'All Reports', 
            count: allReports.length, 
            icon: FileBarChart 
        },
        { 
            id: 'academic', 
            label: 'Academic Performance', 
            count: allReports.filter(r => r.categoryId === 'academic').length, 
            icon: BookOpen 
        },
        { 
            id: 'enrollment', 
            label: 'Enrollment Statistics', 
            count: allReports.filter(r => r.categoryId === 'enrollment').length, 
            icon: Users 
        },
        { 
            id: 'progress', 
            label: 'Student Progress', 
            count: allReports.filter(r => r.categoryId === 'progress').length, 
            icon: TrendingUp 
        },
        { 
            id: 'achievements', 
            label: 'Achievements', 
            count: allReports.filter(r => r.categoryId === 'achievements').length, 
            icon: Award 
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Report Categories</h3>
            <div className="space-y-2">
                {reportCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                        <button 
                            key={category.id} 
                            onClick={() => onCategoryChange(category.id)} 
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                selectedCategory === category.id 
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <IconComponent className="w-4 h-4" />
                                <span className="text-sm font-medium">{category.label}</span>
                            </div>
                            <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full">{category.count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportCategories;
