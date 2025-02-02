// db.js
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// You no longer need to load dotenv here, because loadEnv.js already did that.
// Remove the following lines:
// import dotenv from 'dotenv';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({
//   path: path.resolve(path.join(__dirname, '..'), `.env.${process.env.NODE_ENV || 'development'}`)
// });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  schema: process.env.DB_SCHEMA,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Whenever a brand-new connection is created, set the search_path
pool.on('connect', (client) => {
  const schema = process.env.DB_SCHEMA || 'public';
  client
    .query(`SET search_path TO ${schema}, public`)
    .then(() => {
      console.log(`search_path set to ${schema}, public`);
    })
    .catch((err) => {
      console.error('Error setting search_path:', err);
    });
});

export default pool;