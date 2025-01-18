import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ 
  path: path.resolve(path.join(__dirname, '..'), `.env.${process.env.ENV || 'development'}`)
});

// Log environment variables to check what's being loaded
console.log('Environment in db js file:', {
  ENV: process.env.ENV,
  DB_NAME: process.env.development_DB_NAME,
  DB_USER: process.env.development_DB_USER,
  DB_HOST: process.env.development_DB_HOST,
  DB_PORT: process.env.development_DB_PORT
});

const { Pool } = pkg;
const isdevelopmentEnv = process.env.ENV === 'development';

// Configure database pool
const pool = new Pool({
  user: isdevelopmentEnv ? process.env.development_DB_USER : process.env.PROD_DB_USER,
  host: isdevelopmentEnv ? process.env.development_DB_HOST : process.env.PROD_DB_HOST,
  database: isdevelopmentEnv ? process.env.development_DB_NAME : process.env.PROD_DB_NAME,
  password: isdevelopmentEnv ? process.env.development_DB_PASSWORD : process.env.PROD_DB_PASSWORD,
  port: isdevelopmentEnv ? parseInt(process.env.development_DB_PORT, 10) : parseInt(process.env.PROD_DB_PORT, 10),
  ssl: isdevelopmentEnv ? false : { rejectUnauthorized: false },
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

// Test database connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database()');
    client.release();
    console.log('Connected to database:', result.rows[0].current_database);
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

export default pool;