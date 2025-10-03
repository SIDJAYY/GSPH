import React from 'react';
import {
	Users,
	GraduationCap,
	TrendingUp,
	Award,
	School,
	Calendar,
	PieChart,
	HandCoins,
	FileBarChart,
	UserPlus,
} from 'lucide-react';
import StatsCard from './components/StatsCard';
import ChartCard from './components/ChartCard';
import RecentActivities from './components/RecentActivities';
import PerformanceMetrics from './components/PerformanceMetrics';

function DashboardOverview() {
	// Mock stats
	const stats = [
		{ title: 'Active Scholarships', value: '3,421', change: '+12.3%', trend: 'up', icon: GraduationCap, color: 'green' },
		{ title: 'School Aid Distributed', value: '₱1,245,000', change: '+15.2%', trend: 'up', icon: HandCoins, color: 'blue' },
		{ title: 'Registered Students', value: '12,847', change: '+5.2%', trend: 'up', icon: Users, color: 'purple' },
		{ title: 'Partner Schools', value: '156', change: '+2.1%', trend: 'up', icon: School, color: 'orange' },
		{ title: 'Reports Generated', value: '24', change: '+8.3%', trend: 'up', icon: FileBarChart, color: 'green' },
	];

	// Mock chart data
	const scholarshipApplicationsTrend = [
		{ month: 'Jan', applications: 320 },
		{ month: 'Feb', applications: 410 },
		{ month: 'Mar', applications: 390 },
		{ month: 'Apr', applications: 450 },
		{ month: 'May', applications: 500 },
		{ month: 'Jun', applications: 530 },
		{ month: 'Jul', applications: 600 },
	];
	const schoolAidDistribution = [
		{ name: 'Educational Supplies', value: 36, color: '#3B82F6' },
		{ name: 'Transportation Aid', value: 28, color: '#10B981' },
		{ name: 'Meal Allowance', value: 20, color: '#F59E0B' },
		{ name: 'Uniform Assistance', value: 16, color: '#8B5CF6' },
	];
	const studentRegistryGrowth = [
		{ month: 'Jan', students: 10500 },
		{ month: 'Feb', students: 10800 },
		{ month: 'Mar', students: 11200 },
		{ month: 'Apr', students: 11600 },
		{ month: 'May', students: 12000 },
		{ month: 'Jun', students: 12400 },
		{ month: 'Jul', students: 12847 },
	];
	const partnerSchoolTypes = [
		{ name: 'Public High School', value: 40, color: '#3B82F6' },
		{ name: 'Private Elementary', value: 30, color: '#10B981' },
		{ name: 'Public Elementary', value: 20, color: '#F59E0B' },
		{ name: 'Private High School', value: 10, color: '#8B5CF6' },
	];
	const reportCategories = [
		{ name: 'Academic', value: 8, color: '#3B82F6' },
		{ name: 'Enrollment', value: 6, color: '#10B981' },
		{ name: 'Scholarship', value: 5, color: '#F59E0B' },
		{ name: 'Financial', value: 3, color: '#8B5CF6' },
		{ name: 'Compliance', value: 2, color: '#EF4444' },
	];

	return (
		<div className="">
			{/* Header */}
			<div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-800 dark:text-white">Education and Scholarship Dashboard</h1>
						<p className="text-slate-600 dark:text-slate-400 mt-1">Overview of all education and scholarship modules performance</p>
					</div>
					<div className="flex items-center space-x-3 mt-4 md:mt-0">
						<div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
							<Calendar className="w-4 h-4" />
							<span>Last updated: {new Date().toLocaleDateString()}</span>
						</div>
						<button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Generate Report</button>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
				{stats.map((stat, index) => (
					<StatsCard key={index} {...stat} />
				))}
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ChartCard
					title="Scholarship Applications Trend"
					subtitle="Monthly applications received"
					icon={TrendingUp}
					data={scholarshipApplicationsTrend.map(d => ({ month: d.month, students: d.applications }))}
					type="line"
				/>
				<ChartCard
					title="School Aid Distribution"
					subtitle="By aid type"
					icon={PieChart}
					data={schoolAidDistribution}
					type="pie"
				/>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ChartCard
					title="Student Registry Growth"
					subtitle="Monthly student registrations"
					icon={Users}
					data={studentRegistryGrowth}
					type="line"
				/>
				<ChartCard
					title="Partner School Types"
					subtitle="Distribution by type"
					icon={School}
					data={partnerSchoolTypes}
					type="pie"
				/>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<ChartCard
					title="Report Categories"
					subtitle="Reports by category"
					icon={FileBarChart}
					data={reportCategories}
					type="pie"
				/>
			</div>

			{/* Performance Metrics and Activities */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<PerformanceMetrics />
				</div>
				<div>
					<RecentActivities />
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
				<h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					<button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
						<Award className="w-6 h-6 text-green-600 dark:text-green-400" />
						<div className="text-left">
							<div className="font-medium text-slate-800 dark:text-white">New Scholarship</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">Create scholarship program</div>
						</div>
					</button>
					<button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
						<HandCoins className="w-6 h-6 text-blue-600 dark:text-blue-400" />
						<div className="text-left">
							<div className="font-medium text-slate-800 dark:text-white">Distribute Aid</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">Process school aid</div>
						</div>
					</button>
					<button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
						<UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
						<div className="text-left">
							<div className="font-medium text-slate-800 dark:text-white">Register Student</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">Add new student</div>
						</div>
					</button>
					<button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
						<School className="w-6 h-6 text-orange-600 dark:text-orange-400" />
						<div className="text-left">
							<div className="font-medium text-slate-800 dark:text-white">Add Partner School</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">Register partner school</div>
						</div>
					</button>
					<button className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors">
						<FileBarChart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
						<div className="text-left">
							<div className="font-medium text-slate-800 dark:text-white">Generate Report</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">Create new report</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}

export default DashboardOverview; 