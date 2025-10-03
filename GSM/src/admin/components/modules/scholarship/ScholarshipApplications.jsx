import React, { useEffect, useState } from 'react';
import { scholarshipApiService } from '../../../../services/scholarshipApiService';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Calendar,
  PhilippinePeso ,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function ScholarshipApplications() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: 'all',
    category: 'all',
    level: 'all',
    dateFrom: '',
    dateTo: '',
    minGwa: '',
    maxGwa: '',
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [approveAmount, setApproveAmount] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [docDownloadingId, setDocDownloadingId] = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        setError('');
        // Build params from filters
        const params = {};
        if (selectedStatus !== 'all') params.status = selectedStatus;
        // Backend supports search via `search` in controller
        if (searchTerm) params.search = searchTerm;
        // Type can map from level/category UI later if needed

        const resp = await scholarshipApiService.getApplications(params);
        const list = Array.isArray(resp.data) ? resp.data : [];
        const mapped = list.map(a => ({
          id: a.id,
          name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim() || 'Unknown',
          studentId: a.student?.student_id_number || a.student_id || '',
          email: a.student?.email_address || '',
          phone: a.student?.contact_number || '',
          scholarIdNumber: a.application_number || '',
          schoolName: a.school?.name || '',
          gradeYearLevel: a.student?.current_academic_record?.year_level || '',
          generalWeightedAverage: a.student?.current_academic_record?.general_weighted_average || a.student?.current_academic_record?.gpa || '',
          scholarshipCategory: a.category?.name || '',
          scholarshipSubCategory: a.subcategory?.name || '',
          currentEducationalLevel: a.student?.current_academic_record?.educational_level || '',
          schoolYear: a.student?.current_academic_record?.school_year || '',
          schoolTerm: a.student?.current_academic_record?.school_term || '',
          status: a.status,
          submittedDate: a.submitted_at || a.created_at,
        }));
        setApplications(mapped);
      } catch (e) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [selectedStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || (app.scholarshipCategory || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = selectedLevel === 'all' || (app.currentEducationalLevel || '').toLowerCase() === selectedLevel.toLowerCase();
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.schoolName || app.program || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.scholarshipCategory || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesLevel && matchesSearch;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'gwa':
        aValue = parseFloat(a.generalWeightedAverage || a.gpa || 0);
        bValue = parseFloat(b.generalWeightedAverage || b.gpa || 0);
        break;
      case 'date':
      default:
        aValue = new Date(a.submittedDate);
        bValue = new Date(b.submittedDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openFilterModal = () => {
    setTempFilters({
      status: selectedStatus,
      category: selectedCategory,
      level: selectedLevel,
      dateFrom: '',
      dateTo: '',
      minGwa: '',
      maxGwa: '',
    });
    setIsFilterModalOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSearchTerm('');
  };

  const applyFilters = () => {
    setSelectedStatus(tempFilters.status || 'all');
    setSelectedCategory(tempFilters.category || 'all');
    setSelectedLevel(tempFilters.level || 'all');
    setIsFilterModalOpen(false);
  };

  const handleSelectApplication = (id) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === sortedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(sortedApplications.map(app => app.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on applications:`, selectedApplications);
    setSelectedApplications([]);
  };

  const openReview = async (app) => {
    setIsReviewModalOpen(true);
    setReviewLoading(true);
    try {
      // Load full application details
      const detailed = await scholarshipApiService.getApplication(app.id);
      setActiveApplication(detailed || app);
      setApproveAmount(detailed?.approved_amount || '');
      setRejectReason('');
    } catch (e) {
      setActiveApplication(app);
    } finally {
      setReviewLoading(false);
    }
  };

  const refreshList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;
      const resp = await scholarshipApiService.getApplications(params);
      const list = Array.isArray(resp.data) ? resp.data : [];
      const mapped = list.map(a => ({
        id: a.id,
        name: `${a.student?.first_name ?? ''} ${a.student?.last_name ?? ''}`.trim() || 'Unknown',
        studentId: a.student?.student_id_number || a.student_id || '',
        email: a.student?.email_address || '',
        phone: a.student?.contact_number || '',
        scholarIdNumber: a.application_number || '',
        schoolName: a.school?.name || '',
        gradeYearLevel: a.student?.current_academic_record?.year_level || '',
        generalWeightedAverage: a.student?.current_academic_record?.general_weighted_average || a.student?.current_academic_record?.gpa || '',
        scholarshipCategory: a.category?.name || '',
        scholarshipSubCategory: a.subcategory?.name || '',
        currentEducationalLevel: a.student?.current_academic_record?.educational_level || '',
        schoolYear: a.student?.current_academic_record?.school_year || '',
        schoolTerm: a.student?.current_academic_record?.school_term || '',
        status: a.status,
        submittedDate: a.submitted_at || a.created_at,
      }));
      setApplications(mapped);
    } catch (e) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!activeApplication) return;
    setReviewLoading(true);
    try {
      const amt = parseFloat(approveAmount || '0');
      await scholarshipApiService.approveApplication(activeApplication.id, isNaN(amt) ? 0 : amt);
      await refreshList();
      setIsReviewModalOpen(false);
    } catch (e) {
      console.error('Approve failed', e);
      alert('Approve failed. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeApplication) return;
    if (!rejectReason?.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setReviewLoading(true);
    try {
      await scholarshipApiService.rejectApplication(activeApplication.id, rejectReason.trim());
      await refreshList();
      setIsReviewModalOpen(false);
    } catch (e) {
      console.error('Reject failed', e);
      alert('Reject failed. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      setDocDownloadingId(docId);
      const blob = await scholarshipApiService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `document-${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      alert('Failed to download document.');
    } finally {
      setDocDownloadingId(null);
    }
  };

  const handleViewDocument = async (docId, fileName) => {
    try {
      setDocDownloadingId(docId);
      const blob = await scholarshipApiService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Don't revoke immediately; give the new tab time to load
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (e) {
      console.error('View failed', e);
      alert('Failed to open document.');
    } finally {
      setDocDownloadingId(null);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scholarship Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage scholarship applications
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Review Selected
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filters trigger */}
          <button
            onClick={openFilterModal}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Scholarship for Tertiary Students">Scholarship for Tertiary Students</option>
            <option value="Scholarship for Senior High School Students">Scholarship for Senior High School Students</option>
            <option value="Scholarship for Technical Vocational Education">Scholarship for Technical Vocational Education</option>
            <option value="Scholarship for Alternative Learning System (ALS)">Scholarship for Alternative Learning System (ALS)</option>
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="Senior High School">Senior High School</option>
            <option value="Tertiary/College">Tertiary/College</option>
            <option value="Technical Vocational">Technical Vocational</option>
            <option value="Graduate School">Graduate School</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="gwa">Sort by GWA</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Active filter chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus('all')} className="ml-1">×</button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-200">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="ml-1">×</button>
            </span>
          )}
          {selectedLevel !== 'all' && (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-200">
              Level: {selectedLevel}
              <button onClick={() => setSelectedLevel('all')} className="ml-1">×</button>
            </span>
          )}
          {(selectedStatus !== 'all' || selectedCategory !== 'all' || selectedLevel !== 'all' || searchTerm) && (
            <button onClick={clearAllFilters} className="text-xs text-gray-600 dark:text-gray-300 underline">Clear all</button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {selectedApplications.length} application(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBulkAction('review')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Mark for Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={tempFilters.status}
                  onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={tempFilters.category}
                  onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="Scholarship for Tertiary Students">Scholarship for Tertiary Students</option>
                  <option value="Scholarship for Senior High School Students">Scholarship for Senior High School Students</option>
                  <option value="Scholarship for Technical Vocational Education">Scholarship for Technical Vocational Education</option>
                  <option value="Scholarship for Alternative Learning System (ALS)">Scholarship for Alternative Learning System (ALS)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Level</label>
                <select
                  value={tempFilters.level}
                  onChange={(e) => setTempFilters({ ...tempFilters, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="Senior High School">Senior High School</option>
                  <option value="Tertiary/College">Tertiary/College</option>
                  <option value="Technical Vocational">Technical Vocational</option>
                  <option value="Graduate School">Graduate School</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Date From</label>
                  <input type="date" value={tempFilters.dateFrom} onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Date To</label>
                  <input type="date" value={tempFilters.dateTo} onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Min GWA</label>
                  <input type="number" step="0.01" value={tempFilters.minGwa} onChange={(e) => setTempFilters({ ...tempFilters, minGwa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Max GWA</label>
                  <input type="number" step="0.01" value={tempFilters.maxGwa} onChange={(e) => setTempFilters({ ...tempFilters, maxGwa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => { setTempFilters({ status: 'all', category: 'all', level: 'all', dateFrom: '', dateTo: '', minGwa: '', maxGwa: '' }); }} className="text-sm text-gray-600 dark:text-gray-300 underline">Clear</button>
              <div className="space-x-2">
                <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200">Cancel</button>
                <button onClick={applyFilters} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-blue-700 bg-blue-50 border-b border-blue-200">Loading applications…</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === sortedApplications.length && sortedApplications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Student
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  School
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('gwa')}
                >
                  <div className="flex items-center">
                    GWA
                    {sortBy === 'gwa' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SY/Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Submitted
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => handleSelectApplication(application.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {application.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {application.studentId}{application.scholarIdNumber ? ` • ${application.scholarIdNumber}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{application.schoolName || application.program}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{application.gradeYearLevel || application.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1 text-gray-400" />
                      {application.generalWeightedAverage || application.gpa}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{application.scholarshipCategory || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{application.currentEducationalLevel || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{(application.schoolYear || '—')} / {(application.schoolTerm || '—')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(application.submittedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-orange-500 hover:text-orange-600 transition-colors" onClick={() => openReview(application)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-500 hover:text-green-600 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-600 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-slate-800 px-4 py-3 border-t border-gray-200 dark:border-slate-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedApplications.length}</span> of{' '}
                  <span className="font-medium">{applications.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {reviewLoading && <div className="text-sm text-gray-500">Loading…</div>}
              {!reviewLoading && activeApplication && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Student</div>
                      <div className="font-medium text-gray-900 dark:text-white">{activeApplication.student?.first_name} {activeApplication.student?.last_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{activeApplication.student?.student_id_number} • {activeApplication.student?.email_address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Application No.</div>
                      <div className="font-medium text-gray-900 dark:text-white">{activeApplication.application_number || '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Category / Subcategory</div>
                      <div className="font-medium text-gray-900 dark:text-white">{activeApplication.category?.name || '—'}{activeApplication.subcategory?.name ? ` • ${activeApplication.subcategory?.name}` : ''}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                      <div className="font-medium capitalize">{(activeApplication.status || '').replace('_',' ')}</div>
                    </div>
                  </div>

                  {/* Academic */}
                  <div>
                    <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Academic Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">School</div>
                        <div className="font-medium">{activeApplication.school?.name || activeApplication.student?.current_academic_record?.school?.name || '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Level</div>
                        <div className="font-medium">{activeApplication.student?.current_academic_record?.educational_level || '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">SY / Term</div>
                        <div className="font-medium">{activeApplication.student?.current_academic_record?.school_year || '—'} / {activeApplication.student?.current_academic_record?.school_term || '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">GWA</div>
                        <div className="font-medium">{activeApplication.student?.current_academic_record?.general_weighted_average || activeApplication.student?.current_academic_record?.gpa || '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Financial */}
                  <div>
                    <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Financial Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Requested Amount</div>
                        <div className="font-medium">{activeApplication.requested_amount ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Approved Amount</div>
                        <div className="font-medium">{activeApplication.approved_amount ?? '—'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Submitted</div>
                        <div className="font-medium">{activeApplication.submitted_at ? new Date(activeApplication.submitted_at).toLocaleString() : '—'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Documents</div>
                    <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                          <tr>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">File</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                          {(activeApplication.documents || []).length === 0 && (
                            <tr><td className="px-4 py-3 text-gray-500" colSpan={4}>No documents uploaded.</td></tr>
                          )}
                          {(activeApplication.documents || []).map(doc => (
                            <tr key={doc.id}>
                              <td className="px-4 py-2">{doc.document_type?.name || '—'}</td>
                              <td className="px-4 py-2">{doc.file_name}</td>
                              <td className="px-4 py-2 capitalize">{doc.status}</td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewDocument(doc.id, doc.file_name)}
                                    className="p-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadDocument(doc.id, doc.file_name)}
                                    className="p-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    disabled={docDownloadingId === doc.id}
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Decision inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Approved Amount</label>
                      <input type="number" step="0.01" value={approveAmount} onChange={(e) => setApproveAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Rejection Reason</label>
                      <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs text-gray-500">Use either Approve or Reject. Approval requires an amount.</div>
              <div className="space-x-2">
                <button disabled={reviewLoading} onClick={handleReject} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-60">Reject</button>
                <button disabled={reviewLoading} onClick={handleApprove} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60">Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScholarshipApplications; 