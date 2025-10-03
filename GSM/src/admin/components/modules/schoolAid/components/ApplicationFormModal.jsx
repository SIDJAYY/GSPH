import React, { useState, useEffect } from 'react';
import { X, Save, User, School, DollarSign, Phone, MapPin, FileText, Mail } from 'lucide-react';
import schoolAidService from '../../../../../config/schoolAidService';

function ApplicationFormModal({ application, onClose, onSave, mode = 'add' }) {
    const [formData, setFormData] = useState({
        // Student information (manual input)
        studentName: '',
        studentNumber: '',
        studentEmail: '',
        studentPhone: '',
        schoolName: '',
        campus: '',
        // Application information
        aidType: '',
        amount: '',
        currency: 'PHP',
        grade: '',
        guardian: '',
        contact: '',
        address: '',
        remarks: '',
        // Bank account details
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        accountType: 'savings',
        routingNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Aid type options - match backend constants
    const aidTypes = [
        { value: 'educational_supplies', label: 'Educational Supplies' },
        { value: 'transportation', label: 'Transportation Aid' },
        { value: 'meal_allowance', label: 'Meal Allowance' },
        { value: 'uniform_assistance', label: 'Uniform Assistance' },
        { value: 'scholarship', label: 'Scholarship' },
        { value: 'loan', label: 'Student Loan' },
        { value: 'stipend', label: 'Research Stipend' }
    ];

    // Grade level options
    const gradeLevels = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
        'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
        '1st Year College', '2nd Year College', '3rd Year College', '4th Year College'
    ];

    // Account type options - including digital wallets
    const accountTypes = [
        { value: 'savings', label: 'Savings Account', category: 'bank' },
        { value: 'checking', label: 'Checking Account', category: 'bank' },
        { value: 'current', label: 'Current Account', category: 'bank' },
        { value: 'gcash', label: 'GCash', category: 'digital_wallet' },
        { value: 'maya', label: 'Maya', category: 'digital_wallet' },
        { value: 'paymaya', label: 'PayMaya', category: 'digital_wallet' },
        { value: 'coins_ph', label: 'Coins.ph', category: 'digital_wallet' },
        { value: 'grabpay', label: 'GrabPay', category: 'digital_wallet' },
        { value: 'shopee_pay', label: 'ShopeePay', category: 'digital_wallet' },
        { value: 'other_digital_wallet', label: 'Other Digital Wallet', category: 'digital_wallet' }
    ];

    // Helper function to check if account type is a digital wallet
    const isDigitalWallet = (accountType) => {
        return accountTypes.find(type => type.value === accountType)?.category === 'digital_wallet';
    };

    useEffect(() => {
        if (application && mode === 'edit') {
            setFormData({
                studentName: application.studentName || '',
                studentNumber: application.studentId || '',
                studentEmail: application.studentEmail || '',
                studentPhone: application.studentPhone || '',
                schoolName: application.school || '',
                campus: application.campus || '',
                aidType: application.aidType || '',
                amount: application.amount ? application.amount.replace('₱', '').replace(',', '') : '',
                currency: application.currency || 'PHP',
                grade: application.grade || '',
                guardian: application.guardian || '',
                contact: application.contact || '',
                address: application.address || '',
                remarks: application.remarks || '',
                // Bank account details
                bankName: application.bankName || '',
                accountNumber: application.accountNumber || '',
                accountHolderName: application.accountHolderName || '',
                accountType: application.accountType || 'savings',
                routingNumber: application.routingNumber || ''
            });
        }
    }, [application, mode]);

    const validateForm = () => {
        const newErrors = {};

        // Student information validation
        if (!formData.studentName) newErrors.studentName = 'Student name is required';
        if (!formData.studentNumber) newErrors.studentNumber = 'Student number is required';
        if (!formData.studentEmail) newErrors.studentEmail = 'Student email is required';
        if (!formData.studentPhone) newErrors.studentPhone = 'Student phone is required';
        if (!formData.schoolName) newErrors.schoolName = 'School name is required';
        if (!formData.campus) newErrors.campus = 'Campus is required';
        
        // Application information validation
        if (!formData.aidType) newErrors.aidType = 'Aid type is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.grade) newErrors.grade = 'Grade level is required';
        if (!formData.guardian) newErrors.guardian = 'Guardian name is required';
        if (!formData.contact) newErrors.contact = 'Contact number is required';
        if (!formData.address) newErrors.address = 'Address is required';
        
        // Bank account validation
        if (!formData.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name is required';
        // Only require routing number for traditional bank accounts
        if (!isDigitalWallet(formData.accountType) && !formData.routingNumber) {
            newErrors.routingNumber = 'Routing number is required for bank accounts';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const applicationData = {
                ...formData,
                amount: parseFloat(formData.amount),
                // Create a student object for the service
                selectedStudent: {
                    full_name: formData.studentName,
                    student_number: formData.studentNumber,
                    email: formData.studentEmail,
                    phone: formData.studentPhone,
                    campus: formData.campus
                }
            };

            await onSave(applicationData);
            onClose();
        } catch (error) {
            console.error('Failed to save application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        {mode === 'edit' ? 'Edit Aid Application' : 'New Aid Application'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Student Information Section */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-orange-500" />
                            Student Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Student Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.studentName}
                                        onChange={(e) => handleInputChange('studentName', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.studentName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="Enter student's full name"
                                    />
                                </div>
                                {errors.studentName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Student Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.studentNumber}
                                    onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                        errors.studentNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                    placeholder="e.g., STU-2024-001"
                                />
                                {errors.studentNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.studentNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Student Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={formData.studentEmail}
                                        onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.studentEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="student@email.com"
                                    />
                                </div>
                                {errors.studentEmail && (
                                    <p className="text-red-500 text-sm mt-1">{errors.studentEmail}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Student Phone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.studentPhone}
                                        onChange={(e) => handleInputChange('studentPhone', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.studentPhone ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="09123456789"
                                    />
                                </div>
                                {errors.studentPhone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.studentPhone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    School Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <School className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.schoolName}
                                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.schoolName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="e.g., Ateneo de Manila University"
                                    />
                                </div>
                                {errors.schoolName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Campus <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.campus}
                                    onChange={(e) => handleInputChange('campus', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                        errors.campus ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                    placeholder="e.g., Loyola Heights"
                                />
                                {errors.campus && (
                                    <p className="text-red-500 text-sm mt-1">{errors.campus}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Application Information Section */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-orange-500" />
                            Application Information
                        </h3>

                        {/* Aid Type and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Aid Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FileText className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={formData.aidType}
                                        onChange={(e) => handleInputChange('aidType', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.aidType ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                    >
                                        <option value="">Select aid type</option>
                                        {aidTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.aidType && (
                                    <p className="text-red-500 text-sm mt-1">{errors.aidType}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                )}
                            </div>
                        </div>

                        {/* Grade Level and Guardian */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Grade Level <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <School className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={formData.grade}
                                        onChange={(e) => handleInputChange('grade', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.grade ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                    >
                                        <option value="">Select grade level</option>
                                        {gradeLevels.map(grade => (
                                            <option key={grade} value={grade}>
                                                {grade}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.grade && (
                                    <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Guardian's Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.guardian}
                                        onChange={(e) => handleInputChange('guardian', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.guardian ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="Guardian's full name"
                                    />
                                </div>
                                {errors.guardian && (
                                    <p className="text-red-500 text-sm mt-1">{errors.guardian}</p>
                                )}
                            </div>
                        </div>

                        {/* Contact and Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.contact}
                                        onChange={(e) => handleInputChange('contact', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.contact ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="09123456789"
                                    />
                                </div>
                                {errors.contact && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white ${
                                            errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="Complete address"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 dark:bg-slate-700 dark:text-white"
                                placeholder="Additional notes or remarks..."
                            />
                        </div>
                    </div>

                    {/* Bank Account Details Section */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                            Bank Account Details
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Provide your bank account details for payment disbursement. This information will be used to process your aid payment.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {isDigitalWallet(formData.accountType) ? 'Digital Wallet / Bank Name' : 'Bank Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-slate-700 dark:text-white ${
                                        errors.bankName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                    placeholder={isDigitalWallet(formData.accountType) ? "e.g., GCash, Maya, BDO" : "e.g., BDO, BPI, Metrobank"}
                                />
                                {errors.bankName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {isDigitalWallet(formData.accountType) ? 'Mobile Number / Account Number' : 'Account Number'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-slate-700 dark:text-white ${
                                        errors.accountNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                    placeholder={isDigitalWallet(formData.accountType) ? "e.g., 09123456789" : "e.g., 1234567890"}
                                />
                                {errors.accountNumber && (
                                    <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Account Holder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.accountHolderName}
                                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-slate-700 dark:text-white ${
                                        errors.accountHolderName ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                    placeholder="Name as it appears on account"
                                />
                                {errors.accountHolderName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Account Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.accountType}
                                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-slate-700 dark:text-white ${
                                        errors.accountType ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                    }`}
                                >
                                    <option value="">Select account type</option>
                                    <optgroup label="Bank Accounts">
                                        {accountTypes.filter(type => type.category === 'bank').map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Digital Wallets">
                                        {accountTypes.filter(type => type.category === 'digital_wallet').map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                {errors.accountType && (
                                    <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>
                                )}
                            </div>

                            {/* Only show routing number for traditional bank accounts */}
                            {!isDigitalWallet(formData.accountType) && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Routing Number / Swift Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.routingNumber}
                                        onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-slate-700 dark:text-white ${
                                            errors.routingNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                                        }`}
                                        placeholder="e.g., BDOCCAMM, BPIPHMM, MBTCPHMM"
                                    />
                                    {errors.routingNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.routingNumber}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {mode === 'edit' ? 'Update Application' : 'Create Application'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ApplicationFormModal; 