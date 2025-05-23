'use strict';

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    -- Add status and timestamps to activities table
    ALTER TABLE activities 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'started', 'completed')),
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

    -- Create activity presence table
    CREATE TABLE IF NOT EXISTS activity_presence (
      id SERIAL PRIMARY KEY,
      activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      manual_first_name VARCHAR(100),
      manual_last_name VARCHAR(100),
      manual_phone VARCHAR(50),
      present BOOLEAN DEFAULT FALSE,
      is_temporary BOOLEAN DEFAULT FALSE,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    -- Create activity expenses table
    CREATE TABLE IF NOT EXISTS activity_expenses (
      id SERIAL PRIMARY KEY,
      activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX idx_activity_presence_activity ON activity_presence(activity_id);
    CREATE INDEX idx_activity_presence_user ON activity_presence(user_id);
    CREATE INDEX idx_activity_expenses_activity ON activity_expenses(activity_id);
    CREATE INDEX idx_activities_status ON activities(status);
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DROP TABLE IF EXISTS activity_expenses;
    DROP TABLE IF EXISTS activity_presence;
    
    ALTER TABLE activities 
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS started_at,
    DROP COLUMN IF EXISTS completed_at;
  `);
};