const { spawnSync } = require('child_process');
require('dotenv').config();

const dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log(`Using database URL: ${dbUrl}`);

// Use the local installation from node_modules
const result = spawnSync('npx', ['node-pg-migrate', 'up'], {
  env: { ...process.env, DATABASE_URL: dbUrl },
  stdio: 'inherit'
});

process.exit(result.status);