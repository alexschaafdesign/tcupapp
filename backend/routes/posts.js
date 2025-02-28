// posts.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from "../config/db.js";
import supabase from '../lib/supabase.js';
const router = express.Router();
import { createReplyNotification } from './notifications.js';



router.get('/', async (req, res) => {
    try {
        const { tags } = req.query;
        const tagIds = tags ? tags.split(',').map(Number) : [];
        
        let query = supabase
            .from('thread_listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (tagIds.length > 0) {
            const { data: taggedThreadIds, error } = await supabase
                .from('post_tags')
                .select('post_id')
                .in('tag_id', tagIds);

            if (error) throw error; // Ensure errors don't go unnoticed

            // Extract post IDs as an array
            const postIds = taggedThreadIds.map(t => t.post_id);

            if (postIds.length > 0) {
                query = query.in('id', postIds);
            } else {
                return res.json([]); // Return empty array if no matching posts
            }
        }

        const { data: threadsData, error: threadsError } = await query;
        if (threadsError) throw threadsError;
        
        if (!threadsData || threadsData.length === 0) {
            return res.json([]);
        }
        
        // Fetch tags for all posts in one query
        const postIds = threadsData.map(post => post.id);
        const { data: postTags, error: postTagsError } = await supabase
            .from('post_tags')
            .select('post_id, tag:tags(*)')
            .in('post_id', postIds);
        
        if (postTagsError) throw postTagsError;
        
        // Group tags by post ID
        const tagsByPostId = postTags.reduce((acc, { post_id, tag }) => {
            if (!acc[post_id]) acc[post_id] = [];
            acc[post_id].push(tag);
            return acc;
        }, {});
        
       
        

        if (threadsError) throw threadsError;

        if (!threadsData || threadsData.length === 0) {
            return res.json([]); // Ensure the frontend receives an empty array
        }

        // Get all auth0_ids including those from replies
        const allAuth0Ids = [...new Set([
            ...threadsData.map(post => post.auth0_id),
            ...threadsData.map(post => post.last_reply_auth0_id).filter(Boolean)
        ])];

        // Get user data
        const { rows: userData } = await pool.query(
            'SELECT auth0_id, avatar_url, username FROM users WHERE auth0_id = ANY($1)',
            [allAuth0Ids]
        );

        const postsWithData = threadsData.map(post => ({
            ...post,
            avatar_url: userData.find(u => u.auth0_id === post.auth0_id)?.avatar_url,
            last_reply_avatar_url: userData.find(u => u.auth0_id === post.last_reply_auth0_id)?.avatar_url,
            username: userData.find(u => u.auth0_id === post.auth0_id)?.username,
            tags: tagsByPostId[post.id] || [] // ✅ Attach tags here!
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
        
        const { data: post, error } = await supabase
        .from('forum_messages')
        .select('*') // Fetch only `id` and `title`
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
            'SELECT auth0_id, avatar_url, username, title FROM users WHERE auth0_id = ANY($1)',
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
            username: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.username,
            title: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.title // ✅ Add title here
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

        // Get original post author's auth0_id
        const { data: parentPost } = await supabase
            .from('forum_messages')
            .select('auth0_id')
            .eq('id', parentId)
            .single();

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

        // Create notification for original post author
        if (parentPost?.auth0_id && parentPost.auth0_id !== auth0Id) {
            await createReplyNotification(parentId, auth0Id, parentPost.auth0_id, reply.id);
          }

        res.json({
            ...reply,
            avatar_url,
            username
        });

        // After createReplyNotification
        const checkNotif = await pool.query(
            'SELECT * FROM notifications WHERE post_id = $1',
            [parentId]
        );
        console.log('Created notification:', checkNotif.rows);

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

  // POST /api/posts/import
  router.post('/import', authMiddleware, async (req, res) => {
    const { title, content, userId, createdAt, tags, parentThreadId } = req.body;

    try {
        const { rows: userRows } = await pool.query(
            'SELECT username FROM users WHERE auth0_id = $1',
            [userId]
        );

        if (!userRows.length) {
            return res.status(404).json({ error: 'Specified user not found' });
        }

        const username = userRows[0].username;

        // Insert the post into Supabase using the correct column names
        const { data: post, error } = await supabase
            .from('forum_messages')
            .insert([
                {
                    title,
                    content,
                    auth0_id: userId,  // Changed from user_id to auth0_id
                    author: username,
                    created_at: createdAt,
                    parent_id: parentThreadId || null,
                    is_thread_starter: !parentThreadId
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Add tags if provided
        if (tags?.length) {
            const { error: tagError } = await supabase
                .from('post_tags')
                .insert(
                    tags.map(tagId => ({
                        post_id: post.id,
                        tag_id: tagId
                    }))
                );

            if (tagError) throw tagError;
        }

        // Update thread stats if this is a reply
        if (parentThreadId) {
            const { error: updateError } = await supabase
                .rpc('update_thread_reply_stats', { thread_id: parentThreadId });

            if (updateError) throw updateError;
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/edit/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, userId, createdAt } = req.body;

    try {
        // Get user info
        const { rows: userRows } = await pool.query(
            'SELECT username FROM users WHERE auth0_id = $1',
            [userId]
        );

        if (!userRows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update post
        const { data: post, error } = await supabase
            .from('forum_messages')
            .update({
                title,
                content,
                auth0_id: userId,
                author: userRows[0].username,
                created_at: createdAt,
                is_edited: true
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update tags
        if (tags) {
            // Remove existing tags
            await supabase
                .from('post_tags')
                .delete()
                .eq('post_id', id);

            // Add new tags
            if (tags.length > 0) {
                await supabase
                    .from('post_tags')
                    .insert(tags.map(tagId => ({
                        post_id: id,
                        tag_id: tagId
                    })));
            }
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add historical reply to historical thread
router.post('/:id/historical-reply', authMiddleware, async (req, res) => {
    const { content, userId, createdAt } = req.body;
    const { id: parentId } = req.params;
    
    try {
        // Verify user exists
        const { rows: userRows } = await pool.query(
            'SELECT username FROM users WHERE auth0_id = $1',
            [userId]
        );

        if (!userRows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create reply with custom timestamp
        const { data: reply, error } = await supabase
            .from('forum_messages')
            .insert([{
                content,
                parent_id: parentId,
                auth0_id: userId,
                author: userRows[0].username,
                created_at: createdAt
            }])
            .select()
            .single();

        if (error) throw error;

        // Add user data
        const userData = await pool.query(
            'SELECT avatar_url FROM users WHERE auth0_id = $1',
            [userId]
        );

        res.json({
            ...reply,
            avatar_url: userData.rows[0]?.avatar_url,
            username: userRows[0].username
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new tag
router.post('/tags', authMiddleware, async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    try {
        // Check if the tag already exists
        const { data: existingTag, error: fetchError } = await supabase
            .from('tags')
            .select('*')
            .ilike('name', name.trim()) // Case-insensitive match
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existingTag) {
            return res.status(409).json({ error: 'Tag already exists', tag: existingTag });
        }

        // Insert new tag
        const { data: newTag, error: insertError } = await supabase
            .from('tags')
            .insert([{ name: name.trim() }])
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this route to posts.js

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const auth0Id = req.user.sub;
    
    try {
      // Get the post to check ownership
      const { data: post, error: fetchError } = await supabase
        .from('forum_messages')
        .select('auth0_id, parent_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      // Get user roles to check for admin status
      const { rows: userRows } = await pool.query(
        'SELECT role FROM users WHERE auth0_id = $1',
        [auth0Id]
      );
      
      const userRoles = userRows[0]?.role || [];
      const isAdmin = userRoles.includes('admin');
      
      // Only allow deletion if user is post owner or admin
      if (post.auth0_id !== auth0Id && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized to delete this post' });
      }
      
      // If it's a thread (no parent_id), we need to delete all replies
      if (!post.parent_id) {
        // Delete all reactions to replies
        await supabase.rpc('delete_thread_reactions', { thread_id: id });
        
        // Delete all replies to this thread
        const { error: deleteRepliesError } = await supabase
          .from('forum_messages')
          .delete()
          .eq('parent_id', id);
          
        if (deleteRepliesError) throw deleteRepliesError;
        
        // Delete all tags associated with the thread
        const { error: deleteTagsError } = await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', id);
          
        if (deleteTagsError) throw deleteTagsError;
      } else {
        // For replies, we need to update the parent thread's reply count
        const { data: parentThread } = await supabase
          .from('forum_messages')
          .select('id')
          .eq('id', post.parent_id)
          .single();
          
        if (parentThread) {
          await supabase.rpc('update_thread_reply_stats', { thread_id: post.parent_id });
        }
      }
      
      // Delete reactions to this post
      const { error: deleteReactionsError } = await supabase
        .from('user_reactions')
        .delete()
        .eq('post_id', id);
        
      if (deleteReactionsError) throw deleteReactionsError;
      
      // Finally delete the post itself
      const { error: deletePostError } = await supabase
        .from('forum_messages')
        .delete()
        .eq('id', id);
        
      if (deletePostError) throw deletePostError;
      
      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: error.message });
    }
  });

export default router;