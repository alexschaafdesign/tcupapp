// routes/musicians.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const musicians = await pool.query('SELECT * FROM session_musicians');
    res.json({ data: musicians.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const musician = await pool.query('SELECT * FROM session_musicians WHERE id = $1', [id]);
      
      if (musician.rows.length === 0) {
        return res.status(404).json({ error: 'Musician not found' });
      }
  
      res.json({ data: musician.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

export default router;