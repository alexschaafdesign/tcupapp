// posts.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from "../config/db.js";
import supabase from '../lib/supabase.js';
const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try {
        const { tags } = req.query;
        const tagIds = tags ? tags.split(',').map(Number) : [];
        
        let query = supabase
            .from('thread_listings')
            .select('*')
            .order('created_at', { ascending: false });
 
        if (tagIds.length > 0) {
            const { data: taggedThreadIds } = await supabase
                .from('post_tags')
                .select('post_id')
                .in('tag_id', tagIds);
            
            if (taggedThreadIds?.length > 0) {
                query = query.in('id', taggedThreadIds.map(t => t.post_id));
            }
        }
 
        const { data: threadsData } = await query;
 
        // Get all auth0_ids including those from replies
        const allAuth0Ids = [...new Set([
            ...threadsData.map(post => post.auth0_id),
            ...threadsData.flatMap(post => post.replies?.map(r => r.auth0_id) || [])
        ])];
 
        // Get user data for posts and replies
        const userData = await pool.query(
            'SELECT auth0_id, avatar_url, username FROM users WHERE auth0_id = ANY($1)',
            [allAuth0Ids]
        );
 
        const { data: postTags } = await supabase
            .from('post_tags')
            .select('post_id, tag:tags(*)')
            .in('post_id', threadsData.map(p => p.id));
 
        const postsWithData = threadsData.map(post => ({
            ...post,
            avatar_url: userData.rows.find(u => u.auth0_id === post.auth0_id)?.avatar_url,
            username: userData.rows.find(u => u.auth0_id === post.auth0_id)?.username,
            tags: postTags?.filter(pt => pt.post_id === post.id).map(pt => pt.tag) || [],
            replies: post.replies?.map(reply => ({
                ...reply,
                avatar_url: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.avatar_url,
                username: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.username
            }))
        }));
 
        res.json(postsWithData);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
 });

// Get single post/thread with replies
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: post } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('id', id)
            .single();

        const { data: replies } = await supabase
            .from('forum_messages')
            .select('*')
            .eq('parent_id', id)
            .order('created_at', { ascending: true });

        const allAuth0Ids = [...new Set([
            post.auth0_id,
            ...(replies?.map(reply => reply.auth0_id) || [])
        ])];

        const userData = await pool.query(
            'SELECT auth0_id, avatar_url, username FROM users WHERE auth0_id = ANY($1)',
            [allAuth0Ids]
        );

        const { data: postTags } = await supabase
            .from('post_tags')
            .select('tag:tags(*)')
            .eq('post_id', id);

        const postWithData = {
            ...post,
            avatar_url: userData.rows.find(u => u.auth0_id === post.auth0_id)?.avatar_url,
            username: userData.rows.find(u => u.auth0_id === post.auth0_id)?.username,
            tags: postTags?.map(pt => pt.tag) || []
        };

        const repliesWithData = replies?.map(reply => ({
            ...reply,
            avatar_url: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.avatar_url,
            username: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.username
        })) || [];

        res.json({
            post: postWithData,
            replies: repliesWithData
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new post
router.post('/', authMiddleware, async (req, res) => {
    const { title, content, tags } = req.body;
    const auth0Id = req.user.sub;
    
    try {
        const user = await pool.query(
            'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { username, avatar_url } = user.rows[0];
        const finalAuthor = username || user.rows[0].email || 'Anonymous';

        // Create post
        const { data: post, error: postError } = await supabase
            .from('forum_messages')
            .insert([{
                title,
                content,
                auth0_id: auth0Id,
                author: finalAuthor,
                reply_count: 0,
                is_thread_starter: true,
                is_edited: false
            }])
            .select()
            .single();

        if (postError) throw postError;

        // Add tags
        if (tags?.length > 0) {
            await supabase
                .from('post_tags')
                .insert(tags.map(tagId => ({
                    post_id: post.id,
                    tag_id: tagId
                })));
        }

        // Get tags for response
        const { data: postTags } = await supabase
            .from('post_tags')
            .select('tag:tags(*)')
            .eq('post_id', post.id);

        res.json({
            ...post,
            avatar_url,
            username,
            tags: postTags?.map(pt => pt.tag) || []
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add reply to post
router.post('/:id/reply', authMiddleware, async (req, res) => {
    const { content } = req.body;
    const { id: parentId } = req.params;
    const auth0Id = req.user.sub;
    
    try {
        const user = await pool.query(
            'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
            [auth0Id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { username, avatar_url } = user.rows[0];
        const finalAuthor = username || user.rows[0].email || 'Anonymous';

        // Update parent's last_activity_at
        await supabase
            .from('forum_messages')
            .update({ last_activity_at: new Date() })
            .eq('id', parentId);

        // Create reply
        const { data: reply, error } = await supabase
            .from('forum_messages')
            .insert([{
                content,
                parent_id: parentId,
                auth0_id: auth0Id,
                author: finalAuthor
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            ...reply,
            avatar_url,
            username
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get reactions for a post
router.get('/:postId/reactions', authMiddleware, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('type, count')
        .eq('post_id', req.params.postId);
  
      if (error) throw error;
      
      const reactions = data.reduce((acc, curr) => {
        acc[curr.type] = curr.count;
        return acc;
      }, {});
  
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Add/update reaction
router.post('/:postId/reactions', authMiddleware, async (req, res) => {
    try {
      console.log('Request body:', req.body);
      console.log('User ID:', req.user?.sub);
      console.log('Post ID:', req.params.postId);
      const { type } = req.body;
      const userId = req.user.sub; // from Auth0
  
      // Check if user already reacted
      const { data: existing } = await supabase
        .from('user_reactions')
        .select()
        .eq('post_id', req.params.postId)
        .eq('user_id', userId)
        .single();
  
      if (existing) {
        // Update existing reaction
        await supabase
          .from('user_reactions')
          .update({ type })
          .eq('post_id', req.params.postId)
          .eq('user_id', userId);
      } else {
        // Create new reaction
        await supabase
          .from('user_reactions')
          .insert({
            post_id: req.params.postId,
            user_id: userId,
            type
          });
      }
  
      // Update reaction count
      const { data: counts } = await supabase
      .from('user_reactions')
      .select('type, count', { count: 'exact' })
      .eq('post_id', req.params.postId);
  
      res.json(counts);
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ error: error.message });
    }
  });

export default router;