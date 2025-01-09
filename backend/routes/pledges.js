import express from "express";
import pool from '../config/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, bands, signatureUrl, photoUrl, finalImageUrl } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO pledges (name, bands, signature_url, photo_url, final_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, bands, signatureUrl, photoUrl, finalImageUrl]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  export default router;