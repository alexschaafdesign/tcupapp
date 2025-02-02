// loadEnv.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// In ES modules, __dirname is not defined by default, so we create it:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the current environment (development, staging, or production)
// Default to 'development' if NODE_ENV is not set.
const currentEnv = process.env.NODE_ENV || 'development';

// Build the path to the appropriate .env file.
// For example, if currentEnv is 'staging', the path will point to .env.staging.
const envFilePath = path.resolve(__dirname, `.env.${currentEnv}`);

// Load the environment variables from the file.
const result = dotenv.config({ path: envFilePath });

if (result.error) {
  console.error(`Error loading environment variables from ${envFilePath}:`, result.error);
} else {
  console.log(`Environment variables successfully loaded from ${envFilePath}`);
}

// Optionally, export the current environment if you need it elsewhere.
export default currentEnv;