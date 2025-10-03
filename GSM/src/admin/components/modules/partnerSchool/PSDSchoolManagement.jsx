import React from 'react';
import { School as SchoolIcon, Plus, Search, Filter, Edit, Trash2, Eye, MapPin, Users, Phone, Mail, Globe, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function PSDSchoolManagement() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showViewModal, setShowViewModal] = React.useState(false);
    const [selectedSchool, setSelectedSchool] = React.useState(null);
    const [schools, setSchools] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // Mock data for demonstration
    const mockSchools = [
        {
            id: 1,
            name: "Caloocan City Science High School",
            type: "Public High School",
            address: "123 Education St.",
            city: "Caloocan City",
            region: "NCR",
            province: "Metro Manila",
            status: "active",
            contact_person: "Dr. Maria Santos",
            phone: "+63 2 1234-5678",
            email: "info@ccshs.edu.ph",
            website: "www.ccshs.edu.ph",
            accreditation: "DepEd Accredited",
            total_students: 2500,
            scholarship_recipients: 150,
            last_updated: "2024-01-15"
        },
        {
            id: 2,
            name: "University of Caloocan City",
            type: "State University",
            address: "456 University Ave.",
            city: "Caloocan City",
            region: "NCR",
            province: "Metro Manila",
            status: "active",
            contact_person: "Dr. Juan Dela Cruz",
            phone: "+63 2 2345-6789",
            email: "admin@ucc.edu.ph",
            website: "www.ucc.edu.ph",
            accreditation: "CHED Accredited",
            total_students: 15000,
            scholarship_recipients: 800,
            last_updated: "2024-01-10"
        }
    ];

    React.useEffect(() => {
        setSchools(mockSchools);
    }, []);

    const filteredSchools = schools.filter(school => {
        const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            school.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Management</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage partner school information, contact details, and accreditation status</p>
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New School
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
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
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Students</th>
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
                                                        <SchoolIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{school.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-400">{school.accreditation}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{school.type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {[school.address, school.city, school.region].filter(Boolean).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{school.contact_person}</div>
                                            <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {school.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{school.total_students.toLocaleString()}</div>
                                            <div className="text-sm text-orange-600 dark:text-orange-400">{school.scholarship_recipients} scholars</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status)}`}>
                                                {getStatusIcon(school.status)}
                                                <span className="ml-1 capitalize">{school.status}</span>
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
                                                    onClick={() => {
                                                        setSelectedSchool(school);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Edit School"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete School"
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

                {filteredSchools.length === 0 && (
                    <div className="text-center py-12">
                        <SchoolIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No schools found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                            {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new school.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add School Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New School</h2>
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
                                <Building className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Add School Form</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    This form will be implemented to add new partner schools to the database.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View School Modal */}
            {showViewModal && selectedSchool && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">School Details</h2>
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
                                        <SchoolIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSchool.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-400">{selectedSchool.type}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <Users className="w-4 h-4 mr-2" />
                                                {selectedSchool.contact_person}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <Phone className="w-4 h-4 mr-2" />
                                                {selectedSchool.phone}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {selectedSchool.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <Globe className="w-4 h-4 mr-2" />
                                                {selectedSchool.website}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {selectedSchool.address}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400">
                                                {selectedSchool.city}, {selectedSchool.region}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSchool.total_students.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Total Students</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedSchool.scholarship_recipients}</div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Scholarship Recipients</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {((selectedSchool.scholarship_recipients / selectedSchool.total_students) * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-slate-400">Scholarship Rate</div>
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

export default PSDSchoolManagement;
