import React from 'react';
import { User, Lock, Bell, Moon } from 'lucide-react';

function SettingsOverview() {
    return (
        <div className="">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your profile, account, notifications, and theme preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center mb-4">
                        <User className="w-6 h-6 text-blue-500 mr-2" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Profile</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                            <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Enter your name" disabled />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white" placeholder="Enter your email" disabled />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center mb-4">
                        <Lock className="w-6 h-6 text-purple-500 mr-2" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Account</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Change Password</label>
                            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Change</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center mb-4">
                        <Bell className="w-6 h-6 text-yellow-500 mr-2" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-700 dark:text-slate-200">Email Notifications</span>
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-orange-500" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-700 dark:text-slate-200">SMS Alerts</span>
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-orange-500" disabled />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center mb-4">
                        <Moon className="w-6 h-6 text-indigo-500 mr-2" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Theme</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-700 dark:text-slate-200">Dark Mode</span>
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-orange-500" disabled />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsOverview; 