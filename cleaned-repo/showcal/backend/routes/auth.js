// routes/auth.js
import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authMiddleware, async (req, res) => {
    const auth0Id = req.user.sub;
    const email = req.user.email;

    try {
        // First try to find the user
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (existingUser.rows.length === 0) {
            // User doesn't exist, create them
            const newUser = await pool.query(
                'INSERT INTO users (auth0_id, email) VALUES ($1, $2) RETURNING *',
                [auth0Id, email]
            );
            res.json(newUser.rows[0]);
        } else {
            // User exists, return their info
            res.json(existingUser.rows[0]);
        }
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

export default router;