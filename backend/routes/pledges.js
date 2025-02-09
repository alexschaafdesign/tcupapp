import express from "express";
import pool from '../config/db.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';


const router = express.Router();

// Determine the correct .env file
const envFile = `.env.${process.env.NODE_ENV || "development"}`; // Defaults to development

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
  const { name, bands, signatureUrl, photoUrl, compositeUrl, contactName, contactEmail, contactPhone } = req.body;

try {
  // Download images
    const [photoResponse, finalImageResponse] = await Promise.all([
      fetch(photoUrl),
      fetch(compositeUrl)
    ]);
    
    // Convert to buffers
    const [photoArrayBuffer, finalImageArrayBuffer] = await Promise.all([
      photoResponse.arrayBuffer(),
      finalImageResponse.arrayBuffer()
    ]);

    const photoBuffer = Buffer.from(photoArrayBuffer);
    const finalImageBuffer = Buffer.from(finalImageArrayBuffer);

    const recipients = [
      ...(process.env.NOTIFICATION_EMAIL ? process.env.NOTIFICATION_EMAIL.split(',') : [])
    ];

    const msg = {
      to: recipients,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'New Power Pledge Submission',
      html: `
      <h2>New Power Pledge Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Bands:</strong> ${bands}</p>
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
        }
      ]
    };

    console.log('Email configuration:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      attachmentsPresent: msg.attachments?.length,
      photoBufferSize: photoBuffer.length,
      finalImageBufferSize: finalImageBuffer.length
    });

    console.log('Attempting to send email...');
    console.log('SendGrid API Key exists:', !!process.env.SENDGRID_API_KEY);
    console.log('Notification emails:', process.env.NOTIFICATION_EMAIL);  


    // Database insert and email send in parallel
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


  export default router;