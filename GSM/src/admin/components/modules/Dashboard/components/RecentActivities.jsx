import React from 'react';
import { 
    UserPlus, 
    FileText, 
    Award, 
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

function RecentActivities() {
    const activities = [
        {
            id: 1,
            type: 'application',
            title: 'New scholarship application',
            description: 'Maria Santos submitted application for Academic Excellence Program',
            time: '2 hours ago',
            icon: FileText,
            color: 'blue'
        },
        {
            id: 2,
            type: 'approval',
            title: 'Application approved',
            description: 'John Dela Cruz approved for Financial Aid Program',
            time: '4 hours ago',
            icon: CheckCircle,
            color: 'green'
        },
        {
            id: 3,
            type: 'registration',
            title: 'New student registered',
            description: 'Anna Rodriguez enrolled in Partner School Database',
            time: '6 hours ago',
            icon: UserPlus,
            color: 'purple'
        },
        {
            id: 4,
            type: 'award',
            title: 'Scholarship awarded',
            description: 'Sports Excellence Program awarded to 15 students',
            time: '1 day ago',
            icon: Award,
            color: 'orange'
        },
        {
            id: 5,
            type: 'alert',
            title: 'Document verification needed',
            description: 'Review pending for 3 applications',
            time: '1 day ago',
            icon: AlertCircle,
            color: 'red'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Recent Activities
                </h3>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    View All
                </button>
            </div>
            
            <div className="space-y-4">
                {activities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className={`p-2 rounded-lg ${getColorClasses(activity.color)}`}>
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {activity.description}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.time}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RecentActivities; 