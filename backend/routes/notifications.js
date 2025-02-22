// notifications.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const pool = require('../db'); // Your PostgreSQL connection
import supabase from '../lib/supabase.js';


// Create notification when someone replies to a post
const createReplyNotification = async (postId, actorId, originalPostAuthorId) => {
  try {
    // Don't notify if user is replying to their own post
    if (actorId === originalPostAuthorId) return;
    
    await pool.query(
      'INSERT INTO notifications (user_id, post_id, actor_id, type) VALUES ($1, $2, $3, $4)',
      [originalPostAuthorId, postId, actorId, 'reply']
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get notifications for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.auth.payload.sub; // Auth0 user ID
    
    const result = await pool.query(
      `SELECT n.*, 
        u.username as actor_name, 
        u.avatar_url as actor_avatar,
        p.title as post_title
      FROM notifications n
      LEFT JOIN users u ON n.actor_id = u.auth0_id
      LEFT JOIN forum_messages p ON n.post_id = p.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.auth.payload.sub;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, createReplyNotification };