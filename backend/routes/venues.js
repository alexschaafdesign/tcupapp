import express from "express";
import pool from "../config/db.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";
import fetch from "node-fetch";
import authMiddleware from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "venues",
    upload_preset: "venue-cover-image-upload", // Your upload preset name
    allowed_formats: ["jpg", "jpeg", "png", "gif"]
  }
});

const upload = multer({ storage: storage });

// Get all venues
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM venues";
    const result = await pool.query(query);
    
    if (result?.rows) {
      sendSuccessResponse(res, result.rows);
    } else {
      res.status(500).json({ error: "No data returned" });
    }
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single venue by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM venues WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new venue
router.post("/", upload.single('cover_image'), async (req, res) => {
  try {
    const { venue, location, capacity } = req.body;
    const cover_image = req.file ? req.file.path : null;

    const query =
      "INSERT INTO venues (venue, location, capacity, cover_image) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [venue, location, capacity, cover_image];
    const result = await pool.query(query, values);

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error adding venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an existing venue
router.put("/:id", upload.single('cover_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { venue, location, capacity } = req.body;
    
    let updateQuery;
    let values;

    if (req.file) {
      // If a new image is uploaded, update all fields including cover_image
      updateQuery = `
        UPDATE venues 
        SET venue = $1, location = $2, capacity = $3, cover_image = $4 
        WHERE id = $5 
        RETURNING *
      `;
      values = [venue, location, capacity, req.file.path, id];
    } else {
      // If no new image, update only the text fields
      updateQuery = `
        UPDATE venues 
        SET venue = $1, location = $2, capacity = $3 
        WHERE id = $4 
        RETURNING *
      `;
      values = [venue, location, capacity, id];
    }

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Venue not found." });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;