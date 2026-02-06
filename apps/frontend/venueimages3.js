import pkg from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path'; // Import path module


// Emulate __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Extract Pool from the pg package
const { Pool } = pkg;

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PostgreSQL Configuration for Local Development
const pool = new Pool({
  user: process.env.development_DB_USER,
  host: process.env.development_DB_HOST,
  database: process.env.development_DB_NAME,
  password: process.env.development_DB_PASSWORD,
  port: parseInt(process.env.development_DB_PORT, 10),
  ssl: false, // No SSL for local
});

// Function to fetch all image URLs from Cloudinary folder
async function fetchCloudinaryImages(folder) {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`) // Replace `folder` with your Cloudinary folder name
      .execute();
    return result.resources.map((image) => ({
      name: image.public_id.split('/').pop(), // Get the image name without the folder path
      url: image.secure_url,
    }));
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}

// Function to update the venues table in the local database
async function updateLocalVenueImages(folder) {
  const client = await pool.connect();
  try {
    console.log('Fetching images from Cloudinary...');
    const images = await fetchCloudinaryImages(folder);

    console.log('Updating venue images in the local database...');
    for (const { name, url } of images) {
      // Match venue names to image names and update the database
      const query = `
        UPDATE venues
        SET cover_image = $1
        WHERE LOWER(venue) = LOWER($2) -- Ensure case-insensitive matching
      `;
      const values = [url, name];

      const result = await client.query(query, values);

      if (result.rowCount > 0) {
        console.log(`Updated ${name} with URL ${url}`);
      } else {
        console.warn(`No match found for ${name} in the database.`);
      }
    }
  } catch (error) {
    console.error('Error updating venue images in local DB:', error);
  } finally {
    client.release();
  }
}

// Run the script
updateLocalVenueImages('venue-cover-images'); // Replace 'venues' with your Cloudinary folder name