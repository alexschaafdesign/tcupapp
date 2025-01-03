// routes/messages.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from "../config/db.js";  // PostgreSQL connection
import supabase from '../lib/supabase.js';

const router = express.Router();

// GET messages
router.get('/', authMiddleware, async (req, res) => {
    const { category = 'General' } = req.query;
    
    try {
        // Get messages from Supabase
        const { data: messagesData, error: messagesError } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Get user avatars from PostgreSQL
        const auth0Ids = [...new Set(messagesData.map(msg => msg.auth0_id))];
        const userAvatars = await pool.query(
            'SELECT auth0_id, avatar_url FROM users WHERE auth0_id = ANY($1)',
            [auth0Ids]
        );

        // Combine the data
        const messagesWithAvatars = messagesData.map(msg => ({
            ...msg,
            avatar_url: userAvatars.rows.find(u => u.auth0_id === msg.auth0_id)?.avatar_url
        }));

        res.json(messagesWithAvatars);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST new message
router.post('/', authMiddleware, async (req, res) => {
    const { content, category = 'General' } = req.body;
    const auth0Id = req.user.sub;
    const userEmail = req.user.email;  // Get email from auth middleware
    
    try {
        // Get user info from PostgreSQL
        const userResult = await pool.query(
            'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Insert message into Supabase
        const { data: message, error } = await supabase
            .from('forum_messages')
            .insert([
                {
                    content,
                    category,
                    auth0_id: auth0Id,
                    author: user.username || user.email || userEmail || 'Anonymous',  // Fallback chain
                    is_edited: false
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        // Return message with user data
        res.json({
            ...message,
            avatar_url: user.avatar_url
        });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;