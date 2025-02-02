// loadEnv.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// In ES modules, __dirname is not defined by default, so we create it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment variables immediately
console.log('loadEnv.js: process.env.NODE_ENV =', process.env.NODE_ENV);
console.log('loadEnv.js: process.env.DOTENV_CONFIG_PATH =', process.env.DOTENV_CONFIG_PATH);

// Determine the current environment (development, staging, or production)
// Default to 'development' if NODE_ENV is not set.
const currentEnv = process.env.NODE_ENV || 'development';

// Use DOTENV_CONFIG_PATH if provided, otherwise use .env.<currentEnv>
const envFilePath =
  process.env.DOTENV_CONFIG_PATH ||
  path.resolve(__dirname, `.env.${currentEnv}`);

// Load the environment variables from the file.
const result = dotenv.config({ path: envFilePath });

if (result.error) {
  console.error(`Error loading environment variables from ${envFilePath}:`, result.error);
} else {
  console.log(`Environment variables successfully loaded from ${envFilePath}`);
}

// Optionally, export the current environment if you need it elsewhere.
export default currentEnv;