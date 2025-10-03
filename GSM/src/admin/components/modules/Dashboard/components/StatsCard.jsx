import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatsCard({ title, value, change, trend, icon: Icon, color }) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800'
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: 'text-green-600 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800'
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-200 dark:border-purple-800'
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            icon: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-200 dark:border-orange-800'
        }
    };

    const colorClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {value}
                    </p>
                    <div className="flex items-center mt-2">
                        {trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                            {change}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                            vs last month
                        </span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.border} border`}>
                    <Icon className={`w-5 h-5 ${colorClass.icon}`} />
                </div>
            </div>
        </div>
    );
}

export default StatsCard; 