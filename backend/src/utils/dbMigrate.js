const path = require('path');
const { spawn } = require('child_process');
const logger = require('./logger');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    const dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    const migrationProcess = spawn(
      'node',
      [
        path.join(__dirname, '../../node_modules/node-pg-migrate/bin/node-pg-migrate'),
        'up',
        '--migrations-dir',
        path.join(__dirname, '../../migrations'),
        '--migrations-table',
        'pgmigrations'
      ],
      {
        env: { ...process.env, DATABASE_URL: dbUrl },
        stdio: 'pipe'
      }
    );

    let output = '';
    
    migrationProcess.stdout.on('data', (data) => {
      output += data.toString();
      logger.info(`Migration output: ${data.toString().trim()}`);
    });
    
    migrationProcess.stderr.on('data', (data) => {
      output += data.toString();
      logger.error(`Migration error: ${data.toString().trim()}`);
    });

    return new Promise((resolve, reject) => {
      migrationProcess.on('close', (code) => {
        if (code === 0) {
          logger.info('Database migrations completed successfully');
          resolve();
        } else {
          const error = new Error(`Migration failed with code ${code}: ${output}`);
          logger.error(error);
          reject(error);
        }
      });
      
      migrationProcess.on('error', (err) => {
        logger.error('Migration process error:', err);
        reject(err);
      });
    });
  } catch (error) {
    logger.error('Migration error:', error);
    throw error;
  }
}

module.exports = { runMigrations };