// server.js

process.env.NODE_OPTIONS = '--openssl-legacy-provider';

// 1) Load environment variables before anything else
import './loadEnv.js'; // This presumably calls dotenv.config() internally

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

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
import notificationsRouter, { createReplyNotification } from './routes/notifications.js';
import updatesRouter from './routes/updates.js';
import contactRouter from './routes/contact.js'

// 2) Optional debugging/logging to confirm environment vars are loaded
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('APP_ENV (or ENV):', process.env.APP_ENV || process.env.ENV);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('SENDGRID_API_KEY:', !!process.env.SENDGRID_API_KEY);

// 3) Set up the database
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to database');
  release();
});

// 4) Create the Express app
const app = express();
const PORT = process.env.PORT || 3001;

// 5) Define allowed origins per environment
const allowedOriginsMap = {
  development: [
    'http://localhost:3003'
  ],
  staging: [
    'https://staging.tcupboard.org'
  ],
  production: [
    'https://portal.tcupboard.org',
    'https://tcupmn.org'
  ]
};

// 6) Figure out which environment we’re in
//    (pick one: APP_ENV, ENV, or NODE_ENV)
const currentEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';

const allowedOrigins = allowedOriginsMap[currentEnv] 
  || allowedOriginsMap.development;

// 7) Configure CORS
//    If you need credentials (cookies, etc.), you must set credentials: true
//    and cannot use a wildcard (*) for origin.
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

// 8) Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 9) Debug request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// 10) Mount your routes (make sure these come after the CORS and body-parser middleware)
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
app.use('/api/notifications', notificationsRouter)
app.use('/api/updates', updatesRouter)
app.use('/api/contact', contactRouter)



// Example test route
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

// 11) Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, environment: ${currentEnv}`);
});