import React from 'react';
import { X } from 'lucide-react';
import { API_CONFIG, getScholarshipServiceUrl } from '../../../../config/api';

function ViewStudentModal({ isOpen, onClose, student }) {
    const [details, setDetails] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (!isOpen || !student?.student_uuid) return;
        let isCancelled = false;
        const fetchDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const url = `${getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS)}/${student.student_uuid}`;
                const token = localStorage.getItem('auth_token');
                const res = await fetch(url, { headers: { 
                    Accept: 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                } });
                const json = await res.json();
                if (!isCancelled) {
                    if (json.success) {
                        setDetails(json.data);
                    } else {
                        setError(json.message || 'Failed to load student details');
                    }
                }
            } catch (e) {
                if (!isCancelled) setError('Network error while loading details');
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };
        fetchDetails();
        return () => { isCancelled = true; };
    }, [isOpen, student?.student_uuid]);

    if (!isOpen) return null;

    const program = details?.program || '—';
    const courses = details?.course_registrations || details?.courses || [];
    const grades = details?.grades || [];
    const nameLine = details?.first_name || details?.middle_name || details?.last_name
        ? [details?.first_name, details?.middle_name, details?.last_name].filter(Boolean).join(' ')
        : student?.name;

    const dob = details?.dob || '—';
    const genderMap = { M: 'Male', F: 'Female' };
    const gender = details?.gender ? (genderMap[details.gender] || details.gender) : '—';
    const phone = details?.contact_info?.phone || '—';
    const address = details?.contact_info?.address || '—';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
                    )}
                    
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 dark:border-slate-600 pb-2">
                            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Personal Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Name</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{nameLine}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Student Number</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{details?.student_number || student.studentId}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Email</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{details?.email || student.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Date of Birth</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{dob}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Gender</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{gender}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Phone</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{phone}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase text-gray-500 font-medium">Address</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{address}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase text-gray-500 font-medium">Medical Needs</p>
                                {loading ? (
                                    <p className="text-sm text-gray-600 mt-1">Loading…</p>
                                ) : details?.medical_needs ? (
                                    <p className="text-sm text-gray-900 dark:text-white mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-4 border-blue-400">{details.medical_needs}</p>
                                ) : (
                                    <p className="text-sm text-gray-600 mt-1 italic">No medical needs specified</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 dark:border-slate-600 pb-2">
                            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Academic Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Year Level</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{details?.year_level || student.year_level || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Program</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{loading ? 'Loading…' : program}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-500 font-medium">Campus</p>
                                <p className="text-sm text-gray-900 dark:text-white mt-1">{details?.campus || student.campus || '—'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-gray-500 font-medium mb-2">Courses</p>
                            {loading ? (
                                <p className="text-sm text-gray-600">Loading…</p>
                            ) : courses.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">No courses registered</p>
                            ) : (
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                    <ul className="space-y-1">
                                        {courses.map((c, idx) => (
                                            <li key={idx} className="text-sm text-gray-900 dark:text-white flex items-center">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                {c.course_code} {c.status ? `— ${c.status}` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs uppercase text-gray-500 font-medium mb-2">Grades</p>
                            {loading ? (
                                <p className="text-sm text-gray-600">Loading…</p>
                            ) : grades.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">No grades available</p>
                            ) : (
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                    <ul className="space-y-1">
                                        {grades.map((g, idx) => (
                                            <li key={idx} className="text-sm text-gray-900 dark:text-white flex items-center justify-between">
                                                <span>{g.course_code}</span>
                                                <span className="font-medium">{g.grade} ({g.term})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Close</button>
                </div>
            </div>
        </div>
    );
}

export default ViewStudentModal; 