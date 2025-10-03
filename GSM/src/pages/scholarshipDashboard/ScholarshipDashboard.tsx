import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/v1authStore';
import { scholarshipApiService } from '../../services/scholarshipApiService';
import { GraduationCap, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Clipboard, UserCheck, FileCheck, Hourglass, HandCoins, ChevronDown, RefreshCw, Upload, Eye, Send } from 'lucide-react';

export const ScholarshipDashboard: React.FC = () => {
  const currentUser = useAuthStore(s => s.currentUser);
  const [selectedSemester, setSelectedSemester] = useState('2024-2025-1ST');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Available semesters
  const availableSemesters = [
    { value: '2024-2025-1ST', label: '2024-2025 1st Semester' },
    { value: '2024-2025-2ND', label: '2024-2025 2nd Semester' },
    { value: '2023-2024-1ST', label: '2023-2024 1st Semester' },
    { value: '2023-2024-2ND', label: '2023-2024 2nd Semester' },
    { value: '2022-2023-1ST', label: '2022-2023 1st Semester' },
    { value: '2022-2023-2ND', label: '2022-2023 2nd Semester' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user applications and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [userApplications, requiredDocumentsData] = await Promise.all([
          scholarshipApiService.getUserApplications(),
          scholarshipApiService.getRequiredDocuments()
        ]);
        setApplications(userApplications);
        setRequiredDocuments(requiredDocumentsData);
        
        // Fetch documents if there's a current application
        if (userApplications.length > 0) {
          const currentApp = userApplications[0];
          try {
            const documentsData = await scholarshipApiService.getDocuments({
              application_id: currentApp.id
            });
            setDocuments(documentsData.data || []);
          } catch (docErr) {
            console.error('Error fetching documents:', docErr);
            // Don't set error for documents, just log it
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load application data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh applications and documents
  const refreshApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [userApplications, requiredDocumentsData] = await Promise.all([
        scholarshipApiService.getUserApplications(),
        scholarshipApiService.getRequiredDocuments()
      ]);
      setApplications(userApplications);
      setRequiredDocuments(requiredDocumentsData);
      
      // Refresh documents if there's a current application
      if (userApplications.length > 0) {
        const currentApp = userApplications[0];
        try {
          const documentsData = await scholarshipApiService.getDocuments({
            application_id: currentApp.id
          });
          setDocuments(documentsData.data || []);
        } catch (docErr) {
          console.error('Error refreshing documents:', docErr);
        }
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh application data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current application data (most recent or first one)
  const currentApplication = applications.length > 0 ? applications[0] : null;

  // Standard required documents for scholarship applications
  // Using actual document type IDs from the database
  const standardRequiredDocuments = [
    {
      id: 8, // High School Transcript of Records
      name: 'Transcript of Records (Latest)',
      description: 'Official transcript showing your latest academic performance and grades',
      category: 'academic',
      is_required: true,
      priority: 1
    },
    {
      id: 10, // Certificate of Good Moral Character
      name: 'Certificate of Good Moral',
      description: 'Certificate from your school confirming your good moral character',
      category: 'academic',
      is_required: true,
      priority: 2
    },
    {
      id: 11, // Income Tax Return (ITR)
      name: 'Income Certificate',
      description: 'Official document showing your family\'s income status from BIR or barangay',
      category: 'financial',
      is_required: true,
      priority: 3
    },
    {
      id: 4, // Barangay Certificate
      name: 'Barangay Certificate',
      description: 'Certificate from your barangay confirming your residency',
      category: 'residency',
      is_required: true,
      priority: 4
    },
    {
      id: 2, // Valid ID
      name: 'Valid ID (Government-issued)',
      description: 'Government-issued identification document (Driver\'s License, Passport, etc.)',
      category: 'identification',
      is_required: true,
      priority: 5
    },
    {
      id: 1, // Birth Certificate
      name: 'Birth Certificate',
      description: 'Official birth certificate from PSA (Philippine Statistics Authority)',
      category: 'identification',
      is_required: true,
      priority: 6
    },
    {
      id: 4, // Barangay Certificate (reusing for proof of residency)
      name: 'Proof of Residency',
      description: 'Document proving your current address (utility bill, lease agreement, etc.)',
      category: 'residency',
      is_required: true,
      priority: 7
    }
  ];

  // Create documents checklist
  const createDocumentsChecklist = () => {
    // Use API data if available, otherwise fall back to standard documents
    const documentsToCheck = requiredDocuments.length > 0 ? requiredDocuments : standardRequiredDocuments;
    
    const checklist = documentsToCheck.map(requiredDoc => {
      // For standard documents, try to match by document type ID or name
      const submittedDoc = documents.find(doc => {
        if (typeof requiredDoc.id === 'number') {
          // For numeric IDs, match directly
          return doc.document_type_id === requiredDoc.id;
        } else if (typeof requiredDoc.id === 'string') {
          // For string IDs (legacy), try to match by document type name
          return doc.document_type?.name?.toLowerCase().includes(requiredDoc.name.toLowerCase().split(' ')[0]);
        }
        return false;
      });
      
      return {
        id: requiredDoc.id,
        name: requiredDoc.name,
        description: requiredDoc.description,
        category: requiredDoc.category,
        isRequired: requiredDoc.is_required !== false, // Default to true if not specified
        isSubmitted: !!submittedDoc,
        status: submittedDoc ? submittedDoc.status : 'missing',
        submittedAt: submittedDoc ? new Date(submittedDoc.created_at).toLocaleDateString() : null,
        verifiedAt: submittedDoc?.verified_at ? new Date(submittedDoc.verified_at).toLocaleDateString() : null,
        verificationNotes: submittedDoc?.verification_notes || null,
        fileName: submittedDoc?.file_name || null,
        document: submittedDoc,
        priority: requiredDoc.priority || 999
      };
    });

    // Add any submitted documents that aren't in the required list
    documents.forEach(submittedDoc => {
      const isInRequired = documentsToCheck.some(req => {
        if (typeof req.id === 'number') {
          return req.id === submittedDoc.document_type_id;
        } else if (typeof req.id === 'string') {
          return submittedDoc.document_type?.name?.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]);
        }
        return false;
      });
      
      if (!isInRequired) {
        checklist.push({
          id: submittedDoc.document_type_id,
          name: submittedDoc.document_type?.name || 'Unknown Document',
          description: submittedDoc.document_type?.description || '',
          category: submittedDoc.document_type?.category || 'other',
          isRequired: false,
          isSubmitted: true,
          status: submittedDoc.status,
          submittedAt: new Date(submittedDoc.created_at).toLocaleDateString(),
          verifiedAt: submittedDoc.verified_at ? new Date(submittedDoc.verified_at).toLocaleDateString() : null,
          verificationNotes: submittedDoc.verification_notes || null,
          fileName: submittedDoc.file_name || null,
          document: submittedDoc,
          priority: 999
        });
      }
    });

    // Sort by priority (required documents first, then by priority number)
    return checklist.sort((a, b) => {
      if (a.isRequired && !b.isRequired) return -1;
      if (!a.isRequired && b.isRequired) return 1;
      return (a.priority || 999) - (b.priority || 999);
    });
  };

  const documentsChecklist = createDocumentsChecklist();
  const requiredDocumentsCount = documentsChecklist.filter(doc => doc.isRequired).length;
  const submittedRequiredCount = documentsChecklist.filter(doc => doc.isRequired && doc.isSubmitted).length;
  const verifiedRequiredCount = documentsChecklist.filter(doc => doc.isRequired && doc.status === 'verified').length;
  const completionPercentage = requiredDocumentsCount > 0 ? Math.round((submittedRequiredCount / requiredDocumentsCount) * 100) : 0;

  // Determine eligibility to submit: draft status AND all required documents submitted
  const canSubmitApplication = !!currentApplication 
    && currentApplication.status === 'draft'
    && requiredDocumentsCount > 0
    && submittedRequiredCount === requiredDocumentsCount;

  const handleSubmitApplication = async () => {
    if (!currentApplication) return;
    // Guard: prevent submit if requirements are incomplete
    if (!(requiredDocumentsCount > 0 && submittedRequiredCount === requiredDocumentsCount)) {
      setSubmitError('Please upload all required documents before submitting your application.');
      setTimeout(() => setSubmitError(null), 3000);
      return;
    }
    setIsSubmittingApp(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await scholarshipApiService.submitApplication(currentApplication.id);
      setSubmitSuccess('Application submitted successfully.');
      await refreshApplications();
    } catch (err) {
      console.error('Failed to submit application:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setIsSubmittingApp(false);
      setTimeout(() => setSubmitSuccess(null), 3000);
    }
  };

  // Simple file upload function for individual documents
  const uploadDocument = async (file: File, documentTypeId: string | number) => {
    if (!currentApplication) {
      setUploadError('No application found');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', currentApplication.student_id.toString());
      formData.append('application_id', currentApplication.id.toString());
      formData.append('document_type_id', documentTypeId.toString());

      // Debug logging
      console.log('Uploading document with data:', {
        student_id: currentApplication.student_id,
        application_id: currentApplication.id,
        document_type_id: documentTypeId,
        file_name: file.name,
        file_size: file.size
      });

      await scholarshipApiService.uploadDocument(formData);
      
      // Refresh documents after successful upload
      const documentsData = await scholarshipApiService.getDocuments({
        application_id: currentApplication.id
      });
      setDocuments(documentsData.data || []);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to get status display
  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'reviewed': return 'Reviewed';
      case 'approved': return 'Approved';
      case 'processing': return 'Processing';
      case 'released': return 'Released';
      case 'rejected': return 'Rejected';
      case 'on_hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  // Helper function to get current stage based on status
  const getCurrentStage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 0;           // Stage 0: General Requirements and Interview
      case 'submitted': return 0;       // Stage 0: General Requirements and Interview (when submitted)
      case 'reviewed': return 1;        // Stage 1: Endorsed to SSC Approval
      case 'approved': return 2;        // Stage 2: Approved Application
      case 'processing': return 3;      // Stage 3: Grants Processing
      case 'released': return 4;        // Stage 4: Grants Disbursed
      case 'rejected': return -1;       // Special case for rejected
      case 'on_hold': return 1;         // Stage 1: Endorsed to SSC Approval
      case 'cancelled': return -1;      // Special case for cancelled
      default: return 0;
    }
  };

  // Enhanced scholarship data with real application information
  const scholarshipData = currentApplication ? {
    referenceNumber: currentApplication.application_number || `APP-${currentApplication.id}`,
    studentName: `${currentApplication.student?.first_name || ''} ${currentApplication.student?.middle_name || ''} ${currentApplication.student?.last_name || ''}`.trim() || 'Not specified',
    course: currentApplication.student?.current_academic_record?.track_specialization || 
            currentApplication.student?.current_academic_record?.area_of_specialization || 
            currentApplication.student?.current_academic_record?.program || 'Not specified',
    school: currentApplication.school?.name || 'Not specified',
    academicYear: currentApplication.student?.current_academic_record?.school_year || 'Not specified',
    semester: currentApplication.student?.current_academic_record?.school_term || 'Not specified',
    scholarshipType: currentApplication.category?.name || 'Not specified',
    scholarshipSubtype: currentApplication.subcategory?.name || 'Not specified',
    amount: currentApplication.approved_amount ? `₱${currentApplication.approved_amount.toLocaleString()}` : 
            currentApplication.requested_amount ? `₱${currentApplication.requested_amount.toLocaleString()}` : 'Not specified',
    requestedAmount: currentApplication.requested_amount ? `₱${currentApplication.requested_amount.toLocaleString()}` : 'Not specified',
    approvedAmount: currentApplication.approved_amount ? `₱${currentApplication.approved_amount.toLocaleString()}` : 'Not approved',
    status: getStatusDisplay(currentApplication.status),
    applicationDate: currentApplication.submitted_at ? new Date(currentApplication.submitted_at).toLocaleDateString() : 'Not submitted',
    approvalDate: currentApplication.approved_at ? new Date(currentApplication.approved_at).toLocaleDateString() : 'Not approved',
    reviewedDate: currentApplication.reviewed_at ? new Date(currentApplication.reviewed_at).toLocaleDateString() : 'Not reviewed',
    currentStage: getCurrentStage(currentApplication.status),
    type: currentApplication.type === 'new' ? 'New Application' : 'Renewal Application',
    reasonForRenewal: currentApplication.reason_for_renewal || 'N/A',
    financialNeedDescription: currentApplication.financial_need_description || 'Not provided',
    rejectionReason: currentApplication.rejection_reason || null,
    notes: currentApplication.notes || null,
    marginalizedGroups: currentApplication.marginalized_groups || [],
    digitalWallets: currentApplication.digital_wallets || [],
    walletAccountNumber: currentApplication.wallet_account_number || 'Not provided',
    howDidYouKnow: currentApplication.how_did_you_know || [],
    isSchoolAtQC: currentApplication.is_school_at_qc || false,
    requirements: documents.map(doc => ({
      name: doc.document_type?.name || 'Unknown Document',
      status: doc.status === 'verified' ? 'Verified' : doc.status === 'rejected' ? 'Rejected' : 'Pending',
      date: new Date(doc.created_at).toLocaleDateString(),
      fileName: doc.file_name,
      verificationNotes: doc.verification_notes,
      verifiedAt: doc.verified_at ? new Date(doc.verified_at).toLocaleDateString() : null
    })),
    disbursements: [
      { date: 'May 15, 2024', amount: '₱12,500.00', status: 'Completed' },
      { date: 'August 15, 2024', amount: '₱12,500.00', status: 'Pending' }
    ]
  } : {
    referenceNumber: 'No Application',
    studentName: `${currentUser?.first_name || ''} ${currentUser?.middle_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Not specified',
    course: 'Not specified',
    school: 'Not specified',
    academicYear: 'Not specified',
    semester: 'Not specified',
    scholarshipType: 'Not specified',
    scholarshipSubtype: 'Not specified',
    amount: 'Not specified',
    requestedAmount: 'Not specified',
    approvedAmount: 'Not specified',
    status: 'No Application',
    applicationDate: 'Not submitted',
    approvalDate: 'Not approved',
    reviewedDate: 'Not reviewed',
    currentStage: -1,
    type: 'N/A',
    reasonForRenewal: 'N/A',
    financialNeedDescription: 'Not provided',
    rejectionReason: null,
    notes: null,
    marginalizedGroups: [],
    digitalWallets: [],
    walletAccountNumber: 'Not provided',
    howDidYouKnow: [],
    isSchoolAtQC: false,
    requirements: [],
    disbursements: []
  };

  // Scholarship process stages
  const processStages = [
    {
      id: 0,
      title: 'GENERAL REQUIREMENTS AND INTERVIEW',
      icon: Clipboard,
      description: 'Submit requirements and attend interview'
    },
    {
      id: 1,
      title: 'ENDORSED TO SSC APPROVAL',
      icon: UserCheck,
      description: 'Application reviewed by Student Services Committee'
    },
    {
      id: 2,
      title: 'APPROVED APPLICATION',
      icon: FileCheck,
      description: 'Application approved by committee'
    },
    {
      id: 3,
      title: 'GRANTS PROCESSING',
      icon: Hourglass,
      description: 'Processing grant disbursement'
    },
    {
      id: 4,
      title: 'GRANTS DISBURSED',
      icon: HandCoins,
      description: 'Funds released to student'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'released':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
      case 'reviewed':
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'released':
        return 'text-green-600 bg-green-100';
      case 'submitted':
      case 'reviewed':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-gray-900">Scholarship Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={refreshApplications}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              {/* Semester Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <span>{availableSemesters.find(s => s.value === selectedSemester)?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    {availableSemesters.map((semester) => (
                      <button
                        key={semester.value}
                        onClick={() => {
                          setSelectedSemester(semester.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none ${
                          selectedSemester === semester.value ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                        }`}
                      >
                        {semester.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600">Track your scholarship application and disbursements</p>
          
          {/* Loading and Error States */}
          {isLoading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-blue-700">Loading application data...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          {!isLoading && !error && applications.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-700">No applications found. Submit a new application to get started.</span>
              </div>
            </div>
          )}
        </div>

                 {/* Scholarship Process Flow */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
           <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Process</h2>
           <div className="relative">
                           {/* Progress Bar */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-in-out ${
                      scholarshipData.currentStage === -1 ? 'bg-red-500' : 'bg-orange-500'
                    }`}
                    style={{ 
                      width: scholarshipData.currentStage === -1 
                        ? '100%' 
                        : `${Math.max(0, ((scholarshipData.currentStage + 1) / processStages.length) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
             
             {/* Process Stages */}
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {processStages.map((stage, index) => {
                 const IconComponent = stage.icon;
                 const isCompleted = scholarshipData.currentStage === -1 ? false : index <= scholarshipData.currentStage;
                 const isCurrent = index === scholarshipData.currentStage;
                 const isRejected = scholarshipData.currentStage === -1;
                 
                 return (
                   <div key={stage.id} className="text-center">
                     <div className="relative mb-4">
                       <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isRejected
                            ? 'bg-red-500 border-red-500 text-white'
                            : isCompleted 
                            ? 'bg-orange-500 border-orange-500 text-white' 
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                         <IconComponent className="w-8 h-8" />
                       </div>
                       {isCurrent && !isRejected && (
                         <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                           <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                         </div>
                       )}
                       {isRejected && (
                         <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                           <AlertCircle className="w-3 h-3 text-white" />
                         </div>
                       )}
                     </div>
                     <h3 className={`text-xs font-bold uppercase mb-2 ${
                        isRejected 
                          ? 'text-red-600' 
                          : isCompleted ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                       {stage.title}
                     </h3>
                     <p className="text-xs text-gray-500 hidden md:block">
                       {stage.description}
                     </p>
                   </div>
                 );
               })}
             </div>
           </div>
         </div>

         {/* Reference Number Card */}
         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-lg font-semibold text-gray-900 mb-2">Reference Number</h2>
               <p className="text-2xl font-bold text-orange-600">{scholarshipData.referenceNumber}</p>
             </div>
             <div className={`px-4 py-2 rounded-full ${getStatusColor(scholarshipData.status)}`}>
               <div className="flex items-center space-x-2">
                 {getStatusIcon(scholarshipData.status)}
                 <span className="font-medium">{scholarshipData.status}</span>
               </div>
             </div>
           </div>
         </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{scholarshipData.studentName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Track/Area of Specialization</label>
                  <p className="text-gray-900">{scholarshipData.course}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <p className="text-gray-900">{scholarshipData.school}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <p className="text-gray-900">{scholarshipData.academicYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <p className="text-gray-900">{scholarshipData.semester}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Type</label>
                  <p className="text-gray-900">{scholarshipData.scholarshipType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Subtype</label>
                  <p className="text-gray-900">{scholarshipData.scholarshipSubtype}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                  <p className="text-gray-900">{scholarshipData.type}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount</label>
                  <p className="text-gray-900">{scholarshipData.requestedAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount</label>
                  <p className="text-gray-900">{scholarshipData.approvedAmount}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Financial Need Description</label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{scholarshipData.financialNeedDescription}</p>
                </div>
                {scholarshipData.walletAccountNumber !== 'Not provided' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Account Number</label>
                    <p className="text-gray-900">{scholarshipData.walletAccountNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                  <p className="text-gray-900">{scholarshipData.applicationDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed Date</label>
                  <p className="text-gray-900">{scholarshipData.reviewedDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
                  <p className="text-gray-900">{scholarshipData.approvalDate}</p>
                </div>
                {scholarshipData.type === 'Renewal Application' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Renewal</label>
                    <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{scholarshipData.reasonForRenewal}</p>
                  </div>
                )}
                {scholarshipData.rejectionReason && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-red-700 mb-1">Rejection Reason</label>
                    <p className="text-red-900 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{scholarshipData.rejectionReason}</p>
                  </div>
                )}
                {scholarshipData.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{scholarshipData.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Checklist */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Documents Checklist</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {submittedRequiredCount} of {requiredDocumentsCount} required documents submitted ({completionPercentage}% complete)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Document Completion Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      completionPercentage === 100 ? 'bg-green-500' : 
                      completionPercentage >= 75 ? 'bg-blue-500' : 
                      completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-4">
                {documentsChecklist.length > 0 ? (
                  (() => {
                    // Group documents by category
                    const groupedDocs = documentsChecklist.reduce((groups, item) => {
                      const category = item.category || 'other';
                      if (!groups[category]) {
                        groups[category] = [];
                      }
                      groups[category].push(item);
                      return groups;
                    }, {} as Record<string, typeof documentsChecklist>);

                    // Category labels
                    const categoryLabels = {
                      academic: '📚 Academic Documents',
                      financial: '💰 Financial Documents',
                      residency: '🏠 Residency Documents',
                      identification: '🆔 Identification Documents',
                      other: '📄 Other Documents'
                    };

                    return Object.entries(groupedDocs).map(([category, items]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                          {categoryLabels[category as keyof typeof categoryLabels] || `📄 ${category.charAt(0).toUpperCase() + category.slice(1)} Documents`}
                        </h4>
                        {items.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                      item.isRequired 
                        ? item.isSubmitted 
                          ? item.status === 'verified' 
                            ? 'bg-green-50 border-green-200' 
                            : item.status === 'rejected'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                          : 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {item.isSubmitted ? (
                              item.status === 'verified' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : item.status === 'rejected' ? (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-blue-500" />
                              )
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              {item.isRequired && (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  Required
                                </span>
                              )}
                              {!item.isRequired && (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                  Optional
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            {item.isSubmitted && (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-500">
                                  <strong>Submitted:</strong> {item.submittedAt}
                                  {item.fileName && ` (${item.fileName})`}
                                </p>
                                {item.verifiedAt && (
                                  <p className="text-sm text-green-600">
                                    <strong>Verified:</strong> {item.verifiedAt}
                                  </p>
                                )}
                                {item.verificationNotes && (
                                  <div className="mt-2 p-2 bg-white rounded border">
                                    <p className="text-sm text-gray-700">
                                      <strong>Verification Notes:</strong> {item.verificationNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.isSubmitted 
                              ? item.status === 'verified' 
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.isSubmitted 
                              ? item.status === 'verified' 
                                ? 'Verified' 
                                : item.status === 'rejected'
                                ? 'Rejected'
                                : 'Pending Review'
                              : 'Missing'
                            }
                          </span>
                          {item.isSubmitted && item.fileName && (
                            <button className="p-1 text-gray-500 hover:text-gray-700" title="View Document">
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          {currentApplication && (
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    uploadDocument(file, item.id);
                                  }
                                }}
                                className="hidden"
                                id={`upload-${item.id}`}
                                disabled={isUploading}
                              />
                              <label
                                htmlFor={`upload-${item.id}`}
                                className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                                  item.isSubmitted
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {item.isSubmitted ? 'Replace' : 'Upload'}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                        ))}
                      </div>
                    ));
                  })()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No document requirements found</p>
                    <p className="text-sm">Contact support if you believe this is an error</p>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              {documentsChecklist.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{requiredDocumentsCount}</p>
                      <p className="text-sm text-gray-600">Required</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{submittedRequiredCount}</p>
                      <p className="text-sm text-gray-600">Submitted</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{verifiedRequiredCount}</p>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{requiredDocumentsCount - submittedRequiredCount}</p>
                      <p className="text-sm text-gray-600">Missing</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Error Display */}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Disbursements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disbursements</h2>
              <div className="space-y-4">
                {scholarshipData.disbursements.map((disbursement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900">{disbursement.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-lg font-semibold text-gray-900">{disbursement.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(disbursement.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(disbursement.status)}`}>
                        {disbursement.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">{scholarshipData.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Application Date</span>
                  <span className="text-gray-900">{scholarshipData.applicationDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Approval Date</span>
                  <span className="text-gray-900">{scholarshipData.approvalDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Requirements</span>
                  <span className={`font-medium ${scholarshipData.requirements.length >= 7 ? 'text-green-600' : 'text-orange-600'}`}>
                    {scholarshipData.requirements.length}/7 Complete
                  </span>
                </div>
                {currentApplication && (
                  <div className="pt-2">
                    <button
                      onClick={handleSubmitApplication}
                      disabled={!canSubmitApplication || isSubmittingApp}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors ${
                        !canSubmitApplication || isSubmittingApp
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      title={!canSubmitApplication ? 'Submit is only available for draft applications' : 'Submit application'}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingApp ? 'Submitting…' : 'Submit Application'}
                    </button>
                    {!canSubmitApplication && (
                      <p className="mt-2 text-xs text-gray-500">Submit is enabled once all required documents are uploaded.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {applications.length === 0 ? (
                  <>
                    <button 
                      onClick={() => window.location.href = '/new-application'}
                      className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Submit New Application
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      View Application Guidelines
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Contact Support
                    </button>
                  </>
                ) : (
                  <>
                    {currentApplication && (
                      <button
                        onClick={handleSubmitApplication}
                        disabled={!canSubmitApplication || isSubmittingApp}
                        className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors ${
                          !canSubmitApplication || isSubmittingApp
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingApp ? 'Submitting…' : 'Submit Application'}
                      </button>
                    )}
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      View Application Details
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Contact Support
                    </button>
                  </>
                )}
              </div>
              {(submitError || submitSuccess) && (
                <div className={`mt-3 p-3 rounded-lg border ${submitError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center space-x-2">
                    {submitError ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`text-sm ${submitError ? 'text-red-700' : 'text-green-700'}`}>{submitError || submitSuccess}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
