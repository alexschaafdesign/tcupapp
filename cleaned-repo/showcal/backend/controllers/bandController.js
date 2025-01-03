import pool from '../config/db.js';
import { addBandQuery, updateBandQuery } from "../queries/bandQueries.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import cleanArray from "../utils/arrayUtils.js";

export const getAllBands = (req, res) => {
  sendSuccessResponse(res, req.bands);
};

export const getBandById = (req, res) => {
  sendSuccessResponse(res, req.band);
};

export const addBand = async (req, res) => {
  try {
    const {
      name = "",
      slug = "",
      genre = [],
      bandemail = "",
      play_shows = "",
      group_size = [],
      social_links = {}, // Already parsed as an object
      music_links = {}, // Already parsed as an object
      profile_image = null,
      other_images = [],
      location = "",
      bio = "",
    } = req.bandData;

    // Clean and prepare arrays
    const cleanGenre = cleanArray(genre).map(g => `"${g}"`); // Prepare for Postgres array
    const cleanGroupSize = cleanArray(group_size).map(g => `"${g}"`);

    const pgGenre = `{${cleanGenre.join(",")}}`; // Postgres array literal
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`;

    // Prepare images
    const formattedProfileImage = profile_image || null; // Store as URL
    const formattedOtherImages = other_images.length
      ? `{${other_images.map(img => `"${img}"`).join(",")}}`
      : "{}"; // Postgres array literal

    // Convert objects to JSON strings for database storage
    const socialLinksStr = JSON.stringify(social_links);
    const musicLinksStr = JSON.stringify(music_links);

    const values = [
      name,
      slug,
      pgGenre,
      bandemail,
      play_shows,
      pgGroupSize,
      socialLinksStr,
      musicLinksStr,
      formattedProfileImage,
      formattedOtherImages,
      location,
      bio,
    ];

    console.log("Values for INSERT query:", values);

    const { rows } = await pool.query(addBandQuery, values);

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error adding band:", error);
    res.status(500).json({ error: "Failed to add band." });
  }
};

export const updateBand = async (req, res) => {
  try {
    const { bandSlug } = req.params;

    // Get band ID from slug
    const bandQuery = await pool.query('SELECT id FROM tcupbands WHERE slug = $1', [bandSlug]);
    if (!bandQuery.rows[0]) {
      return res.status(404).json({ error: "Band not found." });
    }
    const bandid = bandQuery.rows[0].id;

    const {
      name = "",
      slug = "",
      genre = [],
      bandemail = "",
      play_shows = "no",
      group_size = [],
      social_links = {}, // Already parsed as an object
      music_links = {}, // Already parsed as an object
      profile_image = null,
      other_images = [],
      location = "",
      bio = "",
    } = req.bandData;

    if (isNaN(bandid)) {
      return res.status(400).json({ error: "Invalid band ID provided." });
    }

    // Parse and validate `genre` and `group_size`
    const cleanGenre = cleanArray(genre).map((g) => `"${g}"`);
    const cleanGroupSize = cleanArray(group_size).map((g) => `"${g}"`);

    const pgGenre = `{${cleanGenre.join(",")}}`;
    const pgGroupSize = `{${cleanGroupSize.join(",")}}`;

    // Prepare image data
    const formattedProfileImage = profile_image || null;
    const formattedOtherImages = other_images.length
      ? `{${other_images.map((img) => `"${img}"`).join(",")}}`
      : "{}";

    // Convert objects to JSON strings
    const socialLinksStr = JSON.stringify(social_links); // No parsing needed
    const musicLinksStr = JSON.stringify(music_links); // No parsing needed

    const values = [
      name,
      slug,
      pgGenre,
      bandemail,
      play_shows,
      pgGroupSize,
      socialLinksStr,
      musicLinksStr,
      formattedProfileImage,
      formattedOtherImages,
      location,
      bio,
      bandid,
    ];

    console.log("Values for update query:", values);

    const { rows } = await pool.query(updateBandQuery, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Band not found." });
    }

    res.status(200).json({ message: "Band updated successfully", data: rows[0] });
  } catch (error) {
    console.error("Error updating band:", error);
    res.status(500).json({ error: "An error occurred while updating the band." });
  }
};