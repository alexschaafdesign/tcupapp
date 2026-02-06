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
     social_links = {},  
     music_links = {},
     profile_image = null,
     other_images = [],
     location = "",
     bio = "",
   } = req.bandData;

   const cleanedGenre = JSON.stringify(cleanArray(genre));
   const cleanedGroupSize = JSON.stringify(cleanArray(group_size));
   const cleanedOtherImages = JSON.stringify(other_images);

   const values = [
     name,
     slug,
     cleanedGenre,
     bandemail,
     play_shows,
     cleanedGroupSize,
     JSON.stringify(social_links),
     JSON.stringify(music_links), 
     profile_image || null,
     cleanedOtherImages,
     location,
     bio,
   ];

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
     social_links = {},
     music_links = {},
     profile_image = null,
     other_images = [],
     location = "",
     bio = "",
   } = req.bandData;

   if (isNaN(bandid)) {
     return res.status(400).json({ error: "Invalid band ID provided." });
   }

   const cleanedGenre = JSON.stringify(cleanArray(genre));
   const cleanedGroupSize = JSON.stringify(cleanArray(group_size));
   const cleanedOtherImages = JSON.stringify(other_images);

   const values = [
     name,
     slug,
     cleanedGenre,
     bandemail,
     play_shows,
     cleanedGroupSize,
     JSON.stringify(social_links),
     JSON.stringify(music_links),
     profile_image || null,
     cleanedOtherImages,
     location,
     bio,
     bandid,
   ];

   const { rows } = await pool.query(updateBandQuery, values);

   if (rows.length === 0) {
     return res.status(404).json({ error: "Band not found." });
   }

   res.json({ message: "Band updated successfully", data: rows[0] });
 } catch (error) {
   console.error("Error updating band:", error);
   res.status(500).json({ error: "An error occurred while updating the band." });
 }
};