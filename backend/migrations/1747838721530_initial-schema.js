'use strict';

exports.shorthands = undefined;

exports.up = pgm => {

  pgm.sql(`
    -- Formules (subscription plans) table
    CREATE TABLE IF NOT EXISTS formules (
      id SERIAL PRIMARY KEY,
      titre VARCHAR(100) NOT NULL,
      description TEXT,
      prix DECIMAL(10, 2) NOT NULL,
      est_actif BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
      genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
      nationalite VARCHAR(100),
      formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
      est_benevole BOOLEAN DEFAULT FALSE,
      inscription_sport BOOLEAN DEFAULT FALSE,
      inscription_loisirs BOOLEAN DEFAULT FALSE,
      autorisation_image BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Recurring activities table
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
      type VARCHAR(20) NOT NULL CHECK (type IN ('with_adherents', 'without_adherents', 'br')),
      max_participants INTEGER,
      transport_available BOOLEAN DEFAULT FALSE,
      transport_capacity INTEGER DEFAULT 0,
      is_paid BOOLEAN DEFAULT FALSE,
      price DECIMAL(10, 2) DEFAULT 0.00,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
      type VARCHAR(20) NOT NULL CHECK (type IN ('with_adherents', 'without_adherents', 'br')),
      max_participants INTEGER,
      transport_available BOOLEAN DEFAULT FALSE,
      transport_capacity INTEGER DEFAULT 0,
      is_paid BOOLEAN DEFAULT FALSE,
      price DECIMAL(10, 2) DEFAULT 0.00,
      recurring_activity_id INTEGER REFERENCES recurring_activities(id) ON DELETE SET NULL,
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

    -- Adherents table (without user account)
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
      genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
      nationalite VARCHAR(100),
      formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
      est_benevole BOOLEAN DEFAULT FALSE,
      inscription_sport BOOLEAN DEFAULT FALSE,
      inscription_loisirs BOOLEAN DEFAULT FALSE,
      autorisation_image BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Membership requests table
    CREATE TABLE IF NOT EXISTS membership_requests (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      birth_date DATE NOT NULL,
      address VARCHAR(255),
      city VARCHAR(100),
      postal_code VARCHAR(20),
      emergency_contact_name VARCHAR(200) NOT NULL,
      emergency_contact_phone VARCHAR(50) NOT NULL,
      medical_notes TEXT,
      genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
      nationalite VARCHAR(100),
      formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
      est_benevole BOOLEAN DEFAULT FALSE,
      inscription_sport BOOLEAN DEFAULT FALSE,
      inscription_loisirs BOOLEAN DEFAULT FALSE,
      autorisation_image BOOLEAN DEFAULT FALSE,
      billing_email VARCHAR(255),
      payment_frequency VARCHAR(20) CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')),
      registration_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      adherent_id INTEGER REFERENCES adherents(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Memberships table to track adherent memberships
    CREATE TABLE IF NOT EXISTS memberships (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      adherent_id INTEGER REFERENCES adherents(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      membership_fee DECIMAL(10, 2),
      payment_frequency VARCHAR(20) CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')) DEFAULT 'monthly',
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

    -- Insert default formules (if empty)
    INSERT INTO formules (titre, description, prix)
    SELECT 'Formule Standard', 'Accès aux activités régulières de l''association', 150.00
    WHERE NOT EXISTS (SELECT 1 FROM formules);

    INSERT INTO formules (titre, description, prix)
    SELECT 'Formule Loisirs', 'Accès aux sorties loisirs et événements spéciaux', 100.00
    WHERE NOT EXISTS (SELECT 1 FROM formules WHERE titre = 'Formule Loisirs');

    INSERT INTO formules (titre, description, prix)
    SELECT 'Formule Complète', 'Accès à toutes les activités (sport et loisirs)', 200.00
    WHERE NOT EXISTS (SELECT 1 FROM formules WHERE titre = 'Formule Complète');

    -- Create indexes for improved performance
    CREATE INDEX idx_users_role ON users(role);
    CREATE INDEX idx_users_formule_id ON users(formule_id);
    CREATE INDEX idx_activities_type ON activities(type);
    CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
    CREATE INDEX idx_activities_recurring_id ON activities(recurring_activity_id);
    CREATE INDEX idx_activity_participants_activity ON activity_participants(activity_id);
    CREATE INDEX idx_activity_participants_user ON activity_participants(user_id);
    CREATE INDEX idx_activity_accompagnateurs_activity ON activity_accompagnateurs(activity_id);
    CREATE INDEX idx_activity_accompagnateurs_user ON activity_accompagnateurs(user_id);
    CREATE INDEX idx_memberships_user ON memberships(user_id);
    CREATE INDEX idx_memberships_adherent ON memberships(adherent_id);
    CREATE INDEX idx_memberships_dates ON memberships(start_date, end_date);
    CREATE INDEX idx_membership_requests_email ON membership_requests(email);
    CREATE INDEX idx_membership_requests_status ON membership_requests(status);
    CREATE INDEX idx_membership_requests_formule_id ON membership_requests(formule_id);
    CREATE INDEX idx_adherents_email ON adherents(email);
    CREATE INDEX idx_adherents_formule_id ON adherents(formule_id);
    CREATE INDEX idx_formules_est_actif ON formules(est_actif);
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DROP TABLE IF EXISTS documents;
    DROP TABLE IF EXISTS funding_sources;
    DROP TABLE IF EXISTS memberships;
    DROP TABLE IF EXISTS membership_requests;
    DROP TABLE IF EXISTS adherents;
    DROP TABLE IF EXISTS activity_accompagnateurs;
    DROP TABLE IF EXISTS activity_participants;
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS recurring_activities;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS formules;
  `);
};