// direct-messages.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import authMiddleware from '../middleware/auth.js'; // Your existing Auth0 middleware
import supabase from '../lib/supabase.js';
import pool from '../config/db.js';

const router = express.Router();

// Access check helper function
const checkMessageAccess = (userId, message) => {
  return message.sender_id === userId || message.recipient_id === userId;
};

// In your direct-messages.js file
async function updateOrCreateConversation(userId1, userId2, messageContent, messageTimestamp) {
    try {
      // Sort user IDs to ensure consistent conversation ID
      const [user1, user2] = [userId1, userId2].sort();
      
      // Check if conversation exists
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .match({ user1, user2 })
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking for existing conversation:', fetchError);
        throw fetchError;
      }
      
      if (existingConv) {
        // Update existing conversation
        const { error: updateError } = await supabase
          .from('conversations')
          .update({
            latest_message: messageContent,
            latest_message_at: messageTimestamp,
            // Increment unread count for recipient
            unread_count_user1: user1 === userId2 ? existingConv.unread_count_user1 + 1 : existingConv.unread_count_user1,
            unread_count_user2: user2 === userId2 ? existingConv.unread_count_user2 + 1 : existingConv.unread_count_user2
          })
          .match({ user1, user2 });
        
        if (updateError) throw updateError;
        return existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: insertError } = await supabase
          .from('conversations')
          .insert({
            user1,
            user2,
            latest_message: messageContent,
            latest_message_at: messageTimestamp,
            unread_count_user1: user1 === userId2 ? 1 : 0, // Set unread count for recipient
            unread_count_user2: user2 === userId2 ? 1 : 0
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newConv.id;
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

// Get all conversations for the current user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
      const auth0_id = req.user.sub;
      console.log("Fetching conversations for user:", auth0_id);
      
      // Get all conversations where the user is either user1 or user2
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1.eq.${auth0_id},user2.eq.${auth0_id}`)
        .order('latest_message_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ error: error.message });
      }
      
      console.log(`Found ${conversations.length} conversations`);
      
      // Get other user IDs to fetch their profile information
      const otherUserIds = conversations.map(conv => 
        conv.user1 === auth0_id ? conv.user2 : conv.user1
      );
      
      // Fetch user profile information from PostgreSQL
      const userProfiles = await pool.query(
        'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = ANY($1)',
        [otherUserIds]
      );
      
      // Create a map for quick lookup
      const userProfileMap = {};
      userProfiles.rows.forEach(profile => {
        userProfileMap[profile.auth0_id] = profile;
      });
      
      // Add user profile information to conversations
      // In direct-messages.js, in the /conversations route
const conversationsWithProfiles = conversations.map(conv => {
    const otherUserId = conv.user1 === auth0_id ? conv.user2 : conv.user1;
    
    // Extract proper format for last_message
    let lastMessage = '';
    try {
      if (conv.latest_message) {
        if (typeof conv.latest_message === 'string') {
          try {
            // Try to parse as JSON first
            const contentObj = JSON.parse(conv.latest_message);
            if (contentObj.blocks && contentObj.blocks.length > 0) {
              // It's Draft.js format
              lastMessage = contentObj.blocks.map(b => b.text).join(' ');
            } else {
              lastMessage = conv.latest_message;
            }
          } catch (e) {
            // If parsing fails, it's probably just a string
            lastMessage = conv.latest_message;
          }
        } else if (typeof conv.latest_message === 'object') {
          // Handle JSON format that's already parsed
          if (conv.latest_message.blocks) {
            lastMessage = conv.latest_message.blocks.map(b => b.text).join(' ');
          } else {
            lastMessage = JSON.stringify(conv.latest_message);
          }
        }
      }
    } catch (e) {
      console.error("Error parsing message:", e);
      lastMessage = "Message content unavailable";
    }
    
    return {
      id: conv.id,
      other_user: userProfileMap[otherUserId] || { 
        auth0_id: otherUserId,
        username: 'Unknown User',
        avatar_url: null
      },
      last_message: lastMessage,
      last_message_at: conv.latest_message_at,
      unread: conv.user1 === auth0_id ? 
        conv.unread_count_user1 > 0 : 
        conv.unread_count_user2 > 0
    };
  });
      
      res.json(conversationsWithProfiles);
    } catch (error) {
      console.error('Error in conversation route:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Get messages between current user and specified user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const auth0_id = req.user.sub;
    const otherUserId = req.params.userId;
    
    // Validate otherUserId
    if (!otherUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Strict privacy check - only allow users to see their own conversations
    if (!auth0_id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Get messages between these two users
    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${auth0_id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${auth0_id})`)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Additional privacy check - filter messages to only those this user should see
    const accessibleMessages = messages.filter(msg => 
      checkMessageAccess(auth0_id, msg)
    );
    
    // Get user profiles for both users
    const userIds = [auth0_id, otherUserId];
    const userProfiles = await pool.query(
      'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = ANY($1)',
      [userIds]
    );
    
    // Create a map for quick lookup
    const userProfileMap = {};
    userProfiles.rows.forEach(profile => {
      userProfileMap[profile.auth0_id] = profile;
    });
    
    // Add user profile information to messages
    const messagesWithProfiles = accessibleMessages.map(message => ({
      ...message,
      sender: userProfileMap[message.sender_id] || { 
        auth0_id: message.sender_id,
        username: 'Unknown User',
        avatar_url: null
      }
    }));
    
    // Mark messages as read if current user is recipient
    const messagesToMark = accessibleMessages
      .filter(msg => msg.recipient_id === auth0_id && msg.read_at === null)
      .map(msg => msg.id);
      
    if (messagesToMark.length > 0) {
      const now = new Date().toISOString();
      
      // Update read_at for these messages
      await supabase
        .from('direct_messages')
        .update({ read_at: now })
        .in('id', messagesToMark);
    }
    
    res.json(messagesWithProfiles);
  } catch (error) {
    console.error('Error in conversation detail route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation with pagination
router.get('/conversation-by-id/:conversationId', authMiddleware, async (req, res) => {
    try {
      const auth0_id = req.user.sub;
      const conversationId = req.params.conversationId;
      
      // Get pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      console.log(`Fetching conversation ${conversationId} for user ${auth0_id} (page ${page}, limit ${limit})`);
      
      // Validate conversationId
      if (!conversationId) {
        return res.status(400).json({ error: 'Conversation ID is required' });
      }
      
      // Get the conversation to verify access
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (convError) {
        console.error('Error fetching conversation:', convError);
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Verify this user is part of the conversation
      if (conversation.user1 !== auth0_id && conversation.user2 !== auth0_id) {
        return res.status(403).json({ error: 'Unauthorized access to conversation' });
      }
      
      // Get the other user's ID
      const otherUserId = conversation.user1 === auth0_id ? conversation.user2 : conversation.user1;
      
      // Get total count for pagination info
      const { count, error: countError } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .or(`and(sender_id.eq.${auth0_id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${auth0_id})`);
        
      if (countError) {
        console.error('Error counting messages:', countError);
        return res.status(500).json({ error: countError.message });
      }
      
      const totalMessages = count;
      const totalPages = Math.ceil(totalMessages / limit);
      
      // Calculate pagination for retrieving the most recent messages first
      // For page 1, we want the most recent messages
      // Higher page numbers mean we're going back in history
      const from = Math.max(0, totalMessages - (page * limit));
      const to = totalMessages - ((page - 1) * limit) - 1;
      
      console.log(`Pagination: Total ${totalMessages}, Page ${page}/${totalPages}, Range ${from}-${to}`);
      
      // Get messages between these two users with pagination
      // Order by created_at descending to get most recent messages first
      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${auth0_id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${auth0_id})`)
        .order('created_at', { ascending: false }) // Descending to get newest first
        .range(from, to);
        
      if (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ error: error.message });
      }
      
      // Get user profiles for both users
      const userIds = [auth0_id, otherUserId];
      const userProfiles = await pool.query(
        'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = ANY($1)',
        [userIds]
      );
      
      // Create a map for quick lookup
      const userProfileMap = {};
      userProfiles.rows.forEach(profile => {
        userProfileMap[profile.auth0_id] = profile;
      });
      
      // Add user profile information to messages
      const messagesWithProfiles = messages.map(message => ({
        ...message,
        sender: userProfileMap[message.sender_id] || { 
          auth0_id: message.sender_id,
          username: 'Unknown User',
          avatar_url: null
        }
      }));
      
      // Mark messages as read if current user is recipient (only for current page)
      const messagesToMark = messages
        .filter(msg => msg.recipient_id === auth0_id && msg.read_at === null)
        .map(msg => msg.id);
        
      if (messagesToMark.length > 0) {
        const now = new Date().toISOString();
        
        // Update read_at for these messages
        await supabase
          .from('direct_messages')
          .update({ read_at: now })
          .in('id', messagesToMark);
          
        // Also reset unread counts in the conversation
        if (conversation.user1 === auth0_id) {
          await supabase
            .from('conversations')
            .update({ unread_count_user1: 0 })
            .eq('id', conversationId);
        } else {
          await supabase
            .from('conversations')
            .update({ unread_count_user2: 0 })
            .eq('id', conversationId);
        }
      }
      
      // Return conversation data in a structured format with pagination info
      res.json({
        conversation_id: conversation.id,
        messages: messagesWithProfiles,
        other_user: userProfileMap[otherUserId] || { 
          auth0_id: otherUserId,
          username: 'Unknown User', 
          avatar_url: null 
        },
        pagination: {
          page,
          limit,
          total: totalMessages,
          total_pages: totalPages,
          has_more: page < totalPages
        }
      });
    } catch (error) {
      console.error('Error in conversation detail route:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Send a new message
router.post('/send', authMiddleware, async (req, res) => {
    try {
      const auth0_id = req.user.sub; // Fixed to use .sub instead of destructuring
      
      if (!auth0_id) {
        console.error('Missing auth0_id in user object:', req.user);
        return res.status(403).json({ error: 'User ID not found in token' });
      }
      
      const { recipient_id, content, images } = req.body;
      
      // Validate required fields
      if (!recipient_id || !content) {
        return res.status(400).json({ error: 'Recipient ID and content are required' });
      }
      
      // Create timestamp for message
      const now = new Date().toISOString();
      
      // Create new message
      const { data: message, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: auth0_id,
          recipient_id,
          content,
          images: images || [],
          created_at: now
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: error.message });
      }
      
      // Update or create conversation record for both users
      const conversationId = await updateOrCreateConversation(auth0_id, recipient_id, content, now);
      
      // Get sender profile
      const senderProfile = await pool.query(
        'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = $1',
        [auth0_id]
      );
      
      // Add sender profile to message
      const messageWithProfile = {
        ...message,
        sender: senderProfile.rows[0] || { 
          auth0_id,
          username: 'Unknown User',
          avatar_url: null
        },
        conversation_id: conversationId // Add the conversation ID to the response
      };
      
      res.status(201).json(messageWithProfile);
    } catch (error) {
      console.error('Error in send message route:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Send a message in an existing conversation
router.post('/:conversationId/send', authMiddleware, async (req, res) => {
  try {
    const auth0_id = req.user.sub;
    const conversationId = req.params.conversationId;
    const { content, images } = req.body;
    
    if (!auth0_id) {
      return res.status(403).json({ error: 'User ID not found in token' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Get the conversation to verify access and get recipient
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
      
    if (convError) {
      console.error('Error fetching conversation:', convError);
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Verify this user is part of the conversation
    if (conversation.user1 !== auth0_id && conversation.user2 !== auth0_id) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }
    
    // Get the recipient's ID (the other user)
    const recipient_id = conversation.user1 === auth0_id ? conversation.user2 : conversation.user1;
    
    // Create timestamp for message
    const now = new Date().toISOString();
    
    // Create new message
    const { data: message, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: auth0_id,
        recipient_id,
        content,
        images: images || [],
        created_at: now
      })
      .select('*')
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Update conversation record
    const [user1, user2] = [auth0_id, recipient_id].sort();
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        latest_message: content,
        latest_message_at: now,
        // Increment unread count for recipient
        unread_count_user1: user1 === recipient_id ? conversation.unread_count_user1 + 1 : conversation.unread_count_user1,
        unread_count_user2: user2 === recipient_id ? conversation.unread_count_user2 + 1 : conversation.unread_count_user2
      })
      .eq('id', conversationId);
      
    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return res.status(500).json({ error: updateError.message });
    }
    
    // Get sender profile
    const senderProfile = await pool.query(
      'SELECT auth0_id, username, avatar_url FROM users WHERE auth0_id = $1',
      [auth0_id]
    );
    
    // Add sender profile to message
    const messageWithProfile = {
      ...message,
      sender: senderProfile.rows[0] || { 
        auth0_id,
        username: 'Unknown User',
        avatar_url: null
      },
      conversation_id: conversationId
    };
    
    res.status(201).json(messageWithProfile);
  } catch (error) {
    console.error(`Error sending message in conversation ${req.params.conversationId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Mark conversation as read
router.post('/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const auth0_id = req.user.sub;
    const conversationId = req.params.conversationId;
    
    // Get the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
      
    if (convError) {
      console.error('Error fetching conversation:', convError);
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Verify this user is part of the conversation
    if (conversation.user1 !== auth0_id && conversation.user2 !== auth0_id) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }
    
    // Determine which unread count to reset
    const updateData = conversation.user1 === auth0_id
      ? { unread_count_user1: 0 }
      : { unread_count_user2: 0 };
    
    // Update the conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);
      
    if (updateError) {
      console.error('Error marking conversation as read:', updateError);
      return res.status(500).json({ error: updateError.message });
    }
    
    // Get the other user's ID
    const otherUserId = conversation.user1 === auth0_id ? conversation.user2 : conversation.user1;
    
    // Mark all messages from other user as read
    const { error: msgUpdateError } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .match({ sender_id: otherUserId, recipient_id: auth0_id, read_at: null });
      
    if (msgUpdateError) {
      console.error('Error marking messages as read:', msgUpdateError);
      return res.status(500).json({ error: msgUpdateError.message });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in mark conversation as read route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.put('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const auth0_id = req.user.sub;
    const { messageId } = req.params;
    
    // Validate messageId
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
    }
    
    // Security check - validate user identity
    if (!auth0_id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Check if message exists and user is the recipient
    const { data: message, error: fetchError } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('id', messageId)
      .single();
      
    if (fetchError || !message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Privacy check - only recipient can mark as read
    if (message.recipient_id !== auth0_id) {
      return res.status(403).json({ error: 'You can only mark messages sent to you as read' });
    }
    
    // Update read_at for this message
    const { error: updateError } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
      
    if (updateError) {
      console.error('Error marking message as read:', updateError);
      return res.status(500).json({ error: updateError.message });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in mark as read route:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;