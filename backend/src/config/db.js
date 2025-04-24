const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return logger.error("Error connecting to database:", err);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return logger.error("Error executing query:", err);
    }
    logger.info("Connected to PostgreSQL database");
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
