import express from "express";
import pool from '../config/db.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const router = express.Router();

// Determine the correct .env file
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });
console.log(`Loaded environment file: ${envFile}`);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/', async (req, res) => {
  console.log('Environment variables for email test:', {
    SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
    SENDGRID_VERIFIED_SENDER: process.env.SENDGRID_VERIFIED_SENDER,
    NODE_ENV: process.env.NODE_ENV
  });

  // Include pledgeUrl along with the other properties
  const { 
    name, 
    bands, 
    signatureUrl, 
    photoUrl, 
    compositeUrl,  // final composite image
    pledgeUrl,     // pledge card image only
    contactName, 
    contactEmail, 
    contactPhone 
  } = req.body;

  try {
    // Fetch all three images in parallel
    const [photoResponse, finalImageResponse, pledgeResponse] = await Promise.all([
      fetch(photoUrl),
      fetch(compositeUrl),
      fetch(pledgeUrl)
    ]);
    
    // Convert each response to an ArrayBuffer
    const [photoArrayBuffer, finalImageArrayBuffer, pledgeArrayBuffer] = await Promise.all([
      photoResponse.arrayBuffer(),
      finalImageResponse.arrayBuffer(),
      pledgeResponse.arrayBuffer()
    ]);

    // Create buffers from the array buffers
    const photoBuffer = Buffer.from(photoArrayBuffer);
    const finalImageBuffer = Buffer.from(finalImageArrayBuffer);
    const pledgeBuffer = Buffer.from(pledgeArrayBuffer);

    // Split and trim the list of recipient emails
    const recipients = process.env.NOTIFICATION_EMAIL
      ? process.env.NOTIFICATION_EMAIL.split(',').map(email => email.trim())
      : [];

    const msg = {
      to: recipients,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'New Power Pledge Submission',
      html: `
        <h2>New Power Pledge Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Performer(s):</strong> ${bands}</p>
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${contactName || 'N/A'}</p>
        <p><strong>Email:</strong> ${contactEmail || 'N/A'}</p>
        <p><strong>Phone:</strong> ${contactPhone || 'N/A'}</p>
      `,
      attachments: [
        {
          content: photoBuffer.toString('base64'),
          filename: 'photo.png',
          type: 'image/png',
          disposition: 'attachment'
        },
        {
          content: finalImageBuffer.toString('base64'),
          filename: 'final-pledge.png',
          type: 'image/png',
          disposition: 'attachment'
        },
        {
          content: pledgeBuffer.toString('base64'),
          filename: 'pledge-card.png',
          type: 'image/png',
          disposition: 'attachment'
        }
      ]
    };

    console.log('Email configuration:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      attachmentsPresent: msg.attachments?.length,
      photoBufferSize: photoBuffer.length,
      finalImageBufferSize: finalImageBuffer.length,
      pledgeBufferSize: pledgeBuffer.length
    });

    console.log('Attempting to send email...');
    console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('Notification emails:', process.env.NOTIFICATION_EMAIL);

    // Execute the database insert and email send in parallel
    const [dbResult] = await Promise.all([
      pool.query(
        'INSERT INTO pledges (name, bands, signature_url, photo_url, final_image_url, contact_name, contact_email, contact_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, bands, signatureUrl, photoUrl, compositeUrl, contactName || null, contactEmail || null, contactPhone || null]
      ),
      sgMail.send(msg)
    ]);

    res.json(dbResult.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// In your route file (e.g., routes/pledges.js or similar)
router.get('/count', async (req, res) => {
  try {
    // Build the path to your credentials file.
    const credsPath = path.join(__dirname, '../config/google-credentials.json');
    
    // Read and parse the file.
    const credsContent = fs.readFileSync(credsPath, 'utf8');
    const creds = JSON.parse(credsContent);
    
    // Replace any escaped newline sequences with actual newlines.
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');

    // Create a GoogleAuth instance using the processed credentials.
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    // Initialize the Sheets API.
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1ReJOtYibvoz2-cqgs1K1LFyctmM9yTWLXvACORMnc3c',
      range: "'TOTAL PLEDGES'!A:B"    });
 
    // Use your logic for counting (adjust if needed).
    const count = Math.max(0, response.data.values.length - 2);
    res.json({ count });
  } catch (error) {
    console.error('Sheet API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;