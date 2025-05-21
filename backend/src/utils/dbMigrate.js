const { migrate } = require('node-pg-migrate');
const path = require('path');
const logger = require('./logger');

async function runMigrations() {
  try {
    await migrate({
      dir: path.join(__dirname, '../../migrations'),
      direction: 'up',
      migrationsTable: 'pgmigrations',
      count: Infinity,
      databaseUrl: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      }
    });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
}

module.exports = { runMigrations };