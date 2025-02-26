// routes/auth.js
import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authMiddleware, async (req, res) => {
    const auth0Id = req.user.sub;
    const email = req.user.email;
    // Get username from Auth0 profile - it might be in nickname, name, or preferred_username
// routes/auth.js - update line 12
const username = req.user.nickname || req.user.name || req.user.preferred_username || 
                 (req.user.email ? req.user.email.split('@')[0] : `user_${Date.now()}`);
    try {
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (existingUser.rows.length === 0) {
            // Add username to the insertion
            const newUser = await pool.query(
                'INSERT INTO users (auth0_id, email, username) VALUES ($1, $2, $3) RETURNING *',
                [auth0Id, email, username]
            );
            res.json(newUser.rows[0]);
        } else {
            res.json(existingUser.rows[0]);
        }
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

export default router;