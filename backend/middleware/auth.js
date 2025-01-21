// middleware/auth.js
// middleware/auth.js
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log the current directory and env file path
// Update this part in auth.js
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'staging'
    ? '.env.staging'
    : '.env.development';
const envPath = path.resolve(__dirname, `../${envFile}`);console.log('Current directory:', __dirname);
console.log('Looking for env file at:', envPath);

// Try to load the env file
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env file:', result.error);
}

// Log all relevant environment variables
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_API_IDENTIFIER: process.env.AUTH0_API_IDENTIFIER
});

const checkJwt = auth({
    audience: process.env.AUTH0_API_IDENTIFIER,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256'
});

const authMiddleware = (req, res, next) => {
  console.log('=== Auth Debug Start ===');
  console.log('Auth header:', req.headers.authorization);
  
  checkJwt(req, res, (err) => {
    if (err) {
      console.error('Auth Error:', err);
      return next(err);
    }

    try {
      // Get the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        // Decode the token (it's already verified by checkJwt)
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Set the user info on the request object
        req.user = {
          sub: decoded.sub,
          email: decoded.email
        };

        console.log('Decoded token:', decoded);
      }

      console.log('=== Auth Debug End ===');
      next();
    } catch (error) {
      console.error('Error processing token:', error);
      return next(error);
    }
  });
};

export default authMiddleware;