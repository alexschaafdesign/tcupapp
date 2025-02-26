// middleware/auth.js
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment file logic remains the same
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';
  
const envPath = path.resolve(__dirname, `../${envFile}`);
console.log('Current directory:', __dirname);
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
          email: decoded.email,
          // Add roles from the token - adjust namespace as needed
          roles: decoded['https://tcupboard.org/roles'] || []
        };

        console.log('Decoded token:', decoded);
        console.log('User roles:', req.user.roles);
      }

      console.log('=== Auth Debug End ===');
      next();
    } catch (error) {
      console.error('Error processing token:', error);
      return next(error);
    }
  });
};

// Create a middleware to check roles
// In auth.js - add debugging
export const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    console.log('Checking roles:', {
      requiredRoles,
      userRoles: req.user?.roles,
      user: req.user
    });
    
    // If no token/auth, deny access
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user roles
    const userRoles = req.user.roles || [];
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    console.log('Has required role?', hasRequiredRole);
    
    if (hasRequiredRole) {
      return next();
    }
    
    console.log('Access denied - insufficient permissions');
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};

export default authMiddleware;