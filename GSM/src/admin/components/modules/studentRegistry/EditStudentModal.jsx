import React, { useEffect, useState } from 'react';
import { X, Save, CheckCircle } from 'lucide-react';
import { getApiUrl, API_CONFIG, getAuthServiceUrl } from '../../../../config/api';

function EditStudentModal({ isOpen, onClose, student, onUpdated }) {
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

    useEffect(() => {
        if (!isOpen || !student) return;
        // Prefill from provided row if available. Optionally fetch full details.
        const preload = {
            first_name: student.first_name || '',
            middle_name: student.middle_name || '',
            last_name: student.last_name || '',
            email: student.email || '',
            dob: student.dob || '',
            gender: student.gender || '',
            year_level: student.year_level || '',
            campus: student.campus || '',
            program: student.program || '',
            student_number: student.student_number || '',
            contact_info: student.contact_info || { phone: '', address: '' },
        };
        setFormData(preload);
        setErrors({});
    }, [isOpen, student]);

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
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!student?.student_uuid) return;
        
        // Show confirmation dialog instead of submitting immediately
        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmation(false);
        setLoading(true);
        try {
            // Build payload sending only non-empty values to respect 'sometimes|required'
            const payload = {};
            const passthroughKeys = ['first_name','middle_name','last_name','dob','gender','year_level','campus','program','student_number'];
            passthroughKeys.forEach(k => {
                const v = formData[k];
                if (v !== undefined && v !== null && String(v).trim() !== '') {
                    payload[k] = v;
                }
            });
            // contact_info if any sub-field present
            const phone = formData.contact_info?.phone || '';
            const address = formData.contact_info?.address || '';
            if (phone.trim() !== '' || address.trim() !== '') {
                payload.contact_info = {};
                if (phone.trim() !== '') payload.contact_info.phone = phone;
                if (address.trim() !== '') payload.contact_info.address = address;
            }
            const res = await fetch(`${getAuthServiceUrl(API_CONFIG.AUTH_SERVICE.ENDPOINTS.STUDENTS)}/${student.student_uuid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                // Show local success toast
                setShowSuccessToast(true);
                // Call parent callback
                onUpdated(result.data);
                // Auto-dismiss success toast after 3 seconds
                setTimeout(() => setShowSuccessToast(false), 3000);
                // Close modal after showing success toast
                setTimeout(() => onClose(), 2000);
            } else {
                if (result.errors) setErrors(result.errors);
                else setErrors({ general: result.message || 'Failed to update student' });
            }
        } catch (err) {
            setErrors({ general: 'Network error while updating student' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Student</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                </div>
                <div className="px-6 pb-6">
                    {showSuccessToast && (
                        <div className="mb-4 p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-lg flex items-center justify-between shadow-lg">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Student updated successfully!</span>
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
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{errors.general}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Number</label>
                                <input type="text" name="student_number" value={formData.student_number} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                                    <option value="">Select gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year Level</label>
                                <input type="text" name="year_level" value={formData.year_level} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campus</label>
                                <select name="campus" value={formData.campus} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                                    <option value="">Select campus</option>
                                    <option value="North Campus">North Campus</option>
                                    <option value="South Campus">South Campus</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
                            <select
                                name="program"
                                value={formData.program}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input type="text" name="contact_info.phone" value={formData.contact_info?.phone || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <input type="text" name="contact_info.address" value={formData.contact_info?.address || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2">
                                <Save className="w-4 h-4" />
                                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Update Student</h3>
                                <button 
                                    onClick={() => setShowConfirmation(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Are you sure you want to update the information for <strong>{formData.first_name} {formData.last_name}</strong>?
                                </p>
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Updated Details:</p>
                                    <p className="text-sm text-gray-900 dark:text-white">Email: {formData.email}</p>
                                    {formData.program && <p className="text-sm text-gray-900 dark:text-white">Program: {formData.program}</p>}
                                    {formData.campus && <p className="text-sm text-gray-900 dark:text-white">Campus: {formData.campus}</p>}
                                    {formData.year_level && <p className="text-sm text-gray-900 dark:text-white">Year Level: {formData.year_level}</p>}
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
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save Changes</span>
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
                        <span className="font-semibold">Student updated successfully!</span>
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

export default EditStudentModal; 