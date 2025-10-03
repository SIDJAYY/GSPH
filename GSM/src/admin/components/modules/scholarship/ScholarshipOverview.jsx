import React from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  PhilippinePeso ,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

function ScholarshipOverview() {
  const [stats, setStats] = React.useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    totalBudget: 0,
    budgetUsed: 0,
    activeScholarships: 0,
    upcomingDeadlines: 0
  });
  const [recentApplications, setRecentApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [overview, byStatus, apps] = await Promise.all([
          scholarshipApiService.getStatsOverview().catch(() => null),
          scholarshipApiService.getApplicationsByStatus().catch(() => null),
          scholarshipApiService.getApplications({ per_page: 10 }).catch(() => null),
        ]);

        if (overview) {
          setStats(prev => ({
            ...prev,
            totalApplications: overview.totalApplications ?? prev.totalApplications,
            totalBudget: overview.totalBudget ?? prev.totalBudget,
            budgetUsed: overview.budgetUsed ?? prev.budgetUsed,
            activeScholarships: overview.activeScholarships ?? prev.activeScholarships,
            upcomingDeadlines: overview.upcomingDeadlines ?? prev.upcomingDeadlines,
          }));
        }

        if (byStatus) {
          setStats(prev => ({
            ...prev,
            approved: byStatus.approved ?? prev.approved,
            rejected: byStatus.rejected ?? prev.rejected,
            pendingReview: byStatus.pending ?? byStatus.under_review ?? prev.pendingReview,
          }));
        }

        if (apps && Array.isArray(apps.data)) {
          const mapped = apps.data.map(a => ({
            id: a.id,
            name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim() || 'Unknown',
            studentId: a.student?.student_id_number || a.student_id || '',
            program: a.student?.current_academic_record?.program || a.category?.name || '',
            gpa: a.student?.current_academic_record?.general_weighted_average || a.student?.current_academic_record?.gpa || '',
            status: a.status,
            submittedDate: a.submitted_at || a.created_at,
            amount: a.requested_amount || 0,
          }));
          setRecentApplications(mapped);
        }
      } catch (e) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under_review':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage scholarship applications and awards
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            New Scholarship Program
          </button>
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReview}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center mt-1">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Requires attention
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Scholarships</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeScholarships}</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <Award className="w-4 h-4 mr-1" />
                Currently funded
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {((stats.budgetUsed / stats.totalBudget) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ₱{stats.budgetUsed.toLocaleString()} / ₱{stats.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <PhilippinePeso  className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Used Budget</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  ₱{stats.budgetUsed.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.budgetUsed / stats.totalBudget) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Remaining Budget</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  ₱{(stats.totalBudget - stats.budgetUsed).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((stats.totalBudget - stats.budgetUsed) / stats.totalBudget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Approved</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{stats.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Pending Review</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{stats.pendingReview}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Rejected</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">{stats.rejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
            <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              View All Applications
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {recentApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {application.studentId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {application.program}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {application.gpa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className='flex items-center'>
                      <PhilippinePeso  className="w-4 h-4 mr-1 text-gray-400" />
                      {application.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(application.submittedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-500 hover:text-orange-600 mr-3">
                      Review
                    </button>
                    <button className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Bulk Actions</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Process multiple applications at once
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Bulk Review
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Schedule Review</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set up review sessions and deadlines
          </p>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Schedule
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Generate Reports</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create detailed scholarship reports
          </p>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScholarshipOverview; 