import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { scholarshipApiService, type School, type ScholarshipCategory } from '../../services/scholarshipApiService';
import { useAuthStore } from '../../store/v1authStore';

// Local storage key for form data
const FORM_STORAGE_KEY = 'scholarship_application_form_data';


// Helper functions for local storage
const saveFormDataToStorage = (formData: any, currentStep: number) => {
  try {
    const dataToSave = {
      formData,
      currentStep,
      timestamp: Date.now()
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save form data to localStorage:', error);
  }
};

const loadFormDataFromStorage = () => {
  try {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Check if data is not too old (e.g., within 7 days)
      const isDataFresh = Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
      if (isDataFresh) {
        return parsed;
      } else {
        // Clear old data
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to load form data from localStorage:', error);
  }
  return null;
};

const clearFormDataFromStorage = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form data from localStorage:', error);
  }
};

export const NewApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.currentUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [scholarshipCategories, setScholarshipCategories] = useState<ScholarshipCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [gwaInputFormat, setGwaInputFormat] = useState<'gwa' | 'percentage'>('percentage');
  const [isCheckingApplications, setIsCheckingApplications] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    clearErrors,
    reset,
  } = useForm<any>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      extensionName: '',
      sex: '',
      civilStatus: '',
      dateOfBirth: '',
      religion: '',
      nationality: 'Filipino',
      birthPlace: '',
      heightCm: '',
      weightKg: '',
      isPwd: undefined,
      pwdSpecification: '',
      presentAddress: '',
      barangay: '',
      district: '',
      city: 'QUEZON CITY',
      zipCode: '',
      contactNumber: '',
      emailAddress: '',
      motherFirstName: '',
      motherLastName: '',
      motherMiddleName: '',
      motherExtensionName: '',
      parentContactNumber: '',
      fatherFirstName: '',
      fatherLastName: '',
      fatherMiddleName: '',
      fatherExtensionName: '',
      fatherContactNumber: '',
      isEmployed: '',
      totalAnnualIncome: '',
      monthlyIncome: '',
      numberOfChildren: '0',
      numberOfSiblings: '',
      homeOwnershipStatus: '',
      isSoloParent: '',
      isIndigenousGroup: '',
      isRegisteredVoter: '',
      voterNationality: '',
      paymentMethod: '',
      accountNumber: '',
      is4PsBeneficiary: '',
      preferredMobileNumber: '',
      scholarshipCategory: '',
      scholarshipSubCategory: '',
      howDidYouKnow: [],
      educationalLevel: 'TERTIARY/COLLEGE',
      isSchoolAtCaloocan: 'YES',
      schoolName: '',
      campus: '',
      schoolContactNumber: '',
      schoolClassification: 'LOCAL UNIVERSITY/COLLEGE (LUC)',
      unitsEnrolled: '',
      gradeYearLevel: '1st Year',
      currentTrackSpecialization: '',
      areaOfSpecialization: '',
      schoolTerm: '1st Semester',
      schoolYear: '2024-2025',
      previousSchool: '',
      unitsCompleted: 'N/A',
      generalWeightedAverage: '',
      financialNeedDescription: 'Financial assistance needed for education',
      requestedAmount: '50000',
      marginalizedGroups: [],
      digitalWallets: [],
      birthCertificate: null,
      reportCard: null,
      incomeCertificate: null,
      barangayCertificate: null,
      idPicture: null,
      otherDocuments: null,
    },
  });

  const isPwd = watch('isPwd');
  const paymentMethod = watch('paymentMethod');

  // Define field groups for each step
  const stepFields = {
    1: ['lastName', 'firstName', 'sex', 'civilStatus', 'dateOfBirth', 'nationality', 'birthPlace', 'presentAddress', 'barangay', 'district', 'city', 'zipCode', 'contactNumber', 'emailAddress'],
    2: ['motherFirstName', 'motherLastName', 'fatherFirstName', 'fatherLastName'],
    3: ['isEmployed', 'totalAnnualIncome', 'monthlyIncome', 'numberOfChildren', 'numberOfSiblings', 'homeOwnershipStatus', 'isSoloParent', 'isIndigenousGroup', 'isRegisteredVoter', 'paymentMethod', 'accountNumber', 'is4PsBeneficiary'],
    4: ['scholarshipCategory', 'scholarshipSubCategory', 'educationalLevel', 'isSchoolAtCaloocan', 'schoolName', 'campus', 'schoolContactNumber', 'schoolClassification', 'unitsEnrolled', 'gradeYearLevel', 'currentTrackSpecialization', 'areaOfSpecialization', 'schoolTerm', 'schoolYear', 'previousSchool', 'unitsCompleted', 'generalWeightedAverage']
  };


  // Function to validate current step before proceeding
  const validateCurrentStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate = stepFields[step as keyof typeof stepFields] || [];
    
    // For step 1, conditionally include pwdSpecification based on isPwd
    if (step === 1) {
      const currentIsPwd = watch('isPwd');
      if (!currentIsPwd) {
        // Remove pwdSpecification from validation if PWD is false
        fieldsToValidate = fieldsToValidate.filter(field => field !== 'pwdSpecification');
      }
    }
    
    // For step 3, conditionally include accountNumber based on paymentMethod
    if (step === 3) {
      const currentPaymentMethod = watch('paymentMethod');
      if (currentPaymentMethod && currentPaymentMethod !== 'Cash') {
        // Include accountNumber in validation
        fieldsToValidate = [...fieldsToValidate];
      } else {
        // Remove accountNumber from validation if not needed
        fieldsToValidate = fieldsToValidate.filter(field => field !== 'accountNumber');
      }
    }
    
    
    console.log(`Validating step ${step} fields:`, fieldsToValidate);
    console.log(`Current step is: ${currentStep}`);
    
    // Clear errors for fields not in current step
    const allFields = [
      ...stepFields[1],
      ...stepFields[2], 
      ...stepFields[3],
      ...stepFields[4]
    ];
    // Clear errors for fields not in current step
    fieldsToValidate.forEach(field => {
      if (allFields.includes(field)) {
        clearErrors(field as any);
      }
    });
    
    // Small delay to ensure errors are cleared
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Only validate the specific fields for the current step
    const isValid = await trigger(fieldsToValidate);
    console.log(`Step ${step} validation result:`, isValid);
    
    // Log current form values for debugging
    const currentValues = watch();
    console.log('Current form values:', currentValues);
    
    // Log which fields have errors
    console.log('Form errors:', errors);
    console.log('isPwd value:', watch('isPwd'));
    console.log('isPwd type:', typeof watch('isPwd'));
    
    return isValid;
  };

  // Helper function to parse income values
  const parseIncomeToNumber = (incomeString: string): number => {
    if (!incomeString) return 0;
    
    // Handle different income range formats
    if (incomeString.includes('Below')) return 50000; // Below 100,000
    if (incomeString.includes('Above')) return 750000; // Above 500,000
    if (incomeString.includes('-')) {
      const [min, max] = incomeString.split('-').map(s => parseInt(s.replace(/[^\d]/g, '')));
      return (min + max) / 2; // Return average
    }
    
    return parseFloat(incomeString.replace(/[^\d]/g, '')) || 0;
  };

  // Helper function to convert percentage to GWA (1.00-5.00 scale, 1.00 being highest)
  const convertPercentageToGWA = (percentage: number): number => {
    // Clamp percentage to valid range (0-100)
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    if (clampedPercentage >= 96) return 1.00;
    if (clampedPercentage >= 94) return 1.25;
    if (clampedPercentage >= 92) return 1.50;
    if (clampedPercentage >= 89) return 1.75;
    if (clampedPercentage >= 87) return 2.00;
    if (clampedPercentage >= 84) return 2.25;
    if (clampedPercentage >= 82) return 2.50;
    if (clampedPercentage >= 79) return 2.75;
    if (clampedPercentage >= 75) return 3.00;
    return 5.00; // Below 75
  };



  // Check for existing applications on component mount
  useEffect(() => {
    const checkExistingApplications = async () => {
      if (!currentUser) {
        setIsCheckingApplications(false);
        return;
      }

      try {
        setIsCheckingApplications(true);
        const applications = await scholarshipApiService.getUserApplications();
        
        // Check if user has any pending or active applications
        // Pending/Active statuses: draft, submitted, reviewed, approved, processing, released, on_hold
        // Only rejected and cancelled applications allow new applications
        const activeStatuses = ['draft', 'submitted', 'reviewed', 'approved', 'processing', 'released', 'on_hold'];
        const hasActive = applications.some(app => activeStatuses.includes(app.status?.toLowerCase()));
        
        setAccessDenied(hasActive);
        console.log('User applications:', applications);
        console.log('Has active application:', hasActive);
      } catch (error) {
        console.error('Error checking existing applications:', error);
        // If there's an error, allow access (fail open)
        setAccessDenied(false);
      } finally {
        setIsCheckingApplications(false);
      }
    };

    checkExistingApplications();
  }, [currentUser]);

  // Load reference data and saved form data on component mount
  useEffect(() => {
    const loadReferenceData = async () => {
      setIsLoadingData(true);
      try {
        const [schoolsData, categoriesData] = await Promise.all([
          scholarshipApiService.getSchools(),
          scholarshipApiService.getScholarshipCategories()
        ]);
        
        // Ensure data is in array format
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
        setScholarshipCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        console.log('Loaded schools:', schoolsData);
        console.log('Loaded categories:', categoriesData);
      } catch (error) {
        console.error('Failed to load reference data:', error);
        setSubmitError('Failed to load form data. Please refresh the page.');
        // Set empty arrays as fallback
        setSchools([]);
        setScholarshipCategories([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadReferenceData();
  }, []);

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = loadFormDataFromStorage();
    if (savedData) {
      console.log('Loading saved form data:', savedData);
      reset(savedData.formData);
      setCurrentStep(savedData.currentStep);
      setSelectedCategoryId(savedData.formData.scholarshipCategory ? parseInt(savedData.formData.scholarshipCategory) : null);
      setSelectedSubcategoryId(savedData.formData.scholarshipSubCategory ? parseInt(savedData.formData.scholarshipSubCategory) : null);
      setSelectedSchoolId(savedData.formData.schoolName ? parseInt(savedData.formData.schoolName) : null);
      setGwaInputFormat(savedData.formData.gwaInputFormat || 'percentage');
    }
  }, [reset]);

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    const subscription = watch((formData) => {
      const dataToSave = {
        ...formData,
        gwaInputFormat
      };
      saveFormDataToStorage(dataToSave, currentStep);
    });
    return () => subscription.unsubscribe();
  }, [watch, currentStep, gwaInputFormat]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform form data to match API structure
      if (!currentUser?.citizen_id) {
        setIsSubmitting(false);
        setSubmitError('Your citizen ID is missing. Please log in again or contact support.');
        return;
      }
      
      const applicationData = {
        // Student data
        citizen_id: currentUser.citizen_id,
        // user_id will be set by the backend from auth_user
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        middle_name: data.middleName || null,
        extension_name: data.extensionName || null,
        sex: data.sex || 'Male',
        civil_status: data.civilStatus || 'Single',
        nationality: data.nationality || 'Filipino',
        birth_place: data.birthPlace || null,
        birth_date: data.dateOfBirth || null,
        is_pwd: Boolean(data.isPwd),
        pwd_specification: data.pwdSpecification || null,
        religion: data.religion || null,
        height_cm: data.heightCm ? parseFloat(data.heightCm) : null,
        weight_kg: data.weightKg ? parseFloat(data.weightKg) : null,
        contact_number: data.contactNumber || null,
        email_address: data.emailAddress || null,
        is_employed: false, // Default value
        is_job_seeking: false, // Default value
        is_currently_enrolled: true, // Default value
        is_graduating: false, // Default value
        is_solo_parent: data.isSoloParent === 'yes',
        is_indigenous_group: data.isIndigenousGroup === 'yes',
        is_registered_voter: data.isRegisteredVoter === 'yes',
        voter_nationality: data.voterNationality || null,
        has_paymaya_account: data.paymentMethod === 'PayMaya',
        preferred_mobile_number: data.preferredMobileNumber || null,

        // Addresses
        addresses: [
          {
            type: 'present',
            address_line_1: data.presentAddress || '',
            address_line_2: null,
            barangay: data.barangay || null,
            district: data.district || null,
            city: data.city || 'Caloocan City',
            province: 'Metro Manila',
            region: 'NCR',
            zip_code: data.zipCode || null,
          }
        ],

        // Family members
        family_members: [
          {
            relationship: 'father',
            first_name: data.fatherFirstName || '',
            last_name: data.fatherLastName || '',
            middle_name: data.fatherMiddleName || null,
            extension_name: data.fatherExtensionName || null,
            contact_number: data.fatherContactNumber || null,
            monthly_income: data.totalAnnualIncome ? parseIncomeToNumber(data.totalAnnualIncome) / 12 : null,
            is_alive: true,
            is_employed: true,
            is_ofw: false,
            is_pwd: false,
            pwd_specification: null,
          },
          {
            relationship: 'mother',
            first_name: data.motherFirstName || '',
            last_name: data.motherLastName || '',
            middle_name: data.motherMiddleName || null,
            extension_name: data.motherExtensionName || null,
            contact_number: data.parentContactNumber || null,
            monthly_income: null,
            is_alive: true,
            is_employed: false,
            is_ofw: false,
            is_pwd: false,
            pwd_specification: null,
          }
        ],

        // Financial information
        financial_information: {
          total_annual_income: data.isEmployed === 'yes' && data.totalAnnualIncome ? parseIncomeToNumber(data.totalAnnualIncome) : null,
          monthly_income: data.isEmployed === 'yes' && data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
          number_of_children: parseInt(data.numberOfChildren) || 0,
          number_of_siblings: parseInt(data.numberOfSiblings) || 0,
          home_ownership_status: data.homeOwnershipStatus?.toLowerCase() || null,
          is_4ps_beneficiary: data.is4PsBeneficiary === 'yes',
        },

        // Application data
        category_id: selectedCategoryId || 1, // Use selected category ID
        subcategory_id: selectedSubcategoryId || 1, // Use selected subcategory ID
        school_id: selectedSchoolId || 2, // Use selected school ID
        type: 'new',
        financial_need_description: data.financialNeedDescription || 'Financial assistance needed for education',
        requested_amount: data.requestedAmount ? parseFloat(data.requestedAmount) : 50000,
        marginalized_groups: data.marginalizedGroups || [],
        digital_wallets: data.paymentMethod && data.paymentMethod !== 'Cash' ? [data.paymentMethod] : [],
        wallet_account_number: data.accountNumber || null,
        how_did_you_know: data.howDidYouKnow || [],
        is_school_at_caloocan: data.isSchoolAtCaloocan === 'YES',

        // Academic record
        academic_record: {
          educational_level: data.educationalLevel || 'TERTIARY/COLLEGE',
          program: data.currentTrackSpecialization || null,
          major: data.areaOfSpecialization || null,
          track_specialization: data.currentTrackSpecialization || null,
          area_of_specialization: data.areaOfSpecialization || null,
          year_level: data.gradeYearLevel || '1st Year',
          school_year: data.schoolYear || '2024-2025',
          school_term: data.schoolTerm || '1st Semester',
          units_enrolled: data.unitsEnrolled ? parseInt(data.unitsEnrolled) : null,
          units_completed: data.unitsCompleted !== 'N/A' ? parseInt(data.unitsCompleted) : null,
          general_weighted_average: data.generalWeightedAverage ? (() => {
            const inputValue = parseFloat(data.generalWeightedAverage);
            let gwa;
            
            if (gwaInputFormat === 'percentage') {
              gwa = convertPercentageToGWA(inputValue);
              console.log(`Converting GWA: ${inputValue}% -> ${gwa} GWA`);
            } else {
              gwa = inputValue; // Already in GWA format
              console.log(`Using GWA directly: ${gwa}`);
            }
            
            return gwa;
          })() : null,
          previous_school: data.previousSchool || null,
          is_graduating: false,
        },

        // Documents will be handled separately via document upload
        // uploaded_document_ids: Object.values(uploadedDocuments).map(doc => doc.id)
      };

      console.log('Submitting application data:', applicationData);
      console.log('Selected IDs:', { selectedCategoryId, selectedSubcategoryId, selectedSchoolId });
      console.log('Form data:', data);
      
      // Check authentication before submitting
      const token = localStorage.getItem('auth_token');
      console.log('Auth token present:', !!token);
      console.log('Auth token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Save the application as draft
      let result;
      try {
        result = await scholarshipApiService.submitNewApplication(applicationData);
        console.log('Application saved as draft successfully:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', result ? Object.keys(result) : 'result is null/undefined');
        console.log('Student data:', result?.student);
      } catch (apiError) {
        console.error('API draft save error:', apiError);
        console.error('Error details:', {
          message: apiError instanceof Error ? apiError.message : String(apiError),
          stack: apiError instanceof Error ? apiError.stack : undefined,
          name: apiError instanceof Error ? apiError.name : 'Unknown'
        });
        
        // Handle specific database constraint violations
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        if (errorMessage.includes('Duplicate entry') && errorMessage.includes('citizen_id_unique')) {
          throw new Error('A student record with this information already exists. Please contact support if you believe this is an error.');
        } else if (errorMessage.includes('Integrity constraint violation')) {
          throw new Error('There was a data validation error. Please check your information and try again.');
        } else {
          throw new Error(`Failed to save draft: ${errorMessage}`);
        }
      }
      
      
      setShowSuccessModal(true);
      
      // Clear saved form data after successful submission
      clearFormDataFromStorage();
      
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking applications
  if (isCheckingApplications) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">New Scholarship Application</h1>
            </div>
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking your application status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user has active applications
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Access Restricted</h1>
            </div>
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">New Application Not Available</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You currently have a pending or active scholarship application. Please complete or wait for your current application to be processed before submitting a new one.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/scholarship-dashboard')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  View My Dashboard
                </button>
                <div>
                  <button
                    onClick={() => navigate('/portal')}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Return to Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">New Scholarship Application</h1>
                <p className="text-orange-100 mt-1">Complete all sections to submit your application</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
                    clearFormDataFromStorage();
                    reset();
                    setCurrentStep(1);
                    setSelectedCategoryId(null);
                    setSelectedSubcategoryId(null);
                    setSelectedSchoolId(null);
                    setGwaInputFormat('percentage');
                    clearErrors();
                  }
                }}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors text-sm"
              >
                Clear Form
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    PERSONAL INFORMATION <span className="text-gray-600 text-lg">(Import from CaloocanCitizen ID)</span>
                  </h2>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    edit personal information
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: 'Last Name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{String(errors.lastName.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: 'First Name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{String(errors.firstName.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <Controller
                      name="middleName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extension Name</label>
                    <Controller
                      name="extensionName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., Jr., Sr., III"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  {/* Demographics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sex *</label>
                    <Controller
                      name="sex"
                      control={control}
                      rules={{ required: 'Sex is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      )}
                    />
                    {errors.sex && <p className="mt-1 text-sm text-red-600">{String(errors.sex.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status *</label>
                    <Controller
                      name="civilStatus"
                      control={control}
                      rules={{ required: 'Civil Status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      )}
                    />
                    {errors.civilStatus && <p className="mt-1 text-sm text-red-600">{String(errors.civilStatus.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      rules={{ required: 'Date of Birth is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{String(errors.dateOfBirth.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                    <Controller
                      name="religion"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                    <Controller
                      name="nationality"
                      control={control}
                      rules={{ required: 'Nationality is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.nationality && <p className="mt-1 text-sm text-red-600">{String(errors.nationality.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place *</label>
                    <Controller
                      name="birthPlace"
                      control={control}
                      rules={{ required: 'Birth Place is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.birthPlace && <p className="mt-1 text-sm text-red-600">{String(errors.birthPlace.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <Controller
                      name="heightCm"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <Controller
                      name="weightKg"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  {/* PWD Status */}
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Is PWD *</label>
                    <div className="flex space-x-4">
                      <Controller
                        name="isPwd"
                        control={control}
                        rules={{}}
                        render={({ field }) => (
                          <>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                {...field}
                                value="true"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="mr-2"
                              />
                              YES
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                {...field}
                                value="false"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                className="mr-2"
                              />
                              NO
                            </label>
                          </>
                        )}
                      />
                    </div>
                    {errors.isPwd && <p className="mt-1 text-sm text-red-600">{String(errors.isPwd.message)}</p>}
                  </div>

                  {isPwd && (
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">If PWD, Specify *</label>
                      <Controller
                        name="pwdSpecification"
                        control={control}
                        rules={{ 
                          required: isPwd ? 'PWD specification is required' : false 
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="SPECIFY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        )}
                      />
                      {errors.pwdSpecification && <p className="mt-1 text-sm text-red-600">{String(errors.pwdSpecification.message)}</p>}
                    </div>
                  )}

                  {/* Address Information */}
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Present Address *</label>
                    <Controller
                      name="presentAddress"
                      control={control}
                      rules={{ required: 'Present Address is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.presentAddress && <p className="mt-1 text-sm text-red-600">{String(errors.presentAddress.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay *</label>
                    <Controller
                      name="barangay"
                      control={control}
                      rules={{ required: 'Barangay is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.barangay && <p className="mt-1 text-sm text-red-600">{String(errors.barangay.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <Controller
                      name="district"
                      control={control}
                      rules={{ required: 'District is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.district && <p className="mt-1 text-sm text-red-600">{String(errors.district.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{String(errors.city.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                    <Controller
                      name="zipCode"
                      control={control}
                      rules={{ required: 'Zip Code is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{String(errors.zipCode.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Contact Number *</label>
                    <Controller
                      name="contactNumber"
                      control={control}
                      rules={{ required: 'Contact Number is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{String(errors.contactNumber.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Email Address *</label>
                    <Controller
                      name="emailAddress"
                      control={control}
                      rules={{ 
                        required: 'Email Address is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email format'
                        }
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.emailAddress && <p className="mt-1 text-sm text-red-600">{String(errors.emailAddress.message)}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Parent Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    PARENT'S INFORMATION <span className="text-gray-600 text-lg">(Import from CaloocanCitizen ID)</span>
                  </h2>
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    edit personal information
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mother's Information */}
                  <div className="col-span-full">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Mother's Maiden Name</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <Controller
                      name="motherFirstName"
                      control={control}
                      rules={{ required: 'Mother\'s First Name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.motherFirstName && <p className="mt-1 text-sm text-red-600">{String(errors.motherFirstName.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <Controller
                      name="motherLastName"
                      control={control}
                      rules={{ required: 'Mother\'s Last Name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.motherLastName && <p className="mt-1 text-sm text-red-600">{String(errors.motherLastName.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <Controller
                      name="motherMiddleName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extension Name</label>
                    <Controller
                      name="motherExtensionName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., Jr., Sr., III"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <Controller
                      name="parentContactNumber"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  {/* Father's Information */}
                  <div className="col-span-full mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Father's Name</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Controller
                      name="fatherFirstName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Controller
                      name="fatherLastName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <Controller
                      name="fatherMiddleName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extension Name</label>
                    <Controller
                      name="fatherExtensionName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., Jr., Sr., III"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <Controller
                      name="fatherContactNumber"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment & Income Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Employment & Income Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Employment Status Question */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you currently employed? *</label>
                    <Controller
                      name="isEmployed"
                      control={control}
                      rules={{ required: 'Employment status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Option</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      )}
                    />
                    {errors.isEmployed && <p className="mt-1 text-sm text-red-600">{String(errors.isEmployed.message)}</p>}
                  </div>

                  {/* Conditional Income Fields - Only show if employed */}
                  {watch('isEmployed') === 'yes' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Annual Income *</label>
                        <Controller
                          name="totalAnnualIncome"
                          control={control}
                          rules={{ required: watch('isEmployed') === 'yes' ? 'Total Annual Income is required' : false }}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="">Select Income Range</option>
                              <option value="Below 100,000">Below ₱100,000</option>
                              <option value="100,000-200,000">₱100,000 - ₱200,000</option>
                              <option value="200,000-300,000">₱200,000 - ₱300,000</option>
                              <option value="300,000-400,000">₱300,000 - ₱400,000</option>
                              <option value="400,000-500,000">₱400,000 - ₱500,000</option>
                              <option value="Above 500,000">Above ₱500,000</option>
                            </select>
                          )}
                        />
                        {errors.totalAnnualIncome && <p className="mt-1 text-sm text-red-600">{String(errors.totalAnnualIncome.message)}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income *</label>
                        <Controller
                          name="monthlyIncome"
                          control={control}
                          rules={{ required: watch('isEmployed') === 'yes' ? 'Monthly Income is required' : false }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter monthly income"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          )}
                        />
                        {errors.monthlyIncome && <p className="mt-1 text-sm text-red-600">{String(errors.monthlyIncome.message)}</p>}
                      </div>
                    </>
                  )}

                  {/* Show message if not employed */}
                  {watch('isEmployed') === 'no' && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-blue-800 text-sm">
                          <strong>Note:</strong> Since you are not currently employed, you may still be eligible for need-based scholarships. 
                          Please continue with the other required information below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Children *</label>
                    <Controller
                      name="numberOfChildren"
                      control={control}
                      rules={{ required: 'Number of Children is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.numberOfChildren && <p className="mt-1 text-sm text-red-600">{String(errors.numberOfChildren.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Siblings *</label>
                    <Controller
                      name="numberOfSiblings"
                      control={control}
                      rules={{ required: 'Number of Siblings is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.numberOfSiblings && <p className="mt-1 text-sm text-red-600">{String(errors.numberOfSiblings.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Ownership Status *</label>
                    <Controller
                      name="homeOwnershipStatus"
                      control={control}
                      rules={{ required: 'Home Ownership Status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Owned">Owned</option>
                          <option value="Rented">Rented</option>
                          <option value="Living with relatives">Living with relatives</option>
                          <option value="Boarding house">Boarding house</option>
                          <option value="Others">Others</option>
                        </select>
                      )}
                    />
                    {errors.homeOwnershipStatus && <p className="mt-1 text-sm text-red-600">{String(errors.homeOwnershipStatus.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you a Solo Parent? *</label>
                    <Controller
                      name="isSoloParent"
                      control={control}
                      rules={{ required: 'Solo Parent status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Option</option>
                          <option value="yes">YES</option>
                          <option value="no">NO</option>
                        </select>
                      )}
                    />
                    {errors.isSoloParent && <p className="mt-1 text-sm text-red-600">{String(errors.isSoloParent.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you a member of an indigenous group? *</label>
                    <Controller
                      name="isIndigenousGroup"
                      control={control}
                      rules={{ required: 'Indigenous Group status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Option</option>
                          <option value="yes">YES</option>
                          <option value="no">NO</option>
                        </select>
                      )}
                    />
                    {errors.isIndigenousGroup && <p className="mt-1 text-sm text-red-600">{String(errors.isIndigenousGroup.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you a registered voter? *</label>
                    <Controller
                      name="isRegisteredVoter"
                      control={control}
                      rules={{ required: 'Registered Voter status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Option</option>
                          <option value="yes">YES</option>
                          <option value="no">NO</option>
                        </select>
                      )}
                    />
                    {errors.isRegisteredVoter && <p className="mt-1 text-sm text-red-600">{String(errors.isRegisteredVoter.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      rules={{ required: 'Payment method is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Payment Method</option>
                          <option value="PayMaya">PayMaya</option>
                          <option value="GCash">GCash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash">Cash</option>
                        </select>
                      )}
                    />
                    {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{String(errors.paymentMethod.message)}</p>}
                  </div>

                  {paymentMethod && paymentMethod !== 'Cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                      <Controller
                        name="accountNumber"
                        control={control}
                        rules={{ required: 'Account number is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your account number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        )}
                      />
                      {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{String(errors.accountNumber.message)}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you a 4Ps (Pantawid Pamilyang Pilipino Program) beneficiary? *</label>
                    <Controller
                      name="is4PsBeneficiary"
                      control={control}
                      rules={{ required: '4Ps beneficiary status is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Option</option>
                          <option value="yes">YES</option>
                          <option value="no">NO</option>
                        </select>
                      )}
                    />
                    {errors.is4PsBeneficiary && <p className="mt-1 text-sm text-red-600">{String(errors.is4PsBeneficiary.message)}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Scholarship Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Scholarship and Enrollment Information</h2>
                
                {isLoadingData && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <p className="mt-2 text-gray-600">Loading form data...</p>
                  </div>
                )}

                {!isLoadingData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Category *</label>
                    <Controller
                      name="scholarshipCategory"
                      control={control}
                      rules={{ required: 'Scholarship Category is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const categoryId = parseInt(e.target.value);
                            setSelectedCategoryId(categoryId);
                            // Reset subcategory when category changes
                            setSelectedSubcategoryId(null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Scholarship Category</option>
                          {Array.isArray(scholarshipCategories) && scholarshipCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.scholarshipCategory && <p className="mt-1 text-sm text-red-600">{String(errors.scholarshipCategory.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Subcategory *</label>
                    <Controller
                      name="scholarshipSubCategory"
                      control={control}
                      rules={{ required: 'Scholarship Subcategory is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const subcategoryId = parseInt(e.target.value);
                            setSelectedSubcategoryId(subcategoryId);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={!selectedCategoryId}
                        >
                          <option value="">Select Subcategory</option>
                          {selectedCategoryId && Array.isArray(scholarshipCategories) && scholarshipCategories
                            .find(cat => cat.id === selectedCategoryId)
                            ?.subcategories?.map((subcategory) => (
                              <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </option>
                            ))}
                        </select>
                      )}
                    />
                    {errors.scholarshipSubCategory && <p className="mt-1 text-sm text-red-600">{String(errors.scholarshipSubCategory.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Educational Level *</label>
                    <Controller
                      name="educationalLevel"
                      control={control}
                      rules={{ required: 'Educational Level is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="TERTIARY/COLLEGE">TERTIARY/COLLEGE</option>
                          <option value="SENIOR HIGH SCHOOL">SENIOR HIGH SCHOOL</option>
                          <option value="VOCATIONAL">VOCATIONAL</option>
                        </select>
                      )}
                    />
                    {errors.educationalLevel && <p className="mt-1 text-sm text-red-600">{String(errors.educationalLevel.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Is Current School at Caloocan? *</label>
                    <Controller
                      name="isSchoolAtCaloocan"
                      control={control}
                      rules={{ required: 'School location is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="YES">YES</option>
                          <option value="NO">NO</option>
                        </select>
                      )}
                    />
                    {errors.isSchoolAtCaloocan && <p className="mt-1 text-sm text-red-600">{String(errors.isSchoolAtCaloocan.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name of School *</label>
                    <Controller
                      name="schoolName"
                      control={control}
                      rules={{ required: 'School Name is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const schoolId = parseInt(e.target.value);
                            setSelectedSchoolId(schoolId);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select School</option>
                          {Array.isArray(schools) && schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.schoolName && <p className="mt-1 text-sm text-red-600">{String(errors.schoolName.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campus *</label>
                    <Controller
                      name="campus"
                      control={control}
                      rules={{ required: 'Campus is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.campus && <p className="mt-1 text-sm text-red-600">{String(errors.campus.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number of School (LANDLINE) *</label>
                    <Controller
                      name="schoolContactNumber"
                      control={control}
                      rules={{ required: 'School Contact Number is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., 88 0633 24"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.schoolContactNumber && <p className="mt-1 text-sm text-red-600">{String(errors.schoolContactNumber.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Classification *</label>
                    <Controller
                      name="schoolClassification"
                      control={control}
                      rules={{ required: 'School Classification is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="LOCAL UNIVERSITY/COLLEGE (LUC)">LOCAL UNIVERSITY/COLLEGE (LUC)</option>
                          <option value="PRIVATE UNIVERSITY/COLLEGE">PRIVATE UNIVERSITY/COLLEGE</option>
                          <option value="STATE UNIVERSITY/COLLEGE">STATE UNIVERSITY/COLLEGE</option>
                          <option value="TECHNICAL INSTITUTE">TECHNICAL INSTITUTE</option>
                        </select>
                      )}
                    />
                    {errors.schoolClassification && <p className="mt-1 text-sm text-red-600">{String(errors.schoolClassification.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units Currently Enrolled *</label>
                    <Controller
                      name="unitsEnrolled"
                      control={control}
                      rules={{ required: 'Units Enrolled is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Write N/A if Senior High School Student"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.unitsEnrolled && <p className="mt-1 text-sm text-red-600">{String(errors.unitsEnrolled.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Grade/Year Level *</label>
                    <Controller
                      name="gradeYearLevel"
                      control={control}
                      rules={{ required: 'Grade/Year Level is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Grade/Year Level</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="5th Year">5th Year</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      )}
                    />
                    {errors.gradeYearLevel && <p className="mt-1 text-sm text-red-600">{String(errors.gradeYearLevel.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Track/Area of Specialization *</label>
                    <Controller
                      name="currentTrackSpecialization"
                      control={control}
                      rules={{ required: 'Current Track/Area of Specialization is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.currentTrackSpecialization && <p className="mt-1 text-sm text-red-600">{String(errors.currentTrackSpecialization.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area of Specialization *</label>
                    <Controller
                      name="areaOfSpecialization"
                      control={control}
                      rules={{ required: 'Area of Specialization is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Write N/A if not applicable"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.areaOfSpecialization && <p className="mt-1 text-sm text-red-600">{String(errors.areaOfSpecialization.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Term/Semester *</label>
                    <Controller
                      name="schoolTerm"
                      control={control}
                      rules={{ required: 'School Term/Semester is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Term</option>
                          <option value="1st Semester">1st Semester</option>
                          <option value="2nd Semester">2nd Semester</option>
                          <option value="Summer">Summer</option>
                        </select>
                      )}
                    />
                    {errors.schoolTerm && <p className="mt-1 text-sm text-red-600">{String(errors.schoolTerm.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Year *</label>
                    <Controller
                      name="schoolYear"
                      control={control}
                      rules={{ required: 'School Year is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="e.g., 2023-2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.schoolYear && <p className="mt-1 text-sm text-red-600">{String(errors.schoolYear.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Completed *</label>
                    <Controller
                      name="unitsCompleted"
                      control={control}
                      rules={{ required: 'Units Completed is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Write N/A if Senior High School Student"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.unitsCompleted && <p className="mt-1 text-sm text-red-600">{String(errors.unitsCompleted.message)}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">General Weighted Average *</label>
                    
                    {/* Input Format Selection */}
                    <div className="mb-2">
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gwaFormat"
                            value="percentage"
                            checked={gwaInputFormat === 'percentage'}
                            onChange={() => setGwaInputFormat('percentage')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Percentage (0-100)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gwaFormat"
                            value="gwa"
                            checked={gwaInputFormat === 'gwa'}
                            onChange={() => setGwaInputFormat('gwa')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">GWA (1.00-5.00)</span>
                        </label>
                      </div>
                    </div>

                    <Controller
                      name="generalWeightedAverage"
                      control={control}
                      rules={{ 
                        required: 'General Weighted Average is required',
                        validate: (value) => {
                          if (!value) return true; // Let required rule handle empty values
                          
                          const numValue = parseFloat(value);
                          if (isNaN(numValue)) return 'Please enter a valid number';
                          
                          if (gwaInputFormat === 'percentage') {
                            if (numValue < 0 || numValue > 100) {
                              return 'Percentage must be between 0 and 100';
                            }
                          } else {
                            if (numValue < 1.00 || numValue > 5.00) {
                              return 'GWA must be between 1.00 and 5.00';
                            }
                          }
                          
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step={gwaInputFormat === 'percentage' ? '0.01' : '0.25'}
                          min={gwaInputFormat === 'percentage' ? '0' : '1.00'}
                          max={gwaInputFormat === 'percentage' ? '100' : '5.00'}
                          placeholder={gwaInputFormat === 'percentage' ? 'e.g., 96' : 'e.g., 1.25'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.generalWeightedAverage && <p className="mt-1 text-sm text-red-600">{String(errors.generalWeightedAverage.message)}</p>}
                    
                    {/* Conversion Info */}
                    {gwaInputFormat === 'percentage' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Will be converted to GWA scale (1.00-5.00, where 1.00 is highest)
                      </p>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}


            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next button clicked, current step:', currentStep);
                    const isValid = await validateCurrentStep(currentStep);
                    console.log('Validation result:', isValid);
                    if (isValid) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      console.log('Validation failed, staying on step:', currentStep);
                    }
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 text-white rounded-md flex items-center ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSubmitting ? 'Saving…' : 'Save Draft'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Draft Saved Successfully!</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Your application has been saved as a draft. Please upload the required documents and submit when ready.
                </p>
                
                {/* Document Upload Reminder */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">📄 Important: Upload Required Documents</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        To complete your application, you need to upload the required documents through your dashboard. 
                        Your application will not be processed until all documents are uploaded.
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        <p><strong>Required documents:</strong></p>
                        <ul className="mt-1 ml-4 list-disc text-left space-y-1">
                          <li>Birth Certificate (PSA/NSO authenticated copy)</li>
                          <li>Transcript of Records (Latest)</li>
                          <li>Certificate of Good Moral Character</li>
                          <li>Income Certificate</li>
                          <li>Barangay Certificate</li>
                          <li>Valid ID (Government-issued)</li>
                          <li>Proof of Residency</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                      </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/scholarship-dashboard');
                  }}
                  className="px-4 py-2 bg-orange-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
