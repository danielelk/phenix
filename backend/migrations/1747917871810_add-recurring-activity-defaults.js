'use strict';

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    -- Add tables for default participants and accompagnateurs in recurring activities
    
    CREATE TABLE IF NOT EXISTS recurring_activity_participants (
      id SERIAL PRIMARY KEY,
      recurring_activity_id INTEGER REFERENCES recurring_activities(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recurring_activity_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS recurring_activity_accompagnateurs (
      id SERIAL PRIMARY KEY,
      recurring_activity_id INTEGER REFERENCES recurring_activities(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recurring_activity_id, user_id)
    );

    -- Create indexes for better performance
    CREATE INDEX idx_recurring_activity_participants_recurring ON recurring_activity_participants(recurring_activity_id);
    CREATE INDEX idx_recurring_activity_participants_user ON recurring_activity_participants(user_id);
    CREATE INDEX idx_recurring_activity_accompagnateurs_recurring ON recurring_activity_accompagnateurs(recurring_activity_id);
    CREATE INDEX idx_recurring_activity_accompagnateurs_user ON recurring_activity_accompagnateurs(user_id);
  `);
};

exports.down = pgm => {
  pgm.sql(`
    DROP TABLE IF EXISTS recurring_activity_accompagnateurs;
    DROP TABLE IF EXISTS recurring_activity_participants;
  `);
};