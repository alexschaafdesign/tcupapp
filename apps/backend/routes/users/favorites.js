import express from 'express';
import pool from '../../config/db.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

// POST /api/users/favorites
router.post('/', authMiddleware, async (req, res) => {
    const { band_id } = req.body;
    const auth0Id = req.user.sub;
    console.log('POST favorite - auth0Id:', auth0Id, 'band_id:', band_id);

    try {
        const user = await pool.query('SELECT id FROM users WHERE auth0_id = $1', [auth0Id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.rows[0].id;
        console.log('POST favorite - userId:', userId);

        // Check if favorite already exists
        const existing = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND band_id = $2',
            [userId, band_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Band already in favorites' });
        }

        const result = await pool.query(
            'INSERT INTO favorites (user_id, band_id) VALUES ($1, $2) RETURNING *',
            [userId, band_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding favorite:', err);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// GET /api/users/favorites
router.get('/', authMiddleware, async (req, res) => {
    const auth0Id = req.user.sub;
    console.log('GET favorites - auth0Id:', auth0Id);
  
    try {
      const user = await pool.query('SELECT id FROM users WHERE auth0_id = $1', [auth0Id]);
      
      if (user.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userId = user.rows[0].id;
      console.log('GET favorites - userId:', userId);

    const result = await pool.query(
        `SELECT 
        b.id,
        b.name,
        b.genre,
        b.social_links,
        b.bandemail,
        b.play_shows,
        b.group_size,
        f.id as favorite_id
        FROM favorites f
        INNER JOIN tcupbands b ON f.band_id = b.id
        WHERE f.user_id = $1`,
        [userId]
    );
    
  console.log('GET favorites - result:', result.rows);
      
      console.log('GET favorites - result:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

  // DELETE /api/favorites/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    const favoriteId = req.params.id; // Favorite ID from the route parameter
    const auth0Id = req.user.sub; // User's Auth0 ID from JWT token
  
    try {
      // Fetch the user's ID
      const user = await pool.query('SELECT id FROM users WHERE auth0_id = $1', [auth0Id]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const userId = user.rows[0].id;
  
      // Delete the favorite
      const result = await pool.query(
        `DELETE FROM favorites 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [favoriteId, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Favorite not found or does not belong to the user' });
      }
  
      res.json({ message: 'Favorite removed', favorite: result.rows[0] });
    } catch (err) {
      console.error('Error removing favorite:', err);
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });

export default router;