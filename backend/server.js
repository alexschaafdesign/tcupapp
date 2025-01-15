import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import fetch from 'node-fetch'; // if still needed
import authMiddleware from './middleware/auth.js'; // if still in use

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

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1) Load environment variables
 *    - If NODE_ENV=development, loads .env.development
 *    - If NODE_ENV=production, loads .env.production
 *    - Defaults to .env.development if NODE_ENV is not set
 */
dotenv.config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});

// Helpful logs
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
  // If you want SSL in production only, you can do:
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
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://portal.tcupboard.org'
    : 'http://localhost:3002',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Create Xenforo API client (if still needed)
const xenforoClient = axios.create({
  baseURL: 'https://tcupboard.org/api',
  headers: {
    'XF-Api-Key': process.env.XENFORO_API_KEY,
    'XF-Api-User': '1'
  }
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

// Debug request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
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