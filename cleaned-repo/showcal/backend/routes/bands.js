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


const router = express.Router();

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

export default router;