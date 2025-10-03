import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FileText, Upload, CheckCircle, User, GraduationCap, DollarSign, MapPin, Phone, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Alert } from '../../components/ui/Alert';
import { useAuthStore } from '../../store/v1authStore';
import * as yup from 'yup';

interface RenewalFormData {
  // Personal Information
  lastName: string;
  firstName: string;
  middleName: string;
  extensionName: string;
  sex: string;
  civilStatus: string;
  nationality: string;
  birthPlace: string;
  birthDate: string;
  isPWD: string;
  pwdSpecification: string;
  religion: string;
  
  // Address Information
  presentBarangay: string;
  presentDistrict: string;
  presentCity: string;
  presentZipCode: string;
  permanentBarangay: string;
  permanentDistrict: string;
  permanentCity: string;
  permanentZipCode: string;
  
  // Contact Information
  contactNumber: string;
  emailAddress: string;
  
  // Employment Status
  isEmployed: string;
  isJobSeeking: string;
  isCurrentlyEnrolled: string;
  
  // Marginalized Group
  primaryMarginalizedGroup: string;
  secondaryMarginalizedGroups: string[];
  
  // Digital Wallet
  hasDigitalWallet: string;
  digitalWallets: string[];
  walletAccountNumber: string;
  
  // Scholarship Information
  scholarIdNumber: string;
  scholarshipCategory: string;
  scholarshipSubCategory: string;
  currentEducationalLevel: string;
  schoolYear: string;
  schoolTerm: string;
  isGraduating: string;
  
  // Academic Performance
  currentGPA: string;
  reasonForRenewal: string;
  financialNeed: string;
  
  // Documents
  documents: any;
}

const renewalSchema = yup.object({
  // Personal Information
  lastName: yup.string().required('Last name is required'),
  firstName: yup.string().required('First name is required'),
  middleName: yup.string().required('Middle name is required'),
  extensionName: yup.string().optional().default(''),
  sex: yup.string().required('Sex is required'),
  civilStatus: yup.string().required('Civil status is required'),
  nationality: yup.string().required('Nationality is required'),
  birthPlace: yup.string().required('Birth place is required'),
  birthDate: yup.string().required('Birth date is required'),
  isPWD: yup.string().required('PWD status is required'),
  pwdSpecification: yup.string().optional().default(''),
  religion: yup.string().required('Religion is required'),
  
  // Address Information
  presentBarangay: yup.string().required('Present barangay is required'),
  presentDistrict: yup.string().required('Present district is required'),
  presentCity: yup.string().required('Present city is required'),
  presentZipCode: yup.string().required('Present zip code is required'),
  permanentBarangay: yup.string().required('Permanent barangay is required'),
  permanentDistrict: yup.string().required('Permanent district is required'),
  permanentCity: yup.string().required('Permanent city is required'),
  permanentZipCode: yup.string().required('Permanent zip code is required'),
  
  // Contact Information
  contactNumber: yup.string().required('Contact number is required'),
  emailAddress: yup.string().email('Invalid email').required('Email address is required'),
  
  // Employment Status
  isEmployed: yup.string().required('Employment status is required'),
  isJobSeeking: yup.string().required('Job seeking status is required'),
  isCurrentlyEnrolled: yup.string().required('Current enrollment status is required'),
  
  // Marginalized Group
  primaryMarginalizedGroup: yup.string().required('Primary marginalized group is required'),
  secondaryMarginalizedGroups: yup.array().of(yup.string().required()).optional().default([]),
  
  // Digital Wallet
  hasDigitalWallet: yup.string().required('Digital wallet status is required'),
  digitalWallets: yup.array().of(yup.string().required()).optional().default([]),
  walletAccountNumber: yup.string().optional().default(''),
  
  // Scholarship Information
  scholarIdNumber: yup.string().required('Scholar ID number is required'),
  scholarshipCategory: yup.string().required('Scholarship category is required'),
  scholarshipSubCategory: yup.string().required('Scholarship sub-category is required'),
  currentEducationalLevel: yup.string().required('Current educational level is required'),
  schoolYear: yup.string().required('School year is required'),
  schoolTerm: yup.string().required('School term is required'),
  isGraduating: yup.string().required('Graduation status is required'),
  
  // Academic Performance
  currentGPA: yup.string().required('Current GPA is required'),
  reasonForRenewal: yup.string().required('Reason for renewal is required'),
  financialNeed: yup.string().required('Financial need description is required'),
  
  // Documents - validation will be handled by uploadedFiles state
  documents: yup.mixed().optional().default(null)
});

