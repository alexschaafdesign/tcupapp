import pool from "../config/db.js"; // Import the database pool
import formatBandData from "../utils/formatBandData.js"; // Import formatting utility

const fetchAllBandsMiddleware = async (req, res, next) => {
  try {
    const query = `
      SELECT id, name, slug, genre, bandemail, play_shows, group_size, social_links, music_links, created_at, profile_image, other_images, bio
      FROM tcupbands;
    `;

    const { rows } = await pool.query(query);

    console.log("Raw bands data from database:", rows); // Debugging raw data

    // Format the bands data
    req.bands = rows.map((row) => {
      const formattedBand = formatBandData(row);

      // Log each formatted band for debugging
      console.log("Formatted band data:", formattedBand);

      // Add data validation guards
      return {
        ...formattedBand,
        profile_image:
          typeof formattedBand.profile_image === "string"
            ? formattedBand.profile_image
            : null,
        social_links:
          Array.isArray(formattedBand.social_links) && formattedBand.social_links.length > 0
            ? formattedBand.social_links
            : [],
        genre: Array.isArray(formattedBand.genre) ? formattedBand.genre : [],
        other_images:
          Array.isArray(formattedBand.other_images) ? formattedBand.other_images : [],
      };
    });

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Error fetching all TCUP bands:", error);
    res.status(500).json({ error: "Failed to fetch TCUP bands." });
  }
};

export default fetchAllBandsMiddleware;