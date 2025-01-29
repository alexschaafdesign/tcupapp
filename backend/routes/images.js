import express from "express";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import pool from '../config/db.js';

const router = express.Router();

const envFile = `.env.${process.env.NODE_ENV || "development"}`; 
dotenv.config({ path: envFile });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/pledge-photos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 30;
    const nextCursor = req.query.nextCursor;

    let searchQuery = cloudinary.search
      .expression('folder:pledge-photos/*')
      .sort_by('created_at', 'desc')
      .max_results(500);

    const result = await searchQuery.execute();

    // Group images by person and prioritize shot 2
    const imagesByPerson = {};
    result.resources.forEach(resource => {
      const fullName = resource.public_id.split('_-_Power_Pledge')[0];
      
      // If it's shot 2, use it
      if (resource.public_id.includes('_2_')) {
        imagesByPerson[fullName] = resource;
      } 
      // If we don't have any image for this person yet, store whatever we have
      // (could be shot 1 or unnumbered)
      else if (!imagesByPerson[fullName]) {
        imagesByPerson[fullName] = resource;
      }
    });

    // Convert to array and sort by creation date
    const uniqueImages = Object.values(imagesByPerson)
      .map(resource => ({
        id: resource.public_id,
        url: cloudinary.url(resource.public_id, {
          quality: 'auto',
          fetch_format: 'auto',
          width: resource.width > resource.height ? 400 : 300,
          height: resource.width > resource.height ? 300 : 400,
          crop: 'fill'
        }),
        fullSizeUrl: cloudinary.url(resource.public_id, {
          quality: 'auto',
          fetch_format: 'auto',
          width: 1200,
          crop: 'limit'
        }),
        // Clean up name from filename - handle both numbered and unnumbered cases
        alt: resource.public_id
          .split('/').pop()  // Get filename
          .split('_-_')[0]   // Get name part
          .replace(/_[12]_/, '')  // Remove _1_ or _2_ if present
          .replace(/_/g, ' '),    // Replace remaining underscores with spaces
        orientation: resource.width > resource.height ? 'horizontal' : 'vertical',
        created_at: resource.created_at
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Handle pagination
    const startIndex = (page - 1) * perPage;
    const paginatedImages = uniqueImages.slice(startIndex, startIndex + perPage);
    const hasMore = startIndex + perPage < uniqueImages.length;

    console.log(`Found ${uniqueImages.length} unique pledges`);

    res.json({
      images: paginatedImages,
      hasMore,
      nextCursor: hasMore ? page + 1 : null,
      total: uniqueImages.length
    });
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.http_code,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

export default router;