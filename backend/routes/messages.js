import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from "../config/db.js";
import supabase from '../lib/supabase.js';
const router = express.Router();

// Original route - Get all messages (non-threaded)
router.get('/', authMiddleware, async (req, res) => {
    const { category = 'General' } = req.query;
    
    try {
        const { data: messagesData, error: messagesError } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('category', category)
            .is('parent_id', null)  // Only get non-reply messages
            .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        const auth0Ids = [...new Set(messagesData.map(msg => msg.auth0_id))];
        const userAvatars = await pool.query(
            'SELECT auth0_id, avatar_url FROM users WHERE auth0_id = ANY($1)',
            [auth0Ids]
        );

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

// Get all threads in a category
router.get('/threads/:category', authMiddleware, async (req, res) => {
    try {
        const { category } = req.params;
        const { data: threadsData, error: threadsError } = await supabase
            .from('thread_listings')
            .select('*')
            .eq('category', category)
            .order('last_reply_at', { ascending: false });

        if (threadsError) throw threadsError;

        // Get avatars for thread starters from Supabase
        const auth0Ids = [...new Set(threadsData.map(thread => thread.auth0_id))];
        const { data: userAvatars, error: avatarsError } = await supabase
            .from('users')
            .select('auth0_id, avatar_url')
            .in('auth0_id', auth0Ids);

        if (avatarsError) throw avatarsError;

        const threadsWithAvatars = threadsData.map(thread => ({
            ...thread,
            avatar_url: userAvatars.find(u => u.auth0_id === thread.auth0_id)?.avatar_url
        }));

        res.json(threadsWithAvatars);
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single thread with replies
router.get('/thread/:threadId', authMiddleware, async (req, res) => {
    try {
        const { threadId } = req.params;
        
        // Get thread and replies
        const { data: thread, error: threadError } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('id', threadId)
            .single();
            
        if (threadError) throw threadError;

        const { data: replies, error: repliesError } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('parent_id', threadId)
            .order('created_at', { ascending: true });
            
        if (repliesError) throw repliesError;

        // Get avatars for all users from Supabase
        const allAuth0Ids = [...new Set([
            thread.auth0_id,
            ...(replies?.map(reply => reply.auth0_id) || [])
        ])];

        const { data: userAvatars, error: avatarsError } = await supabase
            .from('users')
            .select('auth0_id, avatar_url')
            .in('auth0_id', allAuth0Ids);

        if (avatarsError) throw avatarsError;

        // Add avatars to thread and replies
        const threadWithAvatar = {
            ...thread,
            avatar_url: userAvatars.find(u => u.auth0_id === thread.auth0_id)?.avatar_url
        };

        const repliesWithAvatars = replies?.map(reply => ({
            ...reply,
            avatar_url: userAvatars.find(u => u.auth0_id === reply.auth0_id)?.avatar_url
        })) || [];

        res.json({
            thread: threadWithAvatar,
            replies: repliesWithAvatars
        });
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new thread
router.post('/thread', authMiddleware, async (req, res) => {
    console.log('Received POST request to /thread');
    console.log('Request body:', req.body);
    console.log('Auth user:', req.user);
    
    const { title, content, category = 'General', author } = req.body;
    const auth0Id = req.user.sub;
    
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
        
        // Use author name in priority: 
        // 1. Provided author from Auth0
        // 2. PostgreSQL username
        // 3. PostgreSQL email
        // 4. Anonymous
        const finalAuthor = author || user.username || user.email || 'Anonymous';

        // Insert thread into Supabase
        const { data: thread, error } = await supabase
            .from('forum_messages')
            .insert([{
                title,
                content,
                category,
                auth0_id: auth0Id,
                author: finalAuthor,
                is_thread_starter: true,
                reply_count: 0,
                last_reply_at: new Date(),
                is_edited: false
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            ...thread,
            avatar_url: user.avatar_url
        });
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add reply to thread
router.post('/thread/:threadId/reply', authMiddleware, async (req, res) => {
    const { content, author } = req.body;
    const { threadId } = req.params;
    const auth0Id = req.user.sub;
    
    try {
        // Get user info
        const userResult = await pool.query(
            'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        
        // Use author name in priority:
        // 1. Provided author from Auth0
        // 2. PostgreSQL username
        // 3. PostgreSQL email
        // 4. Anonymous
        const finalAuthor = author || user.username || user.email || 'Anonymous';

        // Add reply using the stored procedure
        const { data: reply, error } = await supabase.rpc('add_reply_to_thread', {
            p_thread_id: threadId,
            p_content: content,
            p_auth0_id: auth0Id,
            p_author: finalAuthor
        });

        if (error) throw error;

        res.json({
            ...reply,
            avatar_url: user.avatar_url
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;