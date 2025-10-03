-- Students table with comprehensive personal information
CREATE TABLE students (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id VARCHAR(64) NOT NULL,  -- from external citizen system
  user_id BIGINT,                   -- if using local auth-service
  student_id_number VARCHAR(255) UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  extension_name VARCHAR(255),
  sex ENUM('Male', 'Female') NOT NULL,
  civil_status ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated') NOT NULL,
  nationality VARCHAR(255) DEFAULT 'Filipino',
  birth_place VARCHAR(255),
  birth_date DATE,
  is_pwd BOOLEAN DEFAULT FALSE,
  pwd_specification VARCHAR(255),
  religion VARCHAR(255),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  contact_number VARCHAR(255),
  email_address VARCHAR(255),
  is_employed BOOLEAN DEFAULT FALSE,
  is_job_seeking BOOLEAN DEFAULT FALSE,
  is_currently_enrolled BOOLEAN DEFAULT TRUE,
  is_graduating BOOLEAN DEFAULT FALSE,
  is_solo_parent BOOLEAN DEFAULT FALSE,
  is_indigenous_group BOOLEAN DEFAULT FALSE,
  is_registered_voter BOOLEAN DEFAULT FALSE,
  voter_nationality VARCHAR(255),
  has_paymaya_account BOOLEAN DEFAULT FALSE,
  preferred_mobile_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Addresses table for multiple address types per student
CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  type ENUM('present', 'permanent', 'school') NOT NULL,
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  barangay VARCHAR(255),
  district VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  region VARCHAR(255),
  zip_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Family members table for parents, guardians, siblings
CREATE TABLE family_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian', 'sibling', 'spouse') NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  extension_name VARCHAR(255),
  contact_number VARCHAR(255),
  employer VARCHAR(255),
  monthly_income DECIMAL(10,2),
  is_alive BOOLEAN DEFAULT TRUE,
  is_employed BOOLEAN DEFAULT FALSE,
  is_ofw BOOLEAN DEFAULT FALSE,
  is_pwd BOOLEAN DEFAULT FALSE,
  pwd_specification VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Financial information table
CREATE TABLE financial_information (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  total_annual_income DECIMAL(12,2),
  monthly_income DECIMAL(10,2),
  number_of_children INT DEFAULT 0,
  number_of_siblings INT DEFAULT 0,
  home_ownership_status ENUM('owned', 'rented', 'borrowed', 'other'),
  is_4ps_beneficiary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Partner schools table (renamed from partner_schools for consistency)
CREATE TABLE schools (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(255),
  contact_number VARCHAR(255),
  email VARCHAR(255),
  website VARCHAR(255),
  classification ENUM('LOCAL UNIVERSITY/COLLEGE (LUC)', 'STATE UNIVERSITY/COLLEGE (SUC)', 'PRIVATE UNIVERSITY/COLLEGE', 'TECHNICAL/VOCATIONAL INSTITUTE', 'OTHER') NOT NULL,
  address VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  region VARCHAR(255),
  zip_code VARCHAR(20),
  is_public BOOLEAN DEFAULT FALSE,
  is_partner_school BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Academic records table
CREATE TABLE academic_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  school_id BIGINT NOT NULL,
  educational_level ENUM('ELEMENTARY', 'HIGH SCHOOL', 'SENIOR HIGH SCHOOL', 'TERTIARY/COLLEGE', 'GRADUATE SCHOOL') NOT NULL,
  program VARCHAR(255),
  major VARCHAR(255),
  track_specialization VARCHAR(255),
  area_of_specialization VARCHAR(255),
  year_level VARCHAR(255) NOT NULL,
  school_year VARCHAR(255) NOT NULL,
  school_term VARCHAR(255) NOT NULL,
  units_enrolled INT,
  units_completed INT,
  gpa DECIMAL(3,2),
  general_weighted_average DECIMAL(3,2),
  previous_school VARCHAR(255),
  is_current BOOLEAN DEFAULT TRUE,
  is_graduating BOOLEAN DEFAULT FALSE,
  enrollment_date DATE,
  graduation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Scholarship categories table
CREATE TABLE scholarship_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('merit', 'need_based', 'special', 'renewal') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarship subcategories table
CREATE TABLE scholarship_subcategories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  type ENUM('merit', 'need_based', 'special', 'renewal') NOT NULL,
  requirements JSON,
  benefits JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES scholarship_categories(id) ON DELETE CASCADE
);

-- Scholarship applications table with comprehensive fields
CREATE TABLE scholarship_applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(255) UNIQUE NOT NULL,
  student_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  subcategory_id BIGINT NOT NULL,
  school_id BIGINT NOT NULL,
  type ENUM('new', 'renewal') NOT NULL,
  parent_application_id VARCHAR(255),
  status ENUM('draft', 'submitted', 'reviewed', 'approved', 'processing', 'released', 'rejected', 'on_hold', 'cancelled') DEFAULT 'draft',
  reason_for_renewal TEXT,
  financial_need_description TEXT NOT NULL,
  requested_amount DECIMAL(10,2),
  approved_amount DECIMAL(10,2),
  rejection_reason TEXT,
  notes TEXT,
  marginalized_groups JSON,
  digital_wallets JSON,
  wallet_account_number VARCHAR(255),
  how_did_you_know JSON,
  is_school_at_caloocan BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  approved_at TIMESTAMP NULL,
  reviewed_by BIGINT,
  approved_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES scholarship_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategory_id) REFERENCES scholarship_subcategories(id) ON DELETE CASCADE,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_student_type (student_id, type),
  INDEX idx_status_submitted (status, submitted_at),
  INDEX idx_application_number (application_number)
);

-- Document types table
CREATE TABLE document_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  category ENUM('personal', 'academic', 'financial', 'other') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  application_id BIGINT,
  document_type_id BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verification_notes TEXT,
  verified_by BIGINT,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE CASCADE
);

-- Application status history table
CREATE TABLE application_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by BIGINT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE
);

-- Scholarship awards table
CREATE TABLE scholarship_awards (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,
  award_amount DECIMAL(10,2) NOT NULL,
  award_date DATE NOT NULL,
  disbursement_schedule JSON,
  status ENUM('pending', 'disbursed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  award_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('bank_transfer', 'digital_wallet', 'check', 'cash') NOT NULL,
  reference_number VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (award_id) REFERENCES scholarship_awards(id) ON DELETE CASCADE
);

-- Application Status History table
CREATE TABLE application_status_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,
  status VARCHAR(255) NOT NULL,
  notes TEXT,
  changed_by BIGINT,
  changed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES scholarship_applications(id) ON DELETE CASCADE,
  INDEX idx_application_status (application_id, status),
  INDEX idx_changed_at (changed_at)
);