export const RenewalForm: React.FC = () => {
  const currentUser = useAuthStore(s => s.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RenewalFormData>({
    resolver: yupResolver(renewalSchema),
    defaultValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      nationality: 'Filipino',
      civilStatus: 'Single',
      isPWD: 'No',
      isEmployed: 'No',
      isJobSeeking: 'No',
      isCurrentlyEnrolled: 'Yes',
      hasDigitalWallet: 'Yes',
      currentEducationalLevel: 'Tertiary/College',
      schoolYear: '2024',
      schoolTerm: '1ST',
      isGraduating: 'No'
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const onSubmit = async (data: RenewalFormData) => {
    setIsSubmitting(true);
    setError(null);

    // Validate uploaded files
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one required document.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Renewal form data:', data);
      console.log('Uploaded files:', uploadedFiles);
      setSubmitSuccess(true);
    } catch (error) {
      setError('Failed to submit renewal application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const marginalizedGroups = [
    'I am part of an Indigent Family',
    'My family is Displaced/Relocated within Caloocan City',
    'I am a Person with Disability (PWD)',
    'I have an immediate family member who is a Person with Disability (PWD)',
    'My parent is a Household Helper/Kasambahay',
    'I am an Alternative Learning System (ALS) graduate',
    'I am a solo parent',
    'I have a solo parent',
    'I have a parent who is an Overseas Filipino Worker (OFW)',
    'I have a parent who has been found guilty with finality in criminal case',
    'I am a Youth in Conflict with the Law',
    'I have an immediate family member who is a tricycle driver and/or operator',
    'My family belongs to Indigenous People',
    'Beneficiary of the Pantawid Pamilyang Pilipino Program (4Ps)',
    'Not Applicable'
  ];

  const digitalWallets = ['GCASH', 'MAYA', 'SEABANK', 'CIMB', 'OTHERS'];

  const scholarshipCategories = [
    'Scholarship for Tertiary Students',
    'Scholarship for Senior High School Students',
    'Scholarship for Alternative Learning System (ALS)',
    'Scholarship for Technical Vocational Education'
  ];

  const scholarshipSubCategories = [
    'Academic Excellence Scholarship',
    'Economic Scholarship',
    'Athletic Scholarship',
    'Cultural Scholarship',
    'Leadership Scholarship'
  ];

  const requiredDocuments = [
    'Certificate of Enrollment',
    'Transcript of Records (Latest)',
    'Certificate of Good Moral',
    'Income Certificate',
    'Barangay Certificate',
    'Previous Scholarship Certificate',
    'Valid ID (Government-issued)',
    'Birth Certificate',
    'Proof of Residency'
  ];

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Renewal Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your scholarship renewal application has been received and is being processed. 
              You will receive a confirmation email shortly.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p><strong>Application Number:</strong> REN-2024-001234</p>
              <p><strong>Submitted Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div className="mt-6">
              <Button onClick={() => setSubmitSuccess(false)}>
                Submit Another Renewal
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900">Scholarship Renewal Application</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete the form below to renew your scholarship for the next academic period.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* I. PERSONAL INFORMATION */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-4">
                I
              </div>
              <h2 className="text-2xl font-bold text-gray-900">PERSONAL INFORMATION</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 italic">
              Please ensure that the information you provided aligns with your submitted documents.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Last Name"
                type="text"
                placeholder="Dela Cruz"
                registration={register('lastName')}
                error={errors.lastName?.message}
                required
              />
              
              <InputField
                label="First Name"
                type="text"
                placeholder="Juan"
                registration={register('firstName')}
                error={errors.firstName?.message}
                required
              />
              
              <InputField
                label="Middle Name"
                type="text"
                placeholder="Santos"
                registration={register('middleName')}
                error={errors.middleName?.message}
                required
              />
              
              <InputField
                label="Extension/Name"
                type="text"
                placeholder="Jr., Sr., III"
                registration={register('extensionName')}
                error={errors.extensionName?.message}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('sex')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Civil Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('civilStatus')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
                {errors.civilStatus && <p className="mt-1 text-sm text-red-600">{errors.civilStatus.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('nationality')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Nationality</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Dual Citizen">Dual Citizen</option>
                  <option value="Foreign">Foreign</option>
                </select>
                {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>}
              </div>
              
              <InputField
                label="Birth Place"
                type="text"
                placeholder="Caloocan City"
                registration={register('birthPlace')}
                error={errors.birthPlace?.message}
                required
              />
              
              <InputField
                label="Date of Birth"
                type="date"
                registration={register('birthDate')}
                error={errors.birthDate?.message}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you a Person with Disability (PWD)? <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('isPWD')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.isPWD && <p className="mt-1 text-sm text-red-600">{errors.isPWD.message}</p>}
              </div>
              
              <InputField
                label="If PWD, Specify"
                type="text"
                placeholder="Type of disability"
                registration={register('pwdSpecification')}
                error={errors.pwdSpecification?.message}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Religion <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('religion')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Religion</option>
                  <option value="Roman Catholic">Roman Catholic</option>
                  <option value="Protestant">Protestant</option>
                  <option value="Islam">Islam</option>
                  <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
                  <option value="Jehovah's Witness">Jehovah's Witness</option>
                  <option value="Buddhism">Buddhism</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Atheist">Atheist</option>
                  <option value="Others">Others</option>
                </select>
                {errors.religion && <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>}
                <p className="mt-1 text-xs text-gray-500">Your religion will not affect your scholarship application result</p>
              </div>
            </div>

            {/* Present Address Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                Present Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField
                  label="Barangay"
                  type="text"
                  placeholder="Bagbag"
                  registration={register('presentBarangay')}
                  error={errors.presentBarangay?.message}
                  required
                />
                
                <InputField
                  label="District"
                  type="text"
                  placeholder="District 5"
                  registration={register('presentDistrict')}
                  error={errors.presentDistrict?.message}
                  required
                />
                
                <InputField
                  label="City"
                  type="text"
                  placeholder="Caloocan City"
                  registration={register('presentCity')}
                  error={errors.presentCity?.message}
                  required
                />
                
                <InputField
                  label="Zip Code"
                  type="text"
                  placeholder="1400"
                  registration={register('presentZipCode')}
                  error={errors.presentZipCode?.message}
                  required
                />
              </div>
            </div>

            {/* Permanent Address Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                Permanent Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField
                  label="Barangay"
                  type="text"
                  placeholder="Bagbag"
                  registration={register('permanentBarangay')}
                  error={errors.permanentBarangay?.message}
                  required
                />
                
                <InputField
                  label="District"
                  type="text"
                  placeholder="District 5"
                  registration={register('permanentDistrict')}
                  error={errors.permanentDistrict?.message}
                  required
                />
                
                <InputField
                  label="City"
                  type="text"
                  placeholder="Caloocan City"
                  registration={register('permanentCity')}
                  error={errors.permanentCity?.message}
                  required
                />
                
                <InputField
                  label="Zip Code"
                  type="text"
                  placeholder="1400"
                  registration={register('permanentZipCode')}
                  error={errors.permanentZipCode?.message}
                  required
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 text-orange-500 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Active Contact Number"
                  type="tel"
                  placeholder="0912 345 6789"
                  registration={register('contactNumber')}
                  error={errors.contactNumber?.message}
                  required
                />
                
                <InputField
                  label="Active Email Address"
                  type="email"
                  placeholder="juan.delacruz@email.com"
                  registration={register('emailAddress')}
                  error={errors.emailAddress?.message}
                  required
                />
              </div>
            </div>

            {/* Employment Status Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 text-orange-500 mr-2" />
                Employment/Job Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you employed in the past three (3) months? <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('isEmployed')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.isEmployed && <p className="mt-1 text-sm text-red-600">{errors.isEmployed.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you been actively looking for a job in the past three (3) months? <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('isJobSeeking')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.isJobSeeking && <p className="mt-1 text-sm text-red-600">{errors.isJobSeeking.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you enrolled in the last semester/school year? <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('isCurrentlyEnrolled')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.isCurrentlyEnrolled && <p className="mt-1 text-sm text-red-600">{errors.isCurrentlyEnrolled.message}</p>}
                </div>
              </div>
            </div>

            {/* Marginalized Group Information Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-orange-500 mr-2" />
                Marginalized Group Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Which primary marginalized group do you belong? (Check one) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {marginalizedGroups.map((group, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          value={group}
                          {...register('primaryMarginalizedGroup')}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{group}</span>
                      </label>
                    ))}
                  </div>
                  {errors.primaryMarginalizedGroup && <p className="mt-1 text-sm text-red-600">{errors.primaryMarginalizedGroup.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Which secondary marginalized group do you belong? (Select all that applies)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {marginalizedGroups.map((group, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          value={group}
                          {...register('secondaryMarginalizedGroups')}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Wallet Information Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-orange-500 mr-2" />
                Digital Wallet Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have an active digital wallet under your name? <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('hasDigitalWallet')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.hasDigitalWallet && <p className="mt-1 text-sm text-red-600">{errors.hasDigitalWallet.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Which of the following digital wallets do you have? [Select all that applies]
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {digitalWallets.map((wallet, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          value={wallet}
                          {...register('digitalWallets')}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{wallet}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <InputField
                  label="Active Maya/GCash Account Number"
                  type="text"
                  placeholder="0912 345 6789"
                  registration={register('walletAccountNumber')}
                  error={errors.walletAccountNumber?.message}
                />
              </div>
            </div>
          </div>

          {/* II. SCHOLARSHIP AND ENROLLMENT INFORMATION */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-4">
                II
              </div>
              <h2 className="text-2xl font-bold text-gray-900">SCHOLARSHIP AND ENROLLMENT INFORMATION</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 italic">
              Please ensure that the information you provided aligns with your submitted documents.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="Scholar's ID Number"
                type="text"
                placeholder="2024-001234"
                registration={register('scholarIdNumber')}
                error={errors.scholarIdNumber?.message}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('scholarshipCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Category</option>
                  {scholarshipCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                {errors.scholarshipCategory && <p className="mt-1 text-sm text-red-600">{errors.scholarshipCategory.message}</p>}
                <p className="mt-1 text-xs text-blue-600">
                  <a href="#" className="hover:underline">Click here for Qualifications per Scholarship Category and Sub-Category</a>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scholarship Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('scholarshipSubCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Sub-Category</option>
                  {scholarshipSubCategories.map((subCategory, index) => (
                    <option key={index} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
                {errors.scholarshipSubCategory && <p className="mt-1 text-sm text-red-600">{errors.scholarshipSubCategory.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Educational Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('currentEducationalLevel')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Level</option>
                  <option value="Senior High School">Senior High School</option>
                  <option value="Tertiary/College">Tertiary/College</option>
                  <option value="Technical Vocational">Technical Vocational</option>
                  <option value="Graduate School">Graduate School</option>
                </select>
                {errors.currentEducationalLevel && <p className="mt-1 text-sm text-red-600">{errors.currentEducationalLevel.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Year <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('schoolYear')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Year</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
                {errors.schoolYear && <p className="mt-1 text-sm text-red-600">{errors.schoolYear.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Term/Semester <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('schoolTerm')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Term</option>
                  <option value="1ST">1ST</option>
                  <option value="2ND">2ND</option>
                  <option value="SUMMER">SUMMER</option>
                </select>
                {errors.schoolTerm && <p className="mt-1 text-sm text-red-600">{errors.schoolTerm.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are you a graduating student this semester? <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('isGraduating')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.isGraduating && <p className="mt-1 text-sm text-red-600">{errors.isGraduating.message}</p>}
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Upload className="h-5 w-5 text-orange-500 mr-2" />
              Required Documents
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload the following documents:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center">
                    <FileText className="h-4 w-4 text-orange-500 mr-2" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors duration-200">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="documentUpload"
                  />
                  <label htmlFor="documentUpload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Click to upload documents
                    </p>
                    <p className="text-sm text-gray-500">
                      or drag and drop files here
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB per file.
                    </p>
                  </label>
                </div>
                {errors.documents && (
                  <p className="mt-2 text-sm text-red-600">{String(errors.documents.message)}</p>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.name)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove file"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress/Status */}
              {uploadedFiles.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No files uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload at least one document to continue</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Renewal Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 sm:flex-none"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
