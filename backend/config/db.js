import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ 
  path: path.resolve(path.join(__dirname, '..'), `.env.${process.env.ENV || 'local'}`)
});

// Log environment variables to check what's being loaded
console.log('Environment in db js file:', {
  ENV: process.env.ENV,
  DB_NAME: process.env.LOCAL_DB_NAME,
  DB_USER: process.env.LOCAL_DB_USER,
  DB_HOST: process.env.LOCAL_DB_HOST,
  DB_PORT: process.env.LOCAL_DB_PORT
});

const { Pool } = pkg;
const isLocalEnv = process.env.ENV === 'local';

// Configure database pool
const pool = new Pool({
  user: isLocalEnv ? process.env.LOCAL_DB_USER : process.env.PROD_DB_USER,
  host: isLocalEnv ? process.env.LOCAL_DB_HOST : process.env.PROD_DB_HOST,
  database: isLocalEnv ? process.env.LOCAL_DB_NAME : process.env.PROD_DB_NAME,
  password: isLocalEnv ? process.env.LOCAL_DB_PASSWORD : process.env.PROD_DB_PASSWORD,
  port: isLocalEnv ? parseInt(process.env.LOCAL_DB_PORT, 10) : parseInt(process.env.PROD_DB_PORT, 10),
  ssl: isLocalEnv ? false : { rejectUnauthorized: false },
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