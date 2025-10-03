import React from 'react';
import { 
    Users, Activity, Award, Target, TrendingUp, BookOpen, 
    ArrowUp, ArrowDown, Minus 
} from 'lucide-react';

const KPICards = ({ academicStats, chartData = {} }) => {
    const getReportStats = () => {
        const kpis = chartData.enhancedKPIs || {};
        return [
            { 
                title: 'Total Students', 
                value: academicStats.totalStudents.toString(), 
                change: '+12.5%', 
                changeType: 'positive',
                icon: Users, 
                color: 'blue',
                description: 'Registered students in system'
            },
            { 
                title: 'Active Students', 
                value: academicStats.activeStudents.toString(), 
                change: '+8.3%', 
                changeType: 'positive',
                icon: Activity, 
                color: 'green',
                description: 'Currently enrolled students'
            },
            { 
                title: 'Average GPA', 
                value: academicStats.averageGPA.toString(), 
                change: '+0.2', 
                changeType: 'positive',
                icon: Award, 
                color: 'purple',
                description: 'Overall academic performance'
            },
            { 
                title: 'Completion Rate', 
                value: `${kpis.completionRate || 0}%`, 
                change: '+5.2%', 
                changeType: 'positive',
                icon: Target, 
                color: 'emerald',
                description: 'Students who completed programs'
            },
            { 
                title: 'Retention Rate', 
                value: `${kpis.retentionRate || 0}%`, 
                change: '+2.1%', 
                changeType: 'positive',
                icon: TrendingUp, 
                color: 'teal',
                description: 'Students continuing enrollment'
            },
            { 
                title: 'Students with Grades', 
                value: (kpis.studentsWithGrades || 0).toString(), 
                change: '+18.7%', 
                changeType: 'positive',
                icon: BookOpen, 
                color: 'indigo',
                description: 'Students with recorded performance'
            }
        ];
    };

    const getTrendIcon = (changeType) => {
        switch (changeType) {
            case 'positive': return <ArrowUp className="w-3 h-3 text-green-500" />;
            case 'negative': return <ArrowDown className="w-3 h-3 text-red-500" />;
            default: return <Minus className="w-3 h-3 text-gray-500" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {getReportStats().map((stat, index) => {
                const IconComponent = stat.icon;
                const colorClasses = {
                    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
                    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
                    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                };

                return (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                    {getTrendIcon(stat.changeType)}
                                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {stat.change} vs last month
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.description}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPICards;
