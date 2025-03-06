// routes/auth.js
import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';
import sgMail from '@sendgrid/mail'; // Add this import

// Set up SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

router.post('/register', authMiddleware, async (req, res) => {
    const auth0Id = req.user.sub;
    const email = req.user.email;
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
            
            // Send notification email for new users
            const msg = {
                to: 'admin@tcupboard.org',
                from: 'admin@tcupboard.org', 
                subject: 'New User Registration: TCUP',
                html: `
                    <h1>New User Registration</h1>
                    <p><strong>Username:</strong> ${username}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Auth0 ID:</strong> ${auth0Id}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                `
            };
            
            try {
                await sgMail.send(msg);
                console.log('New user notification email sent');
            } catch (emailError) {
                console.error('Error sending notification email:', emailError);
                // Continue with the response even if email fails
            }
            
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