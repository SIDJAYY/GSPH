export interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  extensionName?: string;
  sex: 'Male' | 'Female';
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced' | 'Separated';
  dateOfBirth: string;
  religion?: string;
  nationality: string;
  birthPlace?: string;
  heightCm?: string;
  weightKg?: string;
  isPwd: boolean;
  pwdSpecification?: string;
  presentAddress: string;
  barangay: string;
  district?: string;
  city: string;
  zipCode?: string;
  contactNumber: string;
  emailAddress: string;
  
  // Family Information
  motherFirstName: string;
  motherLastName: string;
  motherMiddleName?: string;
  motherExtensionName?: string;
  parentContactNumber?: string;
  fatherFirstName: string;
  fatherLastName: string;
  fatherMiddleName?: string;
  fatherExtensionName?: string;
  totalAnnualIncome?: string;
  numberOfChildren: string;
  numberOfSiblings?: string;
  homeOwnershipStatus?: string;
  isSoloParent?: string;
  isIndigenousGroup?: string;
  isRegisteredVoter?: string;
  voterNationality?: string;
  hasPayMayaAccount?: string;
  preferredMobileNumber?: string;
  
  // Scholarship Information
  scholarshipCategory: string;
  howDidYouKnow?: string[];
  
  // Academic Information
  educationalLevel: string;
  isSchoolAtCaloocan: string;
  schoolName?: string;
  campus?: string;
  schoolContactNumber?: string;
  schoolClassification: string;
  unitsEnrolled?: string;
  gradeYearLevel: string;
  currentTrackSpecialization?: string;
  areaOfSpecialization?: string;
  schoolTerm: string;
  schoolYear: string;
  previousSchool?: string;
  unitsCompleted: string;
  generalWeightedAverage?: string;
}

export interface ApplicationResponse {
  applicantNumber: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  examinationDate: string;
  submittedAt: string;
}

export interface StatusCheckData {
  applicantNumber: string;
  status: string;
  examinationDate?: string;
  remarks?: string;
}

export type UserRole = 'admin' | 'student' | 'staff';

export interface School {
  school_id: string;
  name: string;
  address?: string;
  city?: string;
  region?: string;
  province?: string;
  postal_code?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
    contact_person?: string;
    mobile?: string;
  };
  accreditation?: string;
  total_students?: number;
  male_students?: number;
  female_students?: number;

  population_date?: string;
  population_notes?: string;
  programs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  region: string;
  province: string;
  postal_code: string;
  contact_info_email: string;
  contact_info_phone: string;
  contact_info_website: string;
  contact_info_contact_person: string;
  contact_info_mobile: string;
  accreditation: string;
  total_students: string;
  male_students: string;
  female_students: string;

  population_date: string;
  population_notes: string;
}

export interface Program {
  program_id: string;
  school_id: string;
  name: string;
  description?: string;
  level?: string;
  duration?: string;
  accreditation_status?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  school?: School;
}

export interface ProgramFormData {
  school_id: string;
  name: string;
  description: string;
  level: string;
  duration: string;
  accreditation_status: string;
  is_active: boolean;
}