import express from 'express';
import pool from '../config/db.js';
import authMiddleware, { checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get environment variables
const schema = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log(`Using database schema: ${schema}`);

console.log(`Updates route loaded. NODE_ENV: ${process.env.NODE_ENV}, schema: ${schema}`);




// GET all published updates (public) with optional limit
router.get('/', async (req, res) => {
  console.error(`Attempting to fetch updates with schema: ${schema}`);

  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const result = await pool.query(`
      SELECT u.id, u.title, u.content, u.content_json, u.image_url, u.created_at, 
             users.username as author_name
      FROM ${schema}.updates u
      JOIN ${schema}.users ON u.auth0_id = users.auth0_id
      WHERE u.is_published = true
      ORDER BY u.created_at DESC
      LIMIT $1
    `, [limit]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch updates',
      details: error.message,
      code: error.code 
    });
  }
});

// GET a single update by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT u.id, u.title, u.content, u.content_json, u.image_url, u.created_at, 
             users.username as author_name
      FROM ${schema}.updates u
      JOIN ${schema}.users ON u.auth0_id = users.auth0_id
      WHERE u.id = $1 AND u.is_published = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching update:', error);
    res.status(500).json({ 
      error: 'Failed to fetch update',
      details: error.message,
      code: error.code 
    });
  }
});

// Admin routes - protected by authentication and role
// POST create a new update
router.post('/', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { title, content, content_json, image_url, is_published } = req.body;
  const auth0_id = req.auth.payload.sub; // Get user from token
  
  try {
    const result = await pool.query(`
      INSERT INTO ${schema}.updates (title, content, content_json, image_url, auth0_id, is_published)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, content, content_json, image_url, auth0_id, is_published || true]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ 
      error: 'Failed to create update',
      details: error.message,
      code: error.code 
    });
  }
});

// PUT update an existing update
router.put('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { title, content, content_json, image_url, is_published } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE ${schema}.updates
      SET title = $1, 
          content = $2, 
          content_json = $3,
          image_url = $4,
          is_published = $5
      WHERE id = $6
      RETURNING *
    `, [title, content, content_json, image_url, is_published, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({ 
      error: 'Failed to update',
      details: error.message,
      code: error.code 
    });
  }
});

// DELETE an update
router.delete('/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`DELETE FROM ${schema}.updates WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }
    
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ 
      error: 'Failed to delete update',
      details: error.message,
      code: error.code 
    });
  }
});

export default router;