// routes/chat/read-status.js
import express from 'express';
import supabase from '../../lib/supabase.js';
const router = express.Router();
import authMiddleware from '../../middleware/auth.js';

// Mark thread as read
router.post('/:threadId', authMiddleware, async (req, res) => {
    try {
      const auth0Id = req.auth?.payload?.sub;
      const { threadId } = req.params;
      
      console.log('THREAD READ UPDATE:', {
        auth0Id,
        threadId,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase
            .from('thread_read_status')
            .upsert(
                {
                auth0_id: auth0Id,
                thread_id: threadId,
                last_read_at: new Date().toISOString()
                },
                { onConflict: 'auth0_id,thread_id' }
            )
            .select();
      
      console.log('THREAD READ RESULT:', { data, error });
      
      if (error) throw error;
      
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error marking thread as read:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Get read status for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    
    if (!auth0Id) {
      return res.json({});
    }
    
    const { data, error } = await supabase
      .from('thread_read_status')
      .select('thread_id, last_read_at')
      .eq('auth0_id', auth0Id);
    
    if (error) throw error;
    
    const readStatus = {};
    data.forEach(item => {
      readStatus[item.thread_id] = item.last_read_at;
    });
    
    res.json(readStatus);
  } catch (error) {
    console.error('Error fetching read status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;