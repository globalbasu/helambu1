-- ==========================================================
-- ELECTION OPERATIONS MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Gokarneshwor Municipality (9 Wards) + Full Multi-Tenant Scaling
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Settings
INSERT INTO system_settings (key, value) VALUES
  ('admin_pin', '"1234"'),
  ('election_day_mode', 'false'),
  ('municipality_name', '"Gokarneshwor Municipality"'),
  ('public_form_enabled', 'true'),
  ('household_module_enabled', 'true'),
  ('notices_enabled', 'true'),
  ('messages_enabled', 'true'),
  ('notes_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- 2. USERS (Admin & Field Staff)
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Field Worker',
  pin VARCHAR(10) NOT NULL DEFAULT '1234',
  access_token VARCHAR(64) UNIQUE,
  ward VARCHAR(20) DEFAULT 'All',
  tole VARCHAR(100) DEFAULT '',
  booth_no VARCHAR(50) DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WARDS
CREATE TABLE IF NOT EXISTS wards (
  ward_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL UNIQUE,
  municipality VARCHAR(100) NOT NULL DEFAULT 'Gokarneshwor Municipality',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 4. TOLES
CREATE TABLE IF NOT EXISTS toles (
  tole_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  tole_name VARCHAR(150) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 5. POLLING LOCATIONS
CREATE TABLE IF NOT EXISTS polling_locations (
  polling_location_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  location_name VARCHAR(150) NOT NULL,
  address TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 6. BOOTHS
CREATE TABLE IF NOT EXISTS booths (
  booth_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  polling_location_id VARCHAR(50) REFERENCES polling_locations(polling_location_id) ON DELETE SET NULL,
  booth_code VARCHAR(20) NOT NULL,
  booth_name VARCHAR(150) NOT NULL,
  registered_count INT DEFAULT 0,
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  other_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT ''
);

-- 7. HOUSEHOLDS
CREATE TABLE IF NOT EXISTS households (
  household_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  tole VARCHAR(100) DEFAULT '',
  block_cluster VARCHAR(100) DEFAULT '',
  house_no VARCHAR(50) DEFAULT '',
  address TEXT DEFAULT '',
  primary_contact_name VARCHAR(150) NOT NULL,
  primary_phone VARCHAR(20) DEFAULT '',
  assigned_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  verification_status VARCHAR(50) DEFAULT 'Pending',
  notes TEXT DEFAULT '',
  created_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. VOTERS / CONTACTS
CREATE TABLE IF NOT EXISTS voters (
  voter_id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) DEFAULT '',
  gender VARCHAR(20) DEFAULT '',
  age_group VARCHAR(20) DEFAULT '',
  municipality VARCHAR(100) DEFAULT 'Gokarneshwor Municipality',
  ward_no INT NOT NULL,
  tole VARCHAR(100) DEFAULT '',
  block_cluster VARCHAR(100) DEFAULT '',
  household_id VARCHAR(50) REFERENCES households(household_id) ON DELETE SET NULL,
  house_no VARCHAR(50) DEFAULT '',
  address_note TEXT DEFAULT '',
  polling_location_id VARCHAR(50) REFERENCES polling_locations(polling_location_id) ON DELETE SET NULL,
  booth_no VARCHAR(50) DEFAULT '',
  voter_serial VARCHAR(50) DEFAULT '',
  dob DATE,
  party_leaning VARCHAR(50) DEFAULT 'Undecided', -- UML, Congress, RSP, Maoist, RPP, Independent, Undecided
  facebook_url VARCHAR(255) DEFAULT '',
  tiktok_url VARCHAR(255) DEFAULT '',
  record_source VARCHAR(50) DEFAULT 'Manual', -- Import, Field Collection, Public Form, Manual
  verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Field Checked, Verified, Correction Required
  contact_status VARCHAR(50) DEFAULT 'Not Contacted', -- Not Contacted, Contacted
  self_reported_response VARCHAR(50) DEFAULT '', -- Support, Not Support, Undecided, Declined to Answer
  response_date TIMESTAMP WITH TIME ZONE,
  response_source VARCHAR(50) DEFAULT '',
  assigned_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. FIELD VISITS
CREATE TABLE IF NOT EXISTS visits (
  visit_id VARCHAR(50) PRIMARY KEY,
  voter_id VARCHAR(50) NOT NULL REFERENCES voters(voter_id) ON DELETE CASCADE,
  household_id VARCHAR(50) REFERENCES households(household_id) ON DELETE SET NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_outcome VARCHAR(50) NOT NULL, -- Met, Not Home, Moved, Wrong Address, Other
  contact_status VARCHAR(50) NOT NULL DEFAULT 'Contacted',
  self_reported_response VARCHAR(50) DEFAULT '',
  response_source VARCHAR(50) DEFAULT '',
  followup_required VARCHAR(10) DEFAULT 'No',
  next_followup_date DATE,
  assign_followup_to VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  recorded_by VARCHAR(50) NOT NULL DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. FOLLOW-UPS
CREATE TABLE IF NOT EXISTS followups (
  followup_id VARCHAR(50) PRIMARY KEY,
  voter_id VARCHAR(50) NOT NULL REFERENCES voters(voter_id) ON DELETE CASCADE,
  assigned_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  reason VARCHAR(150) DEFAULT 'Field Follow-up',
  status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Completed, Cancelled
  notes TEXT DEFAULT '',
  created_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP WITH TIME ZONE
);

-- 11. ISSUES / INCIDENTS
CREATE TABLE IF NOT EXISTS issues (
  issue_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  tole_id VARCHAR(50) DEFAULT '',
  polling_location_id VARCHAR(50) DEFAULT '',
  booth_id VARCHAR(50) DEFAULT '',
  category VARCHAR(50) NOT NULL DEFAULT 'Other', -- Data, Address, Staff, Logistics, Technical, Booth, Other
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Low, Medium, High, Critical
  status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, Assigned, In Progress, Resolved
  description TEXT NOT NULL,
  assigned_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  reported_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_date TIMESTAMP WITH TIME ZONE
);

-- 12. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
  assignment_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  ward VARCHAR(20) DEFAULT '',
  tole_id VARCHAR(50) DEFAULT '',
  polling_location_id VARCHAR(50) DEFAULT '',
  booth_id VARCHAR(50) DEFAULT '',
  assignment_type VARCHAR(50) DEFAULT 'Normal', -- Normal, Election Day
  supervisor_user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. NOTICES
CREATE TABLE IF NOT EXISTS notices (
  notice_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'Normal', -- Normal, Important, Urgent
  audience VARCHAR(50) NOT NULL DEFAULT 'Everyone', -- Everyone, Ward, Tole, Booth, Selected User
  audience_target VARCHAR(100) DEFAULT '',
  published_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  message_id VARCHAR(50) PRIMARY KEY,
  sender_user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL DEFAULT 'User', -- User, Team, Ward, Everyone
  recipient_id VARCHAR(50) DEFAULT '',
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'Normal',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTES
CREATE TABLE IF NOT EXISTS notes (
  note_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  visibility VARCHAR(50) NOT NULL DEFAULT 'Team', -- Private, Team, Coordinator/Admin
  related_type VARCHAR(50) DEFAULT 'General', -- Contact, Household, Booth, Issue, General Area
  related_id VARCHAR(50) DEFAULT '',
  ward_no INT,
  created_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. PUBLIC SUBMISSIONS
CREATE TABLE IF NOT EXISTS public_submissions (
  submission_id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  ward_no INT NOT NULL,
  tole VARCHAR(100) DEFAULT '',
  house_area VARCHAR(100) DEFAULT '',
  polling_location VARCHAR(150) DEFAULT '',
  booth_no VARCHAR(50) DEFAULT '',
  voter_serial VARCHAR(50) DEFAULT '',
  gender VARCHAR(20) DEFAULT '',
  age_group VARCHAR(20) DEFAULT '',
  submission_type VARCHAR(50) DEFAULT 'New Information', -- New Information, Update Existing, Correction
  correction_details TEXT DEFAULT '',
  consent BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'Pending Review', -- Pending Review, Approved New, Merged, Rejected
  reviewed_by VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. ELECTION DAY AGGREGATE REPORTS
CREATE TABLE IF NOT EXISTS election_day_reports (
  report_id VARCHAR(50) PRIMARY KEY,
  ward_no INT NOT NULL,
  polling_location_id VARCHAR(50) DEFAULT '',
  booth_id VARCHAR(50) DEFAULT '',
  report_time VARCHAR(50) NOT NULL,
  team_status VARCHAR(50) DEFAULT 'All Present',
  operational_status VARCHAR(50) DEFAULT 'Normal', -- Normal, Attention Needed, Critical
  aggregate_participation INT DEFAULT 0,
  open_issue_count INT DEFAULT 0,
  notes TEXT DEFAULT '',
  reported_by VARCHAR(50) DEFAULT 'USR_ADMIN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) DEFAULT 'USR_ADMIN',
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_voters_ward ON voters(ward_no);
CREATE INDEX IF NOT EXISTS idx_voters_phone ON voters(phone);
CREATE INDEX IF NOT EXISTS idx_voters_contact_status ON voters(contact_status);
CREATE INDEX IF NOT EXISTS idx_voters_household ON voters(household_id);
CREATE INDEX IF NOT EXISTS idx_visits_voter ON visits(voter_id);
CREATE INDEX IF NOT EXISTS idx_followups_voter ON followups(voter_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_issues_ward ON issues(ward_no);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_public_status ON public_submissions(status);

-- REPAIR / EMERGENCY RESET FUNCTION FOR ADMIN PIN
CREATE OR REPLACE FUNCTION repair_admin_login()
RETURNS text AS $$
BEGIN
  UPDATE system_settings SET value = '"1234"' WHERE key = 'admin_pin';
  UPDATE users SET pin = '1234', active = true WHERE user_id = 'USR_ADMIN';
  RETURN 'Admin PIN successfully reset to default: 1234';
END;
$$ LANGUAGE plpgsql;

-- SEED WARDS (1 to 9)
INSERT INTO wards (ward_id, ward_no, municipality, active, notes)
VALUES
  ('WARD_01', 1, 'Gokarneshwor Municipality', true, ''),
  ('WARD_02', 2, 'Gokarneshwor Municipality', true, ''),
  ('WARD_03', 3, 'Gokarneshwor Municipality', true, ''),
  ('WARD_04', 4, 'Gokarneshwor Municipality', true, ''),
  ('WARD_05', 5, 'Gokarneshwor Municipality', true, ''),
  ('WARD_06', 6, 'Gokarneshwor Municipality', true, ''),
  ('WARD_07', 7, 'Gokarneshwor Municipality', true, ''),
  ('WARD_08', 8, 'Gokarneshwor Municipality', true, ''),
  ('WARD_09', 9, 'Gokarneshwor Municipality', true, '')
ON CONFLICT (ward_no) DO NOTHING;

-- SEED ADMIN USER
INSERT INTO users (user_id, name, phone, role, pin, access_token, ward, tole, booth_no, active, notes)
VALUES
  ('USR_ADMIN', 'System Admin', '9841234567', 'Super Admin', '1234', 'TOKEN_ADMIN_MASTER_SECURE', 'All', '', '', true, 'Master Administrator'),
  ('USR_RAM', 'Ram Bahadur', '9841000001', 'Field Worker', '1234', 'token-ram-ward5', '5', 'Jorpati', 'A', true, 'Ward 5 Jorpati Lead'),
  ('USR_SITA', 'Sita Maya Lama', '9841000002', 'Ward Coordinator', '1234', 'token-sita-coord', '5', 'Jorpati', '', true, 'Ward 5 Coordinator')
ON CONFLICT (user_id) DO NOTHING;
