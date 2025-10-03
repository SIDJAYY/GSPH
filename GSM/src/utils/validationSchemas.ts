import * as yup from 'yup';

export const personalInfoSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  middleName: yup.string(),
  birthDate: yup.string().required('Birth date is required'),
  gender: yup.string().required('Gender is required'),
  civilStatus: yup.string().required('Civil status is required'),
  contactNumber: yup
    .string()
    .required('Contact number is required')
    .matches(/^[0-9+\-\s()]+$/, 'Invalid contact number format'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  address: yup.string().required('Address is required'),
  barangay: yup.string().required('Barangay is required'),
});

export const academicInfoSchema = yup.object({
  campus: yup.string().required('Campus is required'),
  course: yup.string().oneOf([
    'BS in Information Technology (BSIT)',
    'BS in Accountancy (BSA)',
    'BS in Business Administration (BSBA)',
    'BS in Criminology (BSCrim)',
    'Bachelor of Secondary Education (BSEd)',
    'Bachelor of Elementary Education (BEEd)',
    'AB in Communication (ABComm)',
    'BS in Computer Science (BSCS)',
    'AB in Political Science (ABPolSci)',
    'BS in Hospitality Management (BSHM)'
  ], 'Please select a valid course').required('Course is required'),
  yearLevel: yup.string().required('Year level is required'),
  gwa: yup
    .string()
    .required('GWA is required')
    .matches(/^\d+(\.\d+)?$/, 'GWA must be a valid number'),
  scholarshipType: yup.string().required('Scholarship type is required'),
});

export const familyInfoSchema = yup.object({
  fatherName: yup.string().required('Father\'s name is required'),
  fatherOccupation: yup.string().required('Father\'s occupation is required'),
  fatherIncome: yup.string().required('Father\'s income is required'),
  motherName: yup.string().required('Mother\'s name is required'),
  motherOccupation: yup.string().required('Mother\'s occupation is required'),
  motherIncome: yup.string().required('Mother\'s income is required'),
});

export const statusCheckSchema = yup.object({
  applicantNumber: yup
    .string()
    .required('Applicant number is required')
    .matches(/^CAL-\d{4}-\d{6}$/, 'Invalid applicant number format (CAL-YYYY-XXXXXX)'),
});