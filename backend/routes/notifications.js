// notifications.js
import express from 'express';
import pool from '../config/db.js';
import supabase from '../lib/supabase.js';
import authMiddleware from '../middleware/auth.js';


const router = express.Router();

// Create notification for reply
export async function createReplyNotification(postId, actorId, originalPostAuthorId, replyId) {
  try {
    if (actorId === originalPostAuthorId) return;
    
    await pool.query(
      'INSERT INTO notifications (user_id, post_id, actor_id, type, reply_id) VALUES ($1, $2, $3, $4, $5)',
      [originalPostAuthorId, postId, actorId, 'reply', replyId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Get notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get notifications with user data from PostgreSQL
    const result = await pool.query(
      `SELECT n.*, u.username as actor_name, u.avatar_url as actor_avatar
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.auth0_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC LIMIT 50`,
      [userId]
    );

    // Get post data from Supabase
    const { data: posts } = await supabase
      .from('forum_messages')
      .select('id, title, parent_id')
      .in('id', result.rows.map(n => n.post_id));

    // Combine the data
    const notificationsWithData = result.rows.map(notification => {
      const postData = posts?.find(p => p.id === notification.post_id);
      return {
        ...notification,
        post_title: postData?.title,
        // thread_id remains the parent thread's id:
        thread_id: postData?.parent_id || postData?.id,
        // Use the stored reply_id for highlighting:
        reply_id: notification.reply_id
      };
    });

    res.json(notificationsWithData);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.sub;
    
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
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    
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

export { router as default };