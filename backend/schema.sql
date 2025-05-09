-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accompagnateur', 'adherent', 'benevole')),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  medical_notes TEXT,
  is_vehiculed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('with_adherents', 'without_adherents')),
  max_participants INTEGER,
  transport_available BOOLEAN DEFAULT FALSE,
  transport_capacity INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity participants junction table
CREATE TABLE IF NOT EXISTS activity_participants (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  needs_transport BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id)
);

-- Activity accompagnateurs junction table
CREATE TABLE IF NOT EXISTS activity_accompagnateurs (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_id, user_id)
);

-- Membership table to track adherent memberships
CREATE TABLE IF NOT EXISTS memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  membership_fee DECIMAL(10, 2),
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Funding sources for the association
CREATE TABLE IF NOT EXISTS funding_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  received_date DATE,
  expected_date DATE,
  status VARCHAR(20) CHECK (status IN ('pending', 'received', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recurring_activities table
CREATE TABLE IF NOT EXISTS recurring_activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  day_of_week SMALLINT NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL, -- When the recurrence starts
  end_date DATE, -- Optional end date for the recurrence (NULL means indefinite)
  type VARCHAR(20) NOT NULL CHECK (type IN ('with_adherents', 'without_adherents')),
  max_participants INTEGER,
  transport_available BOOLEAN DEFAULT FALSE,
  transport_capacity INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a reference to recurring activity in the activities table
ALTER TABLE activities 
ADD COLUMN recurring_activity_id INTEGER REFERENCES recurring_activities(id) ON DELETE SET NULL;

-- Documents for the GED (optional feature)
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_activity_participants_activity ON activity_participants(activity_id);
CREATE INDEX idx_activity_participants_user ON activity_participants(user_id);
CREATE INDEX idx_activity_accompagnateurs_activity ON activity_accompagnateurs(activity_id);
CREATE INDEX idx_activity_accompagnateurs_user ON activity_accompagnateurs(user_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);