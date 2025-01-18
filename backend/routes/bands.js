import express from "express";
import fetchAllBandsMiddleware from "../middleware/fetchAllBands.js";
import fetchBandMiddleware from "../middleware/fetchBand.js";
import uploadAndParse from "../middleware/uploadAndParse.js";
import { 
  getAllBands, 
  getBandById, 
  addBand, 
  updateBand 
} from "../controllers/bandController.js";
import pool from '../config/db.js';
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all bands claimed by current user
router.get('/myclaims', authMiddleware, async (req, res) => {
  const userId = req.user.sub;
  console.log('Fetching claims for user:', userId); // Debug log

  try {
      const result = await pool.query(
          `SELECT b.*, 
                  b.claimed_at,
                  b.claimed_by
           FROM tcupbands b 
           WHERE b.claimed_by = $1 
           ORDER BY b.name`,
          [userId]
      );
      
      console.log('Found claimed bands:', result.rows); // Debug log
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching claimed bands:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Fetch all bands
router.get("/", fetchAllBandsMiddleware, getAllBands);

// Route: Fetch a specific band by ID
router.get("/:bandSlug", fetchBandMiddleware, getBandById);

// Route: Fetch data for edit form (reuse same controller as get by ID)
router.get("/:bandSlug/edit", fetchBandMiddleware, getBandById);

// Route: Add a new band
router.post("/add", uploadAndParse, addBand);

// Route: Update an existing band
router.put("/:bandSlug/edit", uploadAndParse, updateBand);

// Route: Fetch shows for a specific band
router.get("/:bandSlug/shows", async (req, res) => {
  try {
    // Fetch the band's name using the slug
    const bandQuery = await pool.query(
      "SELECT id, name FROM tcupbands WHERE slug = $1",
      [req.params.bandSlug]
    );

    if (!bandQuery.rows[0]) {
      return res.status(404).json({ error: "Band not found" });
    }

    const bandName = bandQuery.rows[0].name;

    // Use the working query to fetch the band's associated shows
    const showsQuery = `
      SELECT 
        s.id AS show_id,
        s.start,
        s.flyer_image,
        s.event_link,
        s.venue_id,
        s.bands AS band_list,
        v.venue AS venue_name,
        v.location,
        array_agg(
          json_build_object(
            'id', b.id,
            'name', COALESCE(b.name, trim(unnest.band_name)),
            'slug', b.slug
          )
        ) AS bands
      FROM shows s
      LEFT JOIN venues v ON s.venue_id = v.id
      CROSS JOIN LATERAL unnest(string_to_array(s.bands, ',')) AS unnest(band_name)
      LEFT JOIN tcupbands b ON trim(LOWER(unnest.band_name)) = trim(LOWER(b.name))
      WHERE EXISTS (
        SELECT 1
        FROM unnest(string_to_array(s.bands, ',')) AS sub_band(name)
        WHERE trim(LOWER(sub_band.name)) = trim(LOWER($1))
      )
      GROUP BY s.id, v.venue, v.location
      ORDER BY s.start ASC;
    `;

    const { rows } = await pool.query(showsQuery, [bandName]);

    console.log("Query Results:", rows);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching shows for band:", error);
    res.status(500).json({ error: "Failed to fetch shows" });
  }
});

// Claim a band
router.post('/:bandSlug/claim', authMiddleware, async (req, res) => {
  const bandSlug = req.params.bandSlug;
  const userId = req.user.sub;

  try {
      // Check if band exists and isn't already claimed
      const result = await pool.query(
          'UPDATE tcupbands SET claimed_by = $1, claimed_at = NOW() WHERE slug = $2 AND claimed_by IS NULL RETURNING *',
          [userId, bandSlug]
      );

      if (result.rowCount === 0) {
          // Check if band exists but is claimed by someone else
          const band = await pool.query('SELECT claimed_by FROM tcupbands WHERE slug = $1', [bandSlug]);
          if (band.rowCount === 0) {
              return res.status(404).json({ error: 'Band not found' });
          } else if (band.rows[0].claimed_by) {
              return res.status(403).json({ error: 'Band already claimed' });
          }
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error claiming band:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Release a band claim
router.post('/:bandSlug/release', authMiddleware, async (req, res) => {
  const bandSlug = req.params.bandSlug;
  const userId = req.user.sub;

  try {
      const result = await pool.query(
          'UPDATE tcupbands SET claimed_by = NULL, claimed_at = NULL WHERE slug = $2 AND claimed_by = $1 RETURNING *',
          [userId, bandSlug]
      );

      if (result.rowCount === 0) {
          return res.status(403).json({ error: 'Not authorized to release this band' });
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error('Error releasing band:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



// Check if user owns a band (utility endpoint)
router.get('/:bandSlug/check-ownership', authMiddleware, async (req, res) => {
  const bandSlug = req.params.bandSlug;
  const userId = req.user.sub;

  try {
      const result = await pool.query(
          'SELECT claimed_by FROM tcupbands WHERE slug = $1',
          [bandSlug]
      );
      
      const isOwner = result.rows[0]?.claimed_by === userId;
      res.json({ isOwner });
  } catch (error) {
      console.error('Error checking band ownership:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Modify your existing edit endpoint to check ownership first
router.put('/:bandSlug/edit', authMiddleware, async (req, res, next) => {
  const bandSlug = req.params.bandSlug;
  const userId = req.user.sub;

  try {
      // First check if user owns the band
      const band = await pool.query(
          'SELECT claimed_by FROM tcupbands WHERE slug = $1',
          [bandSlug]
      );

      if (band.rowCount === 0) {
          return res.status(404).json({ error: 'Band not found' });
      }

      if (band.rows[0].claimed_by !== userId) {
          return res.status(403).json({ error: 'Not authorized to edit this band' });
      }

      // If authorized, proceed to your existing uploadAndParse and updateBand handlers
      next();
  } catch (error) {
      console.error('Error checking band ownership:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}, uploadAndParse, updateBand);

export default router;