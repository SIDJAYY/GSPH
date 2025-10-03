// Sidebar items configuration for Sidebar.jsx
import { LayoutDashboard, GraduationCap, HandCoins, ClipboardList, Library, FileBarChart, Settings } from 'lucide-react';

const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
         id: 'scholarship', icon: GraduationCap, label: 'Scholarship',
         subItems: [
             { id: 'scholarship-overview', label: 'Overview' },
             { id: 'scholarship-applications', label: 'Applications' },
             { id: 'scholarship-programs', label: 'Programs' }
         ]
     },
    {
        id: 'sad', icon: HandCoins, label: 'School Aid Distribution',
        subItems: [
            { id: 'sad-overview', label: 'Overview' },
            { id: 'sad-applications', label: 'Applications' },
            { id: 'sad-payment-processing', label: 'Payment Processing' },
            { id: 'sad-distribution-logs', label: 'Distribution Logs' },
            { id: 'sad-fund-allocation', label: 'Fund Allocation' },
            { id: 'sad-analytics', label: 'Analytics' }
        ]
    },
    {
        id: 'studentRegistry', icon: ClipboardList, label: 'Student Registry',
        subItems: [
            { id: 'studentRegistry-overview', label: 'Overview' },
            { id: 'studentRegistry-active-students', label: 'Active Students' },
            { id: 'studentRegistry-archived-students', label: 'Archived Students' },
            { id: 'studentRegistry-scholars', label: 'Scholars' },
            { id: 'studentRegistry-bulk-operations', label: 'Bulk Operations' },
            { id: 'studentRegistry-reports', label: 'Reports & Analytics' },
            { id: 'studentRegistry-import-export', label: 'Import/Export' }
        ]
    },
    {
        id: 'psd', icon: Library, label: 'Partner School Database',
        subItems: [
            { id: 'psd-overview', label: 'Overview' },
            { id: 'psd-school-management', label: 'School Management' },
            { id: 'psd-programs-partnerships', label: 'Programs & Partnerships' },
            { id: 'psd-student-population', label: 'Student Population' },
            { id: 'psd-verification', label: 'Verification & Accreditation' },
            { id: 'psd-analytics', label: 'Analytics & Reports' },
            { id: 'psd-bulk-operations', label: 'Bulk Operations' },
            { id: 'psd-settings', label: 'Settings' }
        ]
    },
    {
        id: 'emr', icon: FileBarChart, label: 'Education Monitoring',
        subItems: [
            { id: 'emr-overview', label: 'Overview' },
            { id: 'emr-academic-performance', label: 'Academic Performance' },
            { id: 'emr-enrollment-statistics', label: 'Enrollment Statistics' },
            { id: 'emr-student-progress', label: 'Student Progress' },
            { id: 'emr-analytics', label: 'Analytics' }
        ]
    },
    { id: 'settings', icon: Settings, label: 'Settings' }
];

export default sidebarItems; 