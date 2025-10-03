CREATE TABLE aid_disbursements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  citizen_id VARCHAR(64) NOT NULL,      -- link back to external citizen system
  student_id BIGINT NOT NULL,           -- from scholarship_student_db.students
  program_id BIGINT NOT NULL,           -- from scholarship_student_db.scholarship_programs
  partner_school_id BIGINT,             -- from scholarship_student_db.partner_schools
  amount DECIMAL(12,2) NOT NULL,
  disbursement_date DATE,
  status ENUM('pending','released','cancelled') DEFAULT 'pending'
);