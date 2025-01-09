import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import fetch from 'node-fetch';
import authMiddleware from './middleware/auth.js';

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



// Load environment variables
  dotenv.config({ 
    path: path.resolve(__dirname, `.env.${process.env.ENV || 'local'}`)
  });

// Log environment variables to check what's being loaded
console.log('Environment:', {
  ENV: process.env.ENV,
  DB_NAME: process.env.LOCAL_DB_NAME,
  DB_USER: process.env.LOCAL_DB_USER,
  DB_HOST: process.env.LOCAL_DB_HOST,
  DB_PORT: process.env.LOCAL_DB_PORT
});

// Add after dotenv.config()
console.log({
  ENV: process.env.ENV,
  isProduction: process.env.ENV === 'production',
  isLocalEnv: process.env.ENV === 'local',
  DB_NAME: process.env.LOCAL_DB_NAME
});

// Add right after dotenv.config()
console.log('Env file path:', path.resolve(__dirname, `.env.${process.env.ENV || 'local'}`));

// Database configuration based on environment
const isProduction = process.env.ENV === 'production';
const dbConfig = {
  user: isProduction ? process.env.PROD_DB_USER : process.env.LOCAL_DB_USER,
  password: isProduction ? process.env.PROD_DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
  host: isProduction ? process.env.PROD_DB_HOST : process.env.LOCAL_DB_HOST,
  port: isProduction ? process.env.PROD_DB_PORT : process.env.LOCAL_DB_PORT,
  database: isProduction ? process.env.PROD_DB_NAME : process.env.LOCAL_DB_NAME,
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

// Create database pool
const pool = new Pool(dbConfig);

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

// CORS configuration (keeping your existing settings)
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

// Create Xenforo API client (keeping your existing settings)
const xenforoClient = axios.create({
  baseURL: 'https://tcupboard.org/api',
  headers: {
    'XF-Api-Key': process.env.XENFORO_API_KEY,
    'XF-Api-User': '1'
  }
});

// API routes
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

// Add this after all your route declarations
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${r.route.path}`)
  } else if(r.name === 'router'){
    console.log('Router middleware:')
    r.handle.stack.forEach(function(r){
      if (r.route){
        console.log(`  ${r.route.path}`)
      }
    })
  }
})

// Export pool for use in route files
export const db = pool;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});