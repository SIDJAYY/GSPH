CREATE TABLE monitoring_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  report_type ENUM('fund_usage','distribution_efficiency','school_performance','student_trends'),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_by BIGINT,  -- staff user_id (optional)
  parameters JSON,
  file_url VARCHAR(512)  -- path to generated report file
);

CREATE TABLE monitoring_metrics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  metric_name VARCHAR(255),
  metric_value DECIMAL(18,2),
  metric_date DATE,
  notes TEXT
);
