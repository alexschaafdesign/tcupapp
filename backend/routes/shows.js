import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

console.log('Loaded environment variables:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

function parseBandList(bandList) {
  if (!bandList) return [];
  // Split by commas and trim whitespace
  return bandList.split(',').map((band) => band.trim());
}

async function crossReferenceBands(bandsString) {
  const bandNames = parseBandList(bandsString).map((band) => band.toLowerCase());

  if (bandNames.length === 0) return [];

  const query = `
    SELECT id, LOWER(name) AS normalized_name
    FROM tcupbands
    WHERE LOWER(name) = ANY ($1::text[])
  `;
  const { rows } = await pool.query(query, [bandNames]);

  const tcupBandMap = rows.reduce((map, band) => {
    map[band.normalized_name] = band.id;
    return map;
  }, {});

  return bandNames.map((name) => ({
    name,
    id: tcupBandMap[name] || null,
  }));
}

router.get('/', async (req, res) => {
  const { venueId } = req.query; // Get venueId from query parameter

  try {
    // Base query with LEFT JOINs
    let query = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        shows.venue_id,
        shows.bands AS band_list,
        venues.venue AS venue_name,
        venues.location,
        bands.name AS band_name,
        tcupbands.id AS tcupband_id,
        tcupbands.slug AS tcupband_slug
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      LEFT JOIN 
        LATERAL unnest(string_to_array(shows.bands, ',')) AS bands(name) ON TRUE
      LEFT JOIN 
        tcupbands ON LOWER(TRIM(bands.name)) = LOWER(TRIM(tcupbands.name))
    `;

    // If venueId is provided, add a WHERE clause
    if (venueId) {
      query += ` WHERE shows.venue_id = $1`;
    }

    query += ` ORDER BY shows.start ASC`;

    // Execute the query
    const { rows: rawResults } = await pool.query(query, venueId ? [venueId] : []);

  //  console.log('Raw Query Results:', rawResults);

    // Process the results to group by show_id
    const processedShows = rawResults.reduce((acc, row) => {
      // Find the existing show in the accumulator
      let show = acc.find((s) => s.show_id === row.show_id);
      if (!show) {
        // If the show doesn't exist, add it
        show = {
          show_id: row.show_id,
          start: row.start,
          flyer_image: row.flyer_image,
          event_link: row.event_link,
          venue_id: row.venue_id,
          venue_name: row.venue_name,
          location: row.location,
          bands: [], // Initialize an empty bands array
        };
        acc.push(show);
      }

      // Add the band information to the bands array
      if (row.band_name) {
        show.bands.push({
          name: row.band_name,
          id: row.tcupband_id || null, // TCUP band ID (null if not a TCUP band)
          slug: row.tcupband_slug || null, // TCUP band slug (null if not a TCUP band)
        });
      }

      return acc;
    }, []);

   // console.log('Processed Shows:', processedShows);

    // Send the structured response
    res.json(processedShows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
});

// Get a specific show by ID
router.get('/:id', async (req, res) => {
  const showId = req.params.id;

  try {
    const query = `
      SELECT 
        shows.id AS show_id,
        shows.start,
        shows.flyer_image,
        shows.event_link,
        shows.venue_id,
        shows.bands AS band_list,
        venues.venue AS venue_name,
        venues.location
      FROM 
        shows
      LEFT JOIN 
        venues ON shows.venue_id = venues.id
      WHERE 
        shows.id = $1;
    `;
    const { rows } = await pool.query(query, [showId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const show = rows[0];
    const linkedBands = await crossReferenceBands(show.band_list || '');
    res.json({
      ...show,
      bands: linkedBands,
    });
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
});

// Add a new show
router.post("/add", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { flyer_image, event_link, start, venue_id, bands } = req.body;

    console.log("Extracted values:", {
      flyer_image,
      event_link,
      start,
      venue_id,
      bands
    });

    // Convert bands to a string if it's an array
    const bandsFormatted = Array.isArray(bands)
      ? bands.map((band) => band.name).join(", ")
      : bands;

    console.log("Formatted bands:", bandsFormatted);

    const query = `
      INSERT INTO shows (flyer_image, event_link, start, venue_id, bands)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [flyer_image, event_link, start, venue_id, bandsFormatted];
    console.log("Query values:", values);

    const result = await pool.query(query, values);
    console.log("Query result:", result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding new show:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    // Log the entire error object
    console.error("Full error object:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      schema: error.schema,
      table: error.table,
      constraint: error.constraint,
      column: error.column,
      dataType: error.dataType
    });

    // Send back detailed error information
    res.status(500).json({ 
      error: "Failed to add new show.",
      details: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});


// Edit an existing show

router.put("/:id", async (req, res) => {
  try {
    const { flyer_image, event_link, start, venue_id, bands } = req.body;
    const { id } = req.params;

    const bandsFormatted = Array.isArray(bands)
      ? bands.map((band) => band.name).join(", ")
      : bands;

      const query = `
      UPDATE shows 
      SET 
        flyer_image = COALESCE($1, flyer_image),
        event_link = COALESCE($2, event_link),
        start = COALESCE($3, start),
        venue_id = COALESCE($4, venue_id),
        bands = COALESCE($5, bands)
      WHERE id = $6
      RETURNING *;
    `;

    const values = [flyer_image, event_link, start, venue_id, bandsFormatted, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Show not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating show:", error);
    res.status(500).json({ error: "Failed to update show" });
  }
});

// Delete a specific show by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      DELETE FROM shows
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json({ message: 'Show deleted successfully', show: result.rows[0] });
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ error: 'Failed to delete show' });
  }
});

export default router;