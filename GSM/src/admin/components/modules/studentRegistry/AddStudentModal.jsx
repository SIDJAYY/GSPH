import React, { useState } from 'react';
import { X, UserPlus, Calendar, Phone, MapPin, CheckCircle } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function AddStudentModal({ isOpen, onClose, onStudentAdded }) {
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        dob: '',
        gender: '',
        year_level: '',
        campus: '',
        program: '',
        student_number: '',
        contact_info: {
            phone: '',
            address: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        // year_level, campus, program, student_number optional

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Show confirmation dialog instead of submitting immediately
        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Show local success toast
                setShowSuccessToast(true);
                console.log('Success toast should be visible now');
                // Call parent callback
                onStudentAdded(result.data);
                // Auto-dismiss success toast after 3 seconds
                setTimeout(() => {
                    setShowSuccessToast(false);
                    console.log('Success toast dismissed');
                }, 3000);
                // Close modal after showing success toast
                setTimeout(() => {
                    console.log('Closing modal');
                    handleClose();
                }, 2000);
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    let errorMessage = result.message || 'Failed to add student';
                    if (result.message && result.message.includes('Database connection error')) {
                        errorMessage = 'Database connection error. Please check if the Laravel server is running and the database is configured properly.';
                    }
                    setErrors({ general: errorMessage });
                }
            }
        } catch (error) {
            console.error('Error adding student:', error);
            setErrors({ general: `Network error. Please check if the Laravel API server is running on ${API_CONFIG.BASE_URL}.` });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            dob: '',
            gender: '',
            year_level: '',
            campus: '',
            program: '',
            student_number: '',
            contact_info: {
                phone: '',
                address: ''
            }
        });
        setErrors({});
        setLoading(false);
        setShowConfirmation(false);
        setShowSuccessToast(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <UserPlus className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Student</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Enter student information</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {showSuccessToast && (
                        <div className="mb-4 p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-lg flex items-center justify-between shadow-lg">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Student added successfully!</span>
                            </div>
                            <button 
                                onClick={() => setShowSuccessToast(false)}
                                className="text-green-700 hover:text-green-900 font-bold text-lg"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                                        errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                    }`}
                                    placeholder="Enter first name"
                                />
                                {errors.first_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Middle Name (optional)
                                </label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="Enter middle name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                                        errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                    }`}
                                    placeholder="Enter last name"
                                />
                                {errors.last_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Student Number (optional)
                                </label>
                                <input
                                    type="text"
                                    name="student_number"
                                    value={formData.student_number}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="Leave empty to auto-generate"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date of Birth *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                                            errors.dob ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                        }`}
                                    />
                                </div>
                                {errors.dob && (
                                    <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white ${
                                        errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                    }`}
                                >
                                    <option value="">Select gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Year Level (optional)
                                </label>
                                <input
                                    type="text"
                                    name="year_level"
                                    value={formData.year_level}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="e.g., 1st Year"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Campus (optional)
                                </label>
                                <select
                                    name="campus"
                                    value={formData.campus}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Select campus</option>
                                    <option value="North Campus">North Campus</option>
                                    <option value="South Campus">South Campus</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Program (optional)
                            </label>
                            <select
                                name="program"
                                value={formData.program}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select program</option>
                                <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                                <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                                <option value="Bachelor of Science in Accountancy">Bachelor of Science in Accountancy</option>
                                <option value="Bachelor of Science in Business Administration">Bachelor of Science in Business Administration</option>
                                <option value="Bachelor of Science in Criminology">Bachelor of Science in Criminology</option>
                                <option value="Bachelor of Science in Nursing">Bachelor of Science in Nursing</option>
                                <option value="Bachelor of Science in Education">Bachelor of Science in Education</option>
                                <option value="Bachelor of Science in Engineering">Bachelor of Science in Engineering</option>
                                <option value="Bachelor of Arts in Psychology">Bachelor of Arts in Psychology</option>
                                <option value="Bachelor of Science in Hospitality Management">Bachelor of Science in Hospitality Management</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="tel"
                                    name="contact_info.phone"
                                    value={formData.contact_info.phone}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <textarea
                                    name="contact_info.address"
                                    value={formData.contact_info.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                                    placeholder="Enter address"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add Student</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Add Student</h3>
                                <button 
                                    onClick={() => setShowConfirmation(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to add <strong>{formData.first_name} {formData.last_name}</strong> to the student registry?
                                </p>
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Student Details:</p>
                                    <p className="text-sm text-gray-900 dark:text-white">Email: {formData.email}</p>
                                    {formData.program && <p className="text-sm text-gray-900 dark:text-white">Program: {formData.program}</p>}
                                    {formData.campus && <p className="text-sm text-gray-900 dark:text-white">Campus: {formData.campus}</p>}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>Add Student</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Position Success Toast */}
            {showSuccessToast && (
                <div className="fixed top-4 right-4 z-[60] p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Student added successfully!</span>
                    </div>
                    <button 
                        onClick={() => setShowSuccessToast(false)}
                        className="text-green-700 hover:text-green-900 font-bold text-lg ml-4"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

export default AddStudentModal;