import express from 'express';
import pool from '../../config/db.js';
import authMiddleware, { checkRole } from '../../middleware/auth.js';

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
    
    // 1. First, get all development shows that might need to be synced
    const devShowsQuery = `
      SELECT d.id, d.venue_id, d.bands, d.start, d.event_link, d.flyer_image, d.created_at, d.updated_at, d.manual_override, d.is_deleted
      FROM development.shows d
      WHERE d.is_deleted IS NOT TRUE
    `;
    
    const devResult = await client.query(devShowsQuery);
    const devShows = devResult.rows;
    
    // 2. Insert or update shows in production
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errors = [];

    for (const show of devShows) {
      try {
        // Check if there's a show with the same ID in production
        const checkByIdQuery = `
          SELECT id, manual_override 
          FROM production.shows 
          WHERE id = $1
        `;
        const idCheckResult = await client.query(checkByIdQuery, [show.id]);
        
        // Check if there's a show with the same venue_id and start time in production (but different ID)
        const checkByVenueAndTimeQuery = `
          SELECT id, manual_override 
          FROM production.shows 
          WHERE venue_id = $1 AND start = $2 AND id != $3
        `;
        const venueTimeCheckResult = await client.query(checkByVenueAndTimeQuery, [
          show.venue_id, show.start, show.id
        ]);
        
        // If a show with the same venue_id and start exists but has a different ID, skip it
        if (venueTimeCheckResult.rows.length > 0) {
          skippedCount++;
          continue;
        }
        
        if (idCheckResult.rows.length === 0) {
          // No show with this ID exists in production, so insert it
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
          // Show with this ID exists, check if it's manually overridden
          const existingShow = idCheckResult.rows[0];
          
          if (!existingShow.manual_override) {
            // Not manually overridden, so update it
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
              WHERE id = $1
            `;
            
            await client.query(updateQuery, [
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
            
            updatedCount++;
          } else {
            // Show is manually overridden, skip it
            skippedCount++;
          }
        }
      } catch (error) {
        // Log the error and continue with the next show
        errors.push(`Error with show ID ${show.id}: ${error.message}`);
        console.error(`Error processing show ID ${show.id}:`, error);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : null,
      total: devShows.length
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