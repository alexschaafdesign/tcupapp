import express from "express";
import pool from '../config/db.js';
import sgMail from '@sendgrid/mail';

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


router.post('/', async (req, res) => {
  const { name, bands, signatureUrl, photoUrl, finalImageUrl } = req.body;

try {
  // Download images
    const [photoResponse, finalImageResponse] = await Promise.all([
      fetch(photoUrl),
      fetch(finalImageUrl)
    ]);
    
    // Convert to buffers
    const [photoArrayBuffer, finalImageArrayBuffer] = await Promise.all([
      photoResponse.arrayBuffer(),
      finalImageResponse.arrayBuffer()
    ]);

    const photoBuffer = Buffer.from(photoArrayBuffer);
    const finalImageBuffer = Buffer.from(finalImageArrayBuffer);

    const msg = {
      to: process.env.NOTIFICATION_EMAIL,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: 'New Power Pledge Submission',
      html: `
        <h2>New Power Pledge Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Bands:</strong> ${bands}</p>
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

    // Database insert and email send in parallel
    const [dbResult] = await Promise.all([
      pool.query(
        'INSERT INTO pledges (name, bands, signature_url, photo_url, final_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, bands, signatureUrl, photoUrl, finalImageUrl]
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