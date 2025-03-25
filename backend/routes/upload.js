// routes/upload.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import authMiddleware from '../middleware/auth.js';
import dotenv from 'dotenv';
import pool from '../config/db.js'; // Import the database pool

const router = express.Router();

// Determine the correct .env file
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

// Add debugging
console.log('Upload route initialized');
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: Boolean(process.env.CLOUDINARY_API_KEY),
  api_secret: Boolean(process.env.CLOUDINARY_API_SECRET)
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Simple test route
router.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ status: 'upload route working' });
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-messages',
    upload_preset: 'chat-messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 5MB
  }
});

// Route for image uploads (single file)
router.post('/single', authMiddleware, (req, res, next) => {
  console.log('Upload single request received');
  next();
}, upload.single('file'), (req, res) => {
  try {
    console.log('File uploaded:', req.file);
    
    // Return the uploaded image details
    res.json({
      url: req.file.path,
      public_id: req.file.filename,
      width: req.file.width || 800, // Provide fallback values
      height: req.file.height || 600
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Route for multiple image uploads
router.post('/multiple', authMiddleware, upload.array('files', 5), (req, res) => {
  try {
    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      width: file.width || 800,
      height: file.height || 600
    }));
    
    res.json(uploadedImages);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;