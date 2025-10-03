import React from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Search, Filter, Eye, Edit, FileText, Award, Calendar, Building } from 'lucide-react';

function PSDVerification() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [selectedSchool, setSelectedSchool] = React.useState(null);
    const [schools, setSchools] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // Mock data for demonstration
    const mockSchools = [
        {
            id: 1,
            school_name: "Caloocan City Science High School",
            accreditation_status: "verified",
            accreditation_type: "DepEd Accredited",
            accreditation_date: "2023-12-15",
            expiry_date: "2026-12-15",
            verification_score: 95,
            compliance_status: "compliant",
            last_inspection: "2024-01-10",
            next_inspection: "2024-07-10",
            documents: [
                { name: "DepEd Recognition", status: "verified", expiry: "2026-12-15" },
                { name: "CHED Permit", status: "verified", expiry: "2025-06-30" },
                { name: "Business Permit", status: "verified", expiry: "2024-12-31" },
                { name: "Fire Safety Certificate", status: "verified", expiry: "2025-03-15" }
            ],
            requirements: [
                { name: "Academic Programs", status: "compliant", notes: "All programs meet standards" },
                { name: "Faculty Qualifications", status: "compliant", notes: "100% qualified faculty" },
                { name: "Facilities", status: "compliant", notes: "Adequate facilities" },
                { name: "Student Services", status: "compliant", notes: "Comprehensive services" }
            ],
            notes: "School maintains excellent compliance with all requirements."
        },
        {
            id: 2,
            school_name: "University of Caloocan City",
            accreditation_status: "verified",
            accreditation_type: "CHED Accredited",
            accreditation_date: "2023-08-20",
            expiry_date: "2028-08-20",
            verification_score: 98,
            compliance_status: "compliant",
            last_inspection: "2024-01-05",
            next_inspection: "2024-07-05",
            documents: [
                { name: "CHED Recognition", status: "verified", expiry: "2028-08-20" },
                { name: "DepEd Permit", status: "verified", expiry: "2025-12-31" },
                { name: "Business Permit", status: "verified", expiry: "2024-12-31" },
                { name: "Fire Safety Certificate", status: "verified", expiry: "2025-06-15" }
            ],
            requirements: [
                { name: "Academic Programs", status: "compliant", notes: "All programs accredited" },
                { name: "Faculty Qualifications", status: "compliant", notes: "Highly qualified faculty" },
                { name: "Facilities", status: "compliant", notes: "State-of-the-art facilities" },
                { name: "Student Services", status: "compliant", notes: "Excellent student support" }
            ],
            notes: "University maintains highest standards of academic excellence."
        },
        {
            id: 3,
            school_name: "Caloocan City Technical Institute",
            accreditation_status: "pending",
            accreditation_type: "TESDA Accredited",
            accreditation_date: "2023-11-10",
            expiry_date: "2025-11-10",
            verification_score: 78,
            compliance_status: "partial",
            last_inspection: "2024-01-15",
            next_inspection: "2024-04-15",
            documents: [
                { name: "TESDA Recognition", status: "verified", expiry: "2025-11-10" },
                { name: "DepEd Permit", status: "pending", expiry: "2024-03-31" },
                { name: "Business Permit", status: "verified", expiry: "2024-12-31" },
                { name: "Fire Safety Certificate", status: "expired", expiry: "2023-12-31" }
            ],
            requirements: [
                { name: "Academic Programs", status: "compliant", notes: "Programs meet standards" },
                { name: "Faculty Qualifications", status: "partial", notes: "Some faculty need additional training" },
                { name: "Facilities", status: "compliant", notes: "Adequate facilities" },
                { name: "Student Services", status: "non-compliant", notes: "Student services need improvement" }
            ],
            notes: "School needs to address compliance issues before full verification."
        }
    ];

    React.useEffect(() => {
        setSchools(mockSchools);
    }, []);

    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.accreditation_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || school.accreditation_status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getComplianceColor = (status) => {
        switch (status) {
            case 'compliant': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'non-compliant': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification & Accreditation</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage school verification status, accreditation, and compliance monitoring</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Verification
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Verified Schools</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {schools.filter(s => s.accreditation_status === 'verified').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {schools.filter(s => s.accreditation_status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Avg. Score</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.round(schools.reduce((sum, s) => sum + s.verification_score, 0) / schools.length)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Compliant</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {schools.filter(s => s.compliance_status === 'compliant').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search schools..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="expired">Expired</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schools Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Accreditation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Compliance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Expiry</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                                        <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{school.school_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-400">Last inspection: {new Date(school.last_inspection).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{school.accreditation_type}</div>
                                            <div className="text-sm text-gray-500 dark:text-slate-400">
                                                Since: {new Date(school.accreditation_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-bold ${getScoreColor(school.verification_score)}`}>
                                                {school.verification_score}%
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                                                <div 
                                                    className={`h-2 rounded-full ${
                                                        school.verification_score >= 90 ? 'bg-green-500' : 
                                                        school.verification_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${school.verification_score}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(school.compliance_status)}`}>
                                                {school.compliance_status === 'compliant' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                                                 school.compliance_status === 'partial' ? <Clock className="w-3 h-3 mr-1" /> : 
                                                 <XCircle className="w-3 h-3 mr-1" />}
                                                {school.compliance_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(school.expiry_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-slate-400">
                                                {new Date(school.expiry_date) > new Date() ? 'Valid' : 'Expired'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.accreditation_status)}`}>
                                                {getStatusIcon(school.accreditation_status)}
                                                <span className="ml-1 capitalize">{school.accreditation_status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedSchool(school);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Edit Verification"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                    title="View Documents"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredSchools.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No schools found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding verification data.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Verification Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Verification</h2>
                                <button 
                                    onClick={() => setShowAddModal(false)} 
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-8">
                                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Add Verification Form</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    This form will be implemented to add verification and accreditation data for schools.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View School Details Modal */}
            {showViewModal && selectedSchool && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verification Details</h2>
                                <button 
                                    onClick={() => setShowViewModal(false)} 
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-16 w-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <Building className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSchool.school_name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{selectedSchool.accreditation_type}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSchool.accreditation_status)} mt-2`}>
                                            {getStatusIcon(selectedSchool.accreditation_status)}
                                            <span className="ml-1 capitalize">{selectedSchool.accreditation_status}</span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                        <div className={`text-2xl font-bold ${getScoreColor(selectedSchool.verification_score)}`}>
                                            {selectedSchool.verification_score}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Verification Score</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {new Date(selectedSchool.expiry_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Expiry Date</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {new Date(selectedSchool.next_inspection).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Next Inspection</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Documents</h4>
                                        <div className="space-y-2">
                                            {selectedSchool.documents.map((doc, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                    <span className="text-sm text-gray-900 dark:text-white">{doc.name}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {doc.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-slate-400">
                                                            {new Date(doc.expiry).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements</h4>
                                        <div className="space-y-2">
                                            {selectedSchool.requirements.map((req, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                                    <span className="text-sm text-gray-900 dark:text-white">{req.name}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getComplianceColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                                        {selectedSchool.notes}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PSDVerification;
