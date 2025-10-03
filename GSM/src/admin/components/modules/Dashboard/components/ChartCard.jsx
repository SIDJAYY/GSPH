import React from 'react';

function ChartCard({ title, subtitle, icon: Icon, data, type }) {
    const renderLineChart = () => {
        const maxValue = Math.max(...data.map(d => d.students));
        const minValue = Math.min(...data.map(d => d.students));
        const range = maxValue - minValue;

        return (
            <div className="h-64 flex items-end justify-between px-4 pb-4">
                {data.map((item, index) => {
                    const height = range > 0 ? ((item.students - minValue) / range) * 200 + 20 : 120;
                    return (
                        <div key={index} className="flex flex-col items-center space-y-2">
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                {item.students.toLocaleString()}
                            </div>
                            <div
                                className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                                style={{ height: `${height}px` }}
                            />
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {item.month}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPieChart = () => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        return (
            <div className="h-64 flex items-center justify-center">
                <div className="relative">
                    <svg width="200" height="200" className="transform -rotate-90">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const angle = (item.value / total) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;

                            const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                            const y2 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);

                            const largeArcFlag = angle > 180 ? 1 : 0;

                            return (
                                <path
                                    key={index}
                                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                    fill={item.color}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                {total}%
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Total
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ml-8 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {item.name}
                            </span>
                            <span className="text-sm font-medium text-slate-800 dark:text-white">
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {subtitle}
                    </p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
            </div>
            {type === 'line' ? renderLineChart() : renderPieChart()}
        </div>
    );
}

export default ChartCard; 