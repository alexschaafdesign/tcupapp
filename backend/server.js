// server.js

// Make sure to load environment variables first!
import './loadEnv.js';
// Optionally, if you want to use the exported currentEnv for logging:
import currentEnv from './loadEnv.js';

import express from 'express';
import cors from 'cors';
import axios from 'axios';
// Removed duplicate dotenv import and configuration since it's already done in loadEnv.js
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import fetch from 'node-fetch'; // if still needed
import authMiddleware from './middleware/auth.js'; // if still in use
import sgMail from '@sendgrid/mail';

// Route imports
import venuesRoutes from './routes/venues.js';
import tcupbandsRouter from './routes/bands.js';
import showsRouter from './routes/shows.js';
import peopleRouter from './routes/people.js';
import usersRouter from './routes/users/users.js';
import favoritesRouter from './routes/users/favorites.js';
import authRoutes from './routes/auth.js';
import sessionMusiciansRouter from './routes/sessionmusicians.js';
import postsRouter from './routes/posts.js';
import tagsRouter from './routes/tags.js';
import tcupgcalRouter from './routes/tcupgcal.js';
import pledgesRouter from './routes/pledges.js';
import flyeringRouter from './routes/flyering.js';
import imagesRouter from './routes/images.js';

const { Pool } = pg;

// __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// (The dotenv.config call has been removed because it's already handled in loadEnv.js)

// Optional logging to verify that environment variables are loaded:
console.log('Server env loaded:', {
  SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  NODE_ENV: process.env.NODE_ENV
});
console.log('Using environment file:', `.env.${process.env.NODE_ENV || 'development'}`);
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  // Add any others you care about
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  // Use SSL if DB_SSL is set to 'true'
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

const app = express();
const PORT = process.env.PORT || 3001;

// 2) CORS configuration
let allowedOrigins;
if (process.env.NODE_ENV === 'production') {
  allowedOrigins = ['https://portal.tcupboard.org', 'https://tcupmn.org'];
} else if (process.env.NODE_ENV === 'staging') {
  allowedOrigins = ['https://staging.tcupboard.org'];
} else {
  allowedOrigins = ['http://localhost:3003'];
}

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests).
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// 4) API routes
app.use('/api/venues', venuesRoutes);
app.use('/api/bands', tcupbandsRouter);
app.use('/api/shows', showsRouter);
app.use('/api/people', peopleRouter);
app.use('/api/users', usersRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/sessionmusicians', sessionMusiciansRouter);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/tcupgcal', tcupgcalRouter);
app.use('/api/pledges', pledgesRouter);
app.use('/api/flyering', flyeringRouter);
app.use('/api/images', imagesRouter);

// Example database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Required backend endpoint (Express)
app.post('/index.php?api/oauth2/token', async (req, res) => {
  console.log('Token request received:', req.body);
  const { code } = req.body;
  const XENFORO_URL = 'https://tcupboard.org';
  const CLIENT_ID = process.env.REACT_APP_XENFORO_CLIENT_ID;
  const REDIRECT_URI = process.env.NODE_ENV === 'production'
    ? 'https://portal.tcupboard.org/callback'
    : 'http://localhost:3002/callback';

  try {
    console.log('Attempting token exchange with code:', code);
    const response = await fetch(`${XENFORO_URL}/index.php?api/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: process.env.XENFORO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      })
    });
    
    const data = await response.json();
    console.log('Token response:', data);
    res.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Token exchange failed', details: error.message });
  }
});

// Print out routes (for debugging)
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Route: ${r.route.path}`);
  } else if (r.name === 'router') {
    console.log('Router middleware:');
    r.handle.stack.forEach((rr) => {
      if (rr.route) {
        console.log(`  ${rr.route.path}`);
      }
    });
  }
});

// Export pool for reuse in other modules (if needed)
export const db = pool;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});