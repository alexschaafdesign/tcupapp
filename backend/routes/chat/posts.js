// posts.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import pool from '../../config/db.js';
import supabase from '../../lib/supabase.js';
const router = express.Router();
import { createReplyNotification } from '../notifications.js';

const getThreadById = async (req, res) => {
    const { threadId } = req.params;
    
    try {
      // Get the thread and its replies
      const { data: threadData, error: threadError } = await supabase
        .from('forum_messages')
        .select('*')
        .eq('id', threadId)
        .single();
      
      if (threadError) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('forum_messages')
        .select('*')
        .eq('parent_id', threadId)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        return res.status(500).json({ error: 'Failed to fetch replies' });
      }
      
      // If these aren't imported posts, fetch user info from PostgreSQL as usual
      // For imported posts, we'll use the imported_author_name directly
      const authIds = [
        ...new Set([
          ...(!threadData.is_imported && threadData.auth0_id ? [threadData.auth0_id] : []),
          ...repliesData
            .filter(reply => !reply.is_imported && reply.auth0_id)
            .map(reply => reply.auth0_id)
        ])
      ];
      
      let userInfo = {};
      
      if (authIds.length > 0) {
        // Get user info from PostgreSQL for real users
        // This is your existing code to fetch user avatars, etc.
        const userResult = await pool.query(
          'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = ANY($1)',
          [authIds]
        );
        
        userInfo = userResult.rows.reduce((acc, user) => {
          acc[user.auth0_id] = user;
          return acc;
        }, {});
      }
      
      // Process the thread data
      const processedThread = {
        ...threadData,
        // For imported posts, use the imported_author_name
        // For regular posts, use the user info from PostgreSQL
        author: threadData.is_imported 
          ? threadData.imported_author_name 
          : (userInfo[threadData.auth0_id]?.username || 'Unknown User'),
        avatar_url: threadData.is_imported 
          ? null // No avatar for imported posts
          : userInfo[threadData.auth0_id]?.avatar_url,
        date_display: threadData.is_imported
          ? threadData.imported_date // Use the imported date text directly
          : new Date(threadData.created_at).toLocaleString() // Format regular dates
      };
      
      // Process the replies
      const processedReplies = repliesData.map(reply => ({
        ...reply,
        author: reply.is_imported
          ? reply.imported_author_name
          : (userInfo[reply.auth0_id]?.username || 'Unknown User'),
        avatar_url: reply.is_imported
          ? null // No avatar for imported posts
          : userInfo[reply.auth0_id]?.avatar_url,
        date_display: reply.is_imported
          ? reply.imported_date // Use the imported date text directly
          : new Date(reply.created_at).toLocaleString() // Format regular dates
      }));
      
      res.json({
        thread: processedThread,
        replies: processedReplies
      });
    } catch (error) {
      console.error('Error in getThreadById:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
  

router.get('/', async (req, res) => {
    try {
        const { tags } = req.query;
        const tagIds = tags ? tags.split(',').map(Number) : [];
        
        // Get threads
        let query = supabase
            .from('forum_messages')
            .select('*')
            .is('parent_id', null);

        if (tagIds.length > 0) {
            // Filter by tags if needed
            const { data: taggedThreadIds } = await supabase
                .from('post_tags')
                .select('post_id')
                .in('tag_id', tagIds);
            
            const postIds = taggedThreadIds.map(t => t.post_id);
            if (postIds.length > 0) {
                query = query.in('id', postIds);
            } else {
                return res.json([]);
            }
        }

        const { data: threadsData } = await query;
        if (!threadsData || threadsData.length === 0) {
            return res.json([]);
        }
        
        const postIds = threadsData.map(post => post.id);
        
        // Get all replies for these threads with auth0_id and author included
        const { data: allReplies } = await supabase
            .from('forum_messages')
            .select('parent_id, created_at, auth0_id, author')
            .in('parent_id', postIds);
        
        // Create maps for latest reply info and count
        const lastReplyMap = {};
        const lastReplyByMap = {};
        const lastReplyAuth0IdMap = {};
        const replyCountMap = {};
        
        allReplies.forEach(reply => {
            const parentId = reply.parent_id;
            
            // Track reply count
            replyCountMap[parentId] = (replyCountMap[parentId] || 0) + 1;
            
            // Track latest reply
            const replyDate = new Date(reply.created_at);
            if (!lastReplyMap[parentId] || replyDate > new Date(lastReplyMap[parentId])) {
                lastReplyMap[parentId] = reply.created_at;
                lastReplyByMap[parentId] = reply.author;
                lastReplyAuth0IdMap[parentId] = reply.auth0_id;
            }
        });
        
        // Sort by latest activity (either last reply or created date)
        const sortedThreadsData = threadsData.sort((a, b) => {
            const aActivity = lastReplyMap[a.id] || a.created_at;
            const bActivity = lastReplyMap[b.id] || b.created_at;
            return new Date(bActivity) - new Date(aActivity);
        });
        
        // Collect all auth0_ids needed (thread authors and reply authors)
        const allAuth0Ids = [...new Set([
            ...sortedThreadsData.map(post => post.auth0_id),
            ...Object.values(lastReplyAuth0IdMap).filter(id => id)
        ])];
        
        // Get user data for both thread authors and repliers
        const { rows: userData } = await pool.query(
            'SELECT auth0_id, avatar_url, username FROM users WHERE auth0_id = ANY($1)',
            [allAuth0Ids]
        );

        // Rest of your code (fetch tags, etc.)
        const { data: postTags } = await supabase
            .from('post_tags')
            .select('post_id, tag:tags(*)')
            .in('post_id', postIds);
        
        const tagsByPostId = postTags.reduce((acc, { post_id, tag }) => {
            if (!acc[post_id]) acc[post_id] = [];
            acc[post_id].push(tag);
            return acc;
        }, {});

        const postsWithData = sortedThreadsData.map(post => {
            // Find user data for thread author
            const authorData = userData.find(u => u.auth0_id === post.auth0_id);
            
            // Find user data for last replier (if exists)
            const lastReplyAuth0Id = lastReplyAuth0IdMap[post.id];
            const lastReplierData = lastReplyAuth0Id 
                ? userData.find(u => u.auth0_id === lastReplyAuth0Id)
                : null;
                
            return {
                ...post,
                reply_count: replyCountMap[post.id] || 0,
                last_reply_at: lastReplyMap[post.id] || null,
                last_reply_by: lastReplierData?.username || lastReplyByMap[post.id] || null,
                avatar_url: authorData?.avatar_url,
                username: authorData?.username,
                tags: tagsByPostId[post.id] || []
            };
        });

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
            'SELECT auth0_id, avatar_url, username, tagline FROM users WHERE auth0_id = ANY($1)',
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
            tagline: userData.rows.find(u => u.auth0_id === reply.auth0_id)?.tagline // ✅ Add tagline here
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
    const { title, content, tags, images, is_imported, imported_author_name, imported_date } = req.body;
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
                is_edited: false,
                images: images || [],
                // Add imported fields if provided
                is_imported: is_imported || false,
                imported_author_name: imported_author_name || null,
                imported_date: imported_date || null
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
    const { content, images, is_imported, imported_author_name, imported_date } = req.body;
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
                author: finalAuthor,
                images: images || [],
                // Add imported fields if provided
                is_imported: is_imported || false,
                imported_author_name: imported_author_name || null,
                imported_date: imported_date || null
            }])
            .select()
            .single();

        if (error) throw error;

        // Create notification for original post author (only for non-imported posts)
        if (!is_imported && parentPost?.auth0_id && parentPost.auth0_id !== auth0Id) {
            await createReplyNotification(parentId, auth0Id, parentPost.auth0_id, reply.id);
        }

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
    const { title, content, tags, userId, createdAt, images } = req.body;

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
                is_edited: true,
                images: images || undefined 
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

  // Add these routes to your existing posts.js file

// Import a thread from old forum content
router.post('/import-thread', authMiddleware, async (req, res) => {
    const { title, posts } = req.body;
    const userId = req.auth.payload.sub; // current user's auth0_id
    
    try {
      // Start a transaction
      const { data: threadPost, error: threadError } = await supabase
        .from('forum_messages')
        .insert({
          title,
          content: posts[0].content,
          is_thread_starter: true,
          is_imported: true,
          imported_author_name: posts[0].author,
          imported_date: posts[0].date,
          auth0_id: userId, // Use the current admin's ID for backend functions
          created_at: new Date().toISOString(), // Use current date for created_at
        })
        .select();
      
      if (threadError) {
        console.error('Error creating imported thread:', threadError);
        return res.status(500).json({ error: 'Failed to create thread', details: threadError });
      }
      
      const threadId = threadPost[0].id;
      
      // Add all the replies
      for (let i = 1; i < posts.length; i++) {
        const post = posts[i];
        const { error: replyError } = await supabase
          .from('forum_messages')
          .insert({
            content: post.content,
            is_thread_starter: false,
            parent_id: threadId,
            is_imported: true,
            imported_author_name: post.author,
            imported_date: post.date,
            auth0_id: userId, // Use the current admin's ID for backend functions
            created_at: new Date().toISOString(), // Use current date for created_at
          });
        
        if (replyError) {
          console.error(`Error creating imported reply ${i}:`, replyError);
          return res.status(500).json({ error: 'Failed to create reply', details: replyError });
        }
      }
      
      res.status(201).json({ success: true, threadId });
    } catch (error) {
      console.error('Error in import thread route:', error);
      res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
  });
  
  // Modify your existing thread endpoint to handle imported posts
  
  // Use this updated function in your existing route
  router.get('/thread/:threadId', getThreadById);

export default router;