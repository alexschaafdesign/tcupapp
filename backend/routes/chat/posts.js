// posts.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import pool from '../../config/db.js';
import supabase from '../../lib/supabase.js';
const router = express.Router();
import { createReplyNotification } from '../notifications.js';



router.get('/', async (req, res) => {
  try {
      const { tags } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const tagIds = tags ? tags.split(',').map(Number) : [];
      
      // Get threads with pagination
      let query = supabase
          .from('forum_messages')
          .select('*', { count: 'exact' }) // Get total count for pagination
          .is('parent_id', null)
          .order('created_at', { ascending: false }) // Consider this for consistent ordering
          .range(offset, offset + limit - 1); // Add LIMIT and OFFSET

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
              return res.json({ 
                  posts: [],
                  pagination: { page, limit, total: 0, pages: 0 }
              });
          }
      }
        const { data: threadsData, count } = await query;
        if (!threadsData || threadsData.length === 0) {
            return res.json({
                posts: [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    pages: Math.ceil((count || 0) / limit)
                }
            });
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

        const postsWithData = sortedThreadsData.map((post) => {
          // Find user data for thread author
          const authorData = userData.find((u) => u.auth0_id === post.auth0_id);
        
          // Check if this is an imported post
          const isImported = post.is_imported === true;
        
          // Derive avatar
          const finalAvatarUrl = isImported
            ? post.imported_avatar_url // fallback to DB column for imported avatar
            : authorData?.avatar_url;  // real user’s avatar if not imported
          
          // If you also want a final author name (like "alex" or unknown):
          const finalAuthorName = isImported
            ? post.imported_author_name
            : (authorData?.username || 'Unknown User');
        
          // Last replier logic
          const lastReplyAuth0Id = lastReplyAuth0IdMap[post.id];
          const lastReplierData = lastReplyAuth0Id
            ? userData.find((u) => u.auth0_id === lastReplyAuth0Id)
            : null;
        
          return {
            ...post,
            reply_count: replyCountMap[post.id] || 0,
            last_reply_at: lastReplyMap[post.id] || null,
            last_reply_by: lastReplierData?.username || lastReplyByMap[post.id] || null,
            
            // Use your new final avatar & author
            avatar_url: finalAvatarUrl,
            author: finalAuthorName, // optional if you want to rely on 'author'
            
            // Or if you prefer "username" for the front-end, set that too
            username: isImported
              ? post.imported_author_name
              : (authorData?.username || 'Unknown User'),
            
            tags: tagsByPostId[post.id] || []
          };
        });
        
        res.json({
          posts: postsWithData,
          pagination: {
              page,
              limit,
              total: count,
              pages: Math.ceil(count / limit)
          }
      });
  } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: error.message });
  }
});

