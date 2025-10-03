import React from 'react';
import { GraduationCap, Plus, Search, Filter, Edit, Trash2, Eye, Users, Calendar, DollarSign, Award, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

function PSDProgramsPartnerships() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [selectedProgram, setSelectedProgram] = React.useState(null);
    const [programs, setPrograms] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // Mock data for demonstration
    const mockPrograms = [
        {
            id: 1,
            name: "Caloocan City Academic Excellence Scholarship",
            type: "Merit-based",
            school: "Caloocan City Science High School",
            description: "Full scholarship for academically excellent students",
            status: "active",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            budget: 5000000,
            beneficiaries: 150,
            requirements: ["GPA 90+", "Financial need", "Good conduct"],
            benefits: ["Full tuition", "Monthly allowance", "Book allowance"],
            created_date: "2023-12-15",
            last_updated: "2024-01-15"
        },
        {
            id: 2,
            name: "UCC Leadership Development Program",
            type: "Leadership",
            school: "University of Caloocan City",
            description: "Scholarship for student leaders and future community leaders",
            status: "active",
            start_date: "2024-02-01",
            end_date: "2024-11-30",
            budget: 3000000,
            beneficiaries: 80,
            requirements: ["Leadership experience", "Community involvement", "GPA 85+"],
            benefits: ["Partial tuition", "Leadership training", "Mentorship"],
            created_date: "2023-11-20",
            last_updated: "2024-01-10"
        },
        {
            id: 3,
            name: "STEM Innovation Grant",
            type: "Research",
            school: "Caloocan City Science High School",
            description: "Research funding for STEM students",
            status: "pending",
            start_date: "2024-03-01",
            end_date: "2024-12-31",
            budget: 2000000,
            beneficiaries: 50,
            requirements: ["STEM major", "Research proposal", "Faculty recommendation"],
            benefits: ["Research funding", "Equipment access", "Conference support"],
            created_date: "2024-01-05",
            last_updated: "2024-01-05"
        }
    ];

    React.useEffect(() => {
        setPrograms(mockPrograms);
    }, []);

    const filteredPrograms = programs.filter(program => {
        const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            program.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            program.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Merit-based': return 'bg-blue-100 text-blue-800';
            case 'Leadership': return 'bg-purple-100 text-purple-800';
            case 'Research': return 'bg-green-100 text-green-800';
            case 'Need-based': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Programs & Partnerships</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage scholarship programs and school partnerships</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Program
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Programs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{programs.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Active Programs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {programs.filter(p => p.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Beneficiaries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {programs.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Budget</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₱{programs.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
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
                                    placeholder="Search programs..."
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programs Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Program</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">School</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Beneficiaries</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredPrograms.map((program) => (
                                    <tr key={program.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                                        <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{program.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">{program.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(program.type)}`}>
                                                {program.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{program.school}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">₱{program.budget.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{program.beneficiaries}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                                                {getStatusIcon(program.status)}
                                                <span className="ml-1 capitalize">{program.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProgram(program);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedProgram(program);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Edit Program"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete Program"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredPrograms.length === 0 && (
                    <div className="text-center py-12">
                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No programs found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new program.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Program Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Program</h2>
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
                                <Award className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Add Program Form</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    This form will be implemented to add new scholarship programs and partnerships.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Program Modal */}
            {showViewModal && selectedProgram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Program Details</h2>
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
                                        <GraduationCap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProgram.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{selectedProgram.school}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedProgram.type)} mt-2`}>
                                            {selectedProgram.type}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">{selectedProgram.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">₱{selectedProgram.budget.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Total Budget</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedProgram.beneficiaries}</div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Beneficiaries</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ₱{Math.round(selectedProgram.budget / selectedProgram.beneficiaries).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Per Beneficiary</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requirements</h4>
                                        <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                                            {selectedProgram.requirements.map((req, index) => (
                                                <li key={index} className="flex items-center">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Benefits</h4>
                                        <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                                            {selectedProgram.benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-center">
                                                    <Award className="w-4 h-4 text-orange-500 mr-2" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PSDProgramsPartnerships;
