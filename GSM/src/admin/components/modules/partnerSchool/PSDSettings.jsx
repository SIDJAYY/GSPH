import React from 'react';
import { Settings, Save, RefreshCw, Database, Shield, Bell, Globe, Key, Users, FileText, AlertCircle } from 'lucide-react';

function PSDSettings() {
    const [activeTab, setActiveTab] = React.useState('general');
    const [settings, setSettings] = React.useState({
        general: {
            schoolName: 'Caloocan City Government',
            systemName: 'GSM Partner School Database',
            timezone: 'Asia/Manila',
            dateFormat: 'MM/DD/YYYY',
            language: 'English'
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: false,
            newSchoolAlert: true,
            verificationExpiry: true,
            reportGeneration: true
        },
        security: {
            sessionTimeout: 30,
            passwordPolicy: 'strong',
            twoFactorAuth: false,
            ipWhitelist: false,
            auditLogging: true
        },
        data: {
            autoBackup: true,
            backupFrequency: 'daily',
            retentionPeriod: 365,
            dataExport: true,
            anonymizeData: false
        }
    });
    const [saving, setSaving] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'data', label: 'Data Management', icon: Database }
    ];

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Configure system settings and preferences</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                            {saving ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4 mr-3" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    School Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.general.schoolName}
                                                    onChange={(e) => handleSettingChange('general', 'schoolName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    System Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.general.systemName}
                                                    onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={settings.general.timezone}
                                                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                >
                                                    <option value="Asia/Manila">Asia/Manila</option>
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">America/New_York</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Date Format
                                                </label>
                                                <select
                                                    value={settings.general.dateFormat}
                                                    onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                >
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
                                        
                                        <div className="space-y-4">
                                            {Object.entries(settings.notifications).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400">
                                                            {key === 'emailNotifications' && 'Receive notifications via email'}
                                                            {key === 'smsNotifications' && 'Receive notifications via SMS'}
                                                            {key === 'newSchoolAlert' && 'Get notified when new schools are added'}
                                                            {key === 'verificationExpiry' && 'Get notified before verification expires'}
                                                            {key === 'reportGeneration' && 'Get notified when reports are generated'}
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={value}
                                                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Session Timeout (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.security.sessionTimeout}
                                                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Password Policy
                                                </label>
                                                <select
                                                    value={settings.security.passwordPolicy}
                                                    onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                >
                                                    <option value="weak">Weak (6+ characters)</option>
                                                    <option value="medium">Medium (8+ characters, mixed case)</option>
                                                    <option value="strong">Strong (12+ characters, mixed case, numbers, symbols)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-4">
                                                {Object.entries(settings.security).filter(([key]) => typeof settings.security[key] === 'boolean').map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                                                {key === 'twoFactorAuth' && 'Enable two-factor authentication for enhanced security'}
                                                                {key === 'ipWhitelist' && 'Restrict access to specific IP addresses'}
                                                                {key === 'auditLogging' && 'Log all system activities for security monitoring'}
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={value}
                                                                onChange={(e) => handleSettingChange('security', key, e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management Settings</h3>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto Backup</h4>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400">Automatically backup data at regular intervals</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settings.data.autoBackup}
                                                        onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Backup Frequency
                                                </label>
                                                <select
                                                    value={settings.data.backupFrequency}
                                                    onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Data Retention Period (days)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.data.retentionPeriod}
                                                    onChange={(e) => handleSettingChange('data', 'retentionPeriod', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                {Object.entries(settings.data).filter(([key]) => typeof settings.data[key] === 'boolean' && key !== 'autoBackup').map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                                                {key === 'dataExport' && 'Allow data export functionality'}
                                                                {key === 'anonymizeData' && 'Anonymize personal data in exports'}
                                                            </p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={value}
                                                                onChange={(e) => handleSettingChange('data', key, e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save Status */}
                {saved && (
                    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Settings saved successfully!
                    </div>
                )}
            </div>
        </div>
    );
}

export default PSDSettings;
