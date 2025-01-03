import pool from "../config/db.js";
import { getBandBySlugQuery } from "../queries/bandQueries.js";
import formatBandData from "../utils/formatBandData.js";

const fetchBandMiddleware = async (req, res, next) => {
  const { bandSlug } = req.params;

  try {
    const { rows } = await pool.query(getBandBySlugQuery, [bandSlug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found" });
    }

    req.band = formatBandData(rows[0]);
    console.log("Formatted Band Images:", req.band.images);
    next();
  } catch (error) {
    console.error(`Error fetching band with slug ${bandSlug}:`, error);
    res.status(500).json({ error: "Failed to fetch band data." });
  }
};

export default fetchBandMiddleware;