const getThreadById = async (req, res) => {
  const { threadId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50; // Higher limit for replies
  const offset = (page - 1) * limit;
  
  try {
    // Get the thread (main post)
    const { data: threadData, error: threadError } = await supabase
      .from('forum_messages')
      .select('*')
      .eq('id', threadId)
      .single();
    
    if (threadError) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Get replies with pagination
    const { data: repliesData, count, error: repliesError } = await supabase
      .from('forum_messages')
      .select('*', { count: 'exact' })
      .eq('parent_id', threadId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (repliesError) {
      return res.status(500).json({ error: 'Failed to fetch replies' });
    }

    console.log('Supabase returned:', threadData, threadError);
    
    
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
    let userResult; // Declare it here so it's in scope
    
    if (authIds.length > 0) {
      // Get user info from PostgreSQL for real users
      // This is your existing code to fetch user avatars, etc.
      userResult = await pool.query(
        'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = ANY($1)',
        [authIds]
      );
      
      userInfo = userResult.rows.reduce((acc, user) => {
        acc[user.auth0_id] = user;
        return acc;
      }, {});
    }
    
    console.log('authIds:', authIds);
    if (userResult) {
      console.log('Found userData rows:', userResult.rows);
    } else {
      console.log('No userResult because authIds was empty or an error occurred.');
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
        ? threadData.imported_avatar_url // <-- use the custom URL for imported
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
        ? reply.imported_avatar_url   // Show the custom avatar if imported
        : userInfo[reply.auth0_id]?.avatar_url,
      date_display: reply.is_imported
        ? reply.imported_date // Use the imported date text directly
        : new Date(reply.created_at).toLocaleString() // Format regular dates
    }));
    
    res.json({
      post: processedThread,
      replies: processedReplies,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getThreadById:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Use this updated function in your existing route
router.get('/thread/:threadId', authMiddleware, getThreadById);






// Create new post
router.post('/', authMiddleware, async (req, res) => {
  const {
      title,
      content,
      tags,
      images,
      is_imported,
      imported_author_name,
      imported_date,
      imported_avatar_url // <-- new field
  } = req.body;

  const auth0Id = req.user.sub;

  try {
      // First, verify the user
      const user = await pool.query(
          'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
          [auth0Id]
      );

      if (user.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      const { username, avatar_url } = user.rows[0];
      const finalAuthor = username || user.rows[0].email || 'Anonymous';

      // If the post is imported and has a valid date, override created_at
      let finalCreatedAt;
      if (is_imported && imported_date) {
          const parsedDate = new Date(imported_date);
          if (!isNaN(parsedDate.valueOf())) {
              finalCreatedAt = parsedDate.toISOString();
          }
      }

      // Create the post
      const { data: post, error: postError } = await supabase
          .from('forum_messages')
          .insert([{
              title,
              content,
              auth0_id: auth0Id, // The real "owner" in supabase
              author: finalAuthor,
              reply_count: 0,
              is_thread_starter: true,
              is_edited: false,
              images: images || [],
              // Imported fields
              is_imported: is_imported || false,
              imported_author_name: imported_author_name || null,
              imported_date: imported_date || null,
              imported_avatar_url: imported_avatar_url || null, // <--- store it
              // If we parsed a valid date, override created_at
              created_at: finalCreatedAt || new Date().toISOString()
                      }])
          .select()
          .single();

      if (postError) throw postError;

      // Add tags
      if (tags?.length > 0) {
          await supabase
              .from('post_tags')
              .insert(tags.map((tagId) => ({
                  post_id: post.id,
                  tag_id: tagId
              })));
      }

      // Fetch tags for response
      const { data: postTags } = await supabase
          .from('post_tags')
          .select('tag:tags(*)')
          .eq('post_id', post.id);

      // Return the new post data
      res.json({
          ...post,
          avatar_url,   // The real user's avatar if not imported
          username,
          tags: postTags?.map((pt) => pt.tag) || []
      });
  } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: error.message });
  }
});

// Add reply to post
router.post('/:id/reply', authMiddleware, async (req, res) => {
  const { 
      content, 
      images, 
      is_imported, 
      imported_author_name, 
      imported_date 
  } = req.body;
  
  const { id: parentId } = req.params;
  const auth0Id = req.user.sub;
  
  try {
      // 1) Verify the user exists
      const user = await pool.query(
          'SELECT email, username, avatar_url FROM users WHERE auth0_id = $1',
          [auth0Id]
      );

      if (user.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      // 2) Get original post's author (for notifications)
      const { data: parentPost } = await supabase
          .from('forum_messages')
          .select('auth0_id')
          .eq('id', parentId)
          .single();

      const { username, avatar_url } = user.rows[0];
      const finalAuthor = username || user.rows[0].email || 'Anonymous';

      // 3) Update parent post's last_activity_at to "now"
      await supabase
          .from('forum_messages')
          .update({ last_activity_at: new Date() })
          .eq('id', parentId);

      // 4) If this reply is imported and has a valid date, override created_at
      let finalCreatedAt;
      if (is_imported && imported_date) {
          const parsedDate = new Date(imported_date);
          if (!isNaN(parsedDate.valueOf())) {
              finalCreatedAt = parsedDate.toISOString();
          }
      }

      // 5) Create the reply
      const { data: reply, error } = await supabase
          .from('forum_messages')
          .insert([{
              content,
              parent_id: parentId,
              auth0_id: auth0Id,
              author: finalAuthor,
              images: images || [],
              is_imported: is_imported || false,
              imported_author_name: imported_author_name || null,
              imported_date: imported_date || null,
              created_at: finalCreatedAt || new Date().toISOString()
          }])
          .select()
          .single();

      if (error) throw error;

      // 6) Create a notification for the original post author (only if non-imported)
      if (!is_imported && parentPost?.auth0_id && parentPost.auth0_id !== auth0Id) {
          await createReplyNotification(parentId, auth0Id, parentPost.auth0_id, reply.id);
      }

      // 7) Return the new reply
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
// In posts.js, update the route for adding reactions:
router.post('/:postId/reactions', authMiddleware, async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.sub; // from Auth0
    const postId = req.params.postId;

    // Get the post to check who authored it
    const { data: post, error: postError } = await supabase
      .from('forum_messages')
      .select('auth0_id')
      .eq('id', postId)
      .single();
    
    if (postError) throw postError;
    
    // Check if user already reacted
    const { data: existing } = await supabase
      .from('user_reactions')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing reaction
      await supabase
        .from('user_reactions')
        .update({ type })
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      // Create new reaction
      await supabase
        .from('user_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          type
        });
      
      // Create notification for the post author (only for new reactions)
      if (post && post.auth0_id && post.auth0_id !== userId) {
        await createReactionNotification(postId, userId, post.auth0_id, type);
      }
    }

    // Rest of your code...
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
  try {
    const { id: parentId } = req.params;
    const { content, authorName, createdAt, avatarUrl } = req.body;
    
    // The "real" user performing the insert (likely the admin)
    const auth0Id = req.user.sub;

    // Make sure we can parse createdAt
    let finalCreatedAt = new Date();
    if (createdAt) {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.valueOf())) {
        finalCreatedAt = parsed;
      }
    }

    // Insert the new "imported" reply
    const { data: reply, error } = await supabase
      .from('forum_messages')
      .insert([
        {
          parent_id: parentId,
          content,
          auth0_id: auth0Id,       // The row-level “owner” can be you (admin)
          author: null,            // Regular author field is unused for imported
          is_imported: true,
          imported_author_name: authorName,
          imported_date: createdAt,  // or a display string
          imported_avatar_url: avatarUrl, // <-- store in the new column
          created_at: finalCreatedAt.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Return the newly created reply directly
    res.json(reply);

  } catch (error) {
    console.error('Error adding historical reply:', error);
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
  

export default router;