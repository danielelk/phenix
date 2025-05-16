-- Table for adherents (without user account)
CREATE TABLE IF NOT EXISTS adherents (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  birth_date DATE,
  address VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(200) NOT NULL,
  emergency_contact_phone VARCHAR(50) NOT NULL,
  medical_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for membership requests
CREATE TABLE IF NOT EXISTS membership_requests (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  birth_date DATE,
  address VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(200) NOT NULL,
  emergency_contact_phone VARCHAR(50) NOT NULL,
  medical_notes TEXT,
  payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')),
  registration_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  adherent_id INTEGER REFERENCES adherents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update memberships table to add adherent_id and payment_frequency
ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS adherent_id INTEGER REFERENCES adherents(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')) DEFAULT 'monthly';

-- Add index on email for faster lookups
CREATE INDEX idx_membership_requests_email ON membership_requests(email);
CREATE INDEX idx_adherents_email ON adherents(email);

-- Add index on status for filtering
CREATE INDEX idx_membership_requests_status ON membership_requests(status);