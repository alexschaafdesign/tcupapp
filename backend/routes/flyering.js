import express from "express";
import pool from "../config/db.js";
import sendSuccessResponse from "../utils/sendSuccessResponse.js";

const router = express.Router();
const schema = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Get all flyering locations
router.get("/", async (req, res) => {
  try {
    const query = `SELECT * FROM ${schema}.flyering_locations ORDER BY location`;
    const result = await pool.query(query);
    
    if (result?.rows) {
      sendSuccessResponse(res, result.rows);
    } else {
      res.status(500).json({ error: "No data returned" });
    }
  } catch (error) {
    console.error("Error fetching flyering locations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single location
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${schema}.flyering_locations WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new location
router.post("/", async (req, res) => {
    try {
      const { 
        location, 
        address, 
        hours_monday,
        hours_tuesday,
        hours_wednesday,
        hours_thursday,
        hours_friday,
        hours_saturday,
        hours_sunday,
        notes 
      } = req.body;
  
      const query = `
        INSERT INTO ${schema}.flyering_locations (
          location, 
          address, 
          hours_monday,
          hours_tuesday,
          hours_wednesday,
          hours_thursday,
          hours_friday,
          hours_saturday,
          hours_sunday,
          notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
      `;
      
      const values = [
        location, 
        address, 
        hours_monday,
        hours_tuesday,
        hours_wednesday,
        hours_thursday,
        hours_friday,
        hours_saturday,
        hours_sunday,
        notes
      ];
      
      const result = await pool.query(query, values);
      sendSuccessResponse(res, result.rows[0]);
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

// Update a location
router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        location, 
        address, 
        hours_monday,
        hours_tuesday,
        hours_wednesday,
        hours_thursday,
        hours_friday,
        hours_saturday,
        hours_sunday,
        notes 
      } = req.body;
      
      const query = `
        UPDATE ${schema}.flyering_locations 
        SET location = $1, 
            address = $2, 
            hours_monday = $3,
            hours_tuesday = $4,
            hours_wednesday = $5,
            hours_thursday = $6,
            hours_friday = $7,
            hours_saturday = $8,
            hours_sunday = $9,
            notes = $10
        WHERE id = $11 
        RETURNING *
      `;
      
      const values = [
        location, 
        address, 
        hours_monday,
        hours_tuesday,
        hours_wednesday,
        hours_thursday,
        hours_friday,
        hours_saturday,
        hours_sunday,
        notes,
        id
      ];
  
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }
  
      sendSuccessResponse(res, result.rows[0]);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

// Delete a location
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM ${schema}.flyering_locations WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    sendSuccessResponse(res, result.rows[0]);
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;