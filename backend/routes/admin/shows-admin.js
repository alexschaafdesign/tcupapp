import express from 'express';
import pool from '../config/db.js';
import authMiddleware, { checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get show counts from both schemas
router.get('/shows/counts', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    // Get count of shows in development schema
    const devResult = await pool.query('SELECT COUNT(*) FROM development.shows WHERE is_deleted IS NOT TRUE');
    
    // Get count of shows in production schema
    const prodResult = await pool.query('SELECT COUNT(*) FROM production.shows WHERE is_deleted IS NOT TRUE');
    
    res.json({
      development: parseInt(devResult.rows[0].count),
      production: parseInt(prodResult.rows[0].count),
      difference: parseInt(devResult.rows[0].count) - parseInt(prodResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error getting show counts:', error);
    res.status(500).json({ error: 'Failed to get show counts', details: error.message });
  }
});

// Sync shows from development to production
router.post('/shows/sync', authMiddleware, checkRole(['admin']), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. First, get all development shows that don't exist in production or have been updated
    // This query identifies shows that need to be copied over
    const identifyShowsQuery = `
      SELECT d.id, d.venue_id, d.bands, d.start, d.event_link, d.flyer_image, d.created_at, d.updated_at, d.manual_override, d.is_deleted
      FROM development.shows d
      LEFT JOIN production.shows p ON p.id = d.id
      WHERE 
        p.id IS NULL OR 
        (d.updated_at > p.updated_at AND d.manual_override IS NOT TRUE)
    `;
    
    const identifyResult = await client.query(identifyShowsQuery);
    const showsToSync = identifyResult.rows;
    
    // 2. Insert new shows or update existing ones in production
    let insertedCount = 0;
    let updatedCount = 0;

    for (const show of showsToSync) {
      // Check if the show exists in production
      const checkQuery = `SELECT id FROM production.shows WHERE id = $1`;
      const checkResult = await client.query(checkQuery, [show.id]);
      
      if (checkResult.rows.length === 0) {
        // Insert new show in production
        const insertQuery = `
          INSERT INTO production.shows
            (id, venue_id, bands, start, event_link, flyer_image, created_at, updated_at, manual_override, is_deleted)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        
        await client.query(insertQuery, [
          show.id, 
          show.venue_id, 
          show.bands, 
          show.start, 
          show.event_link, 
          show.flyer_image, 
          show.created_at, 
          show.updated_at, 
          show.manual_override, 
          show.is_deleted
        ]);
        
        insertedCount++;
      } else {
        // Update existing show in production, but only if it's not manually overridden in production
        const updateQuery = `
          UPDATE production.shows
          SET 
            venue_id = $2,
            bands = $3,
            start = $4,
            event_link = $5,
            flyer_image = $6,
            updated_at = $7,
            manual_override = $8,
            is_deleted = $9
          WHERE id = $1 AND manual_override IS NOT TRUE
        `;
        
        const updateResult = await client.query(updateQuery, [
          show.id, 
          show.venue_id, 
          show.bands, 
          show.start, 
          show.event_link, 
          show.flyer_image, 
          show.updated_at, 
          show.manual_override, 
          show.is_deleted
        ]);
        
        if (updateResult.rowCount > 0) {
          updatedCount++;
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      inserted: insertedCount,
      updated: updatedCount,
      total: showsToSync.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error syncing shows:', error);
    res.status(500).json({ error: 'Failed to sync shows', details: error.message });
  } finally {
    client.release();
  }
});

export default router;