import express from "express";
import pool from "../config/db.js";


const router = express.Router();


// Fetch all people
router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id, name, email FROM people");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching people:", error);
        res.status(500).json({ error: "Failed to fetch people." });
    }
});

// Add a new person
router.post("/add", async (req, res) => {
    const { name, email, bio, profile_photo } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO people (name, email, bio, profile_photo) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, bio, profile_photo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding person:", error);
        res.status(500).json({ error: "Failed to add person" });
    }
});

// Fetch a specific person and their bands
router.get("/:id", async (req, res) => {
    const personId = req.params.id;
    try {
        const person = await pool.query(
            "SELECT * FROM people WHERE id = $1",
            [personId]
        );

        const bands = await pool.query(
            `SELECT bands.* FROM bands
             JOIN peoplebands ON bands.id = peoplebands.band_id
             WHERE peoplebands.person_id = $1`,
            [personId]
        );

        const shows = await pool.query(
            `SELECT shows.* FROM shows
             JOIN bands ON shows.bands ILIKE '%' || bands.band || '%'
             JOIN peoplebands ON bands.id = peoplebands.band_id
             WHERE peoplebands.person_id = $1`,
            [personId]
        );

        res.json({
            person: person.rows[0],
            bands: bands.rows,
            shows: shows.rows,
        });
    } catch (error) {
        console.error("Error fetching person:", error);
        res.status(500).json({ error: "Failed to fetch person" });
    }
});

// Add a band to a person
router.post("/:id/bands", async (req, res) => {
    const { id: personId } = req.params;
    const { band_id } = req.body;
    try {
        await pool.query(
            "INSERT INTO peoplebands (person_id, band_id) VALUES ($1, $2)",
            [personId, band_id]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        console.error("Error associating band:", error);
        res.status(500).json({ error: "Failed to associate band" });
    }
});

export default router;