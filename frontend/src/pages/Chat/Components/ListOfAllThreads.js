import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, List, ListItem, Paper, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../../../components/auth/AuthWrapper';
import { useAuth0 } from '@auth0/auth0-react';
import ActiveTags from './ActiveTags';
import { useApi } from '../../../hooks/useApi';

const ListOfAllThreads = ({ posts }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const TAG_LIMIT = isMobile ? 1 : 2; // Only show 1 tag on mobile
  const { callApi } = useApi();
  const [readStatus, setReadStatus] = useState({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Fetch read status for all threads when user is authenticated
  useEffect(() => {
    if (isAuthenticated && posts?.length > 0) {
      fetchReadStatus();
    }
  }, [isAuthenticated, posts]);

  const fetchReadStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const response = await callApi('/read-status');
      if (response) {
        setReadStatus(response);
      }
    } catch (error) {
      console.error('Error fetching read status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const isThreadUnread = (post) => {
    if (!isAuthenticated) return false;
    
    // If we have no read status for this thread, it's unread
    if (!readStatus[post.id]) return true;
    
    // Find the latest activity timestamp
    const threadTimestamp = new Date(post.created_at);
    const lastReplyTimestamp = post.last_reply_at ? new Date(post.last_reply_at) : null;
    const latestActivity = lastReplyTimestamp && lastReplyTimestamp > threadTimestamp 
      ? lastReplyTimestamp 
      : threadTimestamp;
    
    // Compare with last read timestamp
    const lastReadAt = new Date(readStatus[post.id]);
    return latestActivity > lastReadAt;
  };

  const formatDate = (rawDate) => {
    // Attempt to parse
    const postDate = new Date(rawDate);
    if (isNaN(postDate.valueOf())) {
      // If parse fails, just return the raw string
      return rawDate;
    }
  
    const now = new Date();
    const diff = now - postDate;
    const days = diff / (1000 * 60 * 60 * 24);
  
    // Same "today" / "yesterday" logic you already have
    if (days < 1) {
      if (postDate.getDate() === now.getDate()) {
        return `Today at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Yesterday at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (days < 7) {
      return `${postDate.toLocaleDateString([], { weekday: 'long' })} at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If older than 7 days, show "Mar 19, 2025"
    return postDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleClick = async (post, showAuthModal) => {
    if (isAuthenticated) {
      try {
        await callApi(`/api/posts/${post.id}/read`, {
          method: 'POST'
        });
        
        // Update local read status
        setReadStatus(prev => ({
          ...prev,
          [post.id]: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error marking thread as read:', error);
      }
      navigate(`/chat/${post.id}`);
    } else {
      showAuthModal();
    }
  };

  if (isLoadingStatus && posts?.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }



  return (
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <List sx={{ p: 0 }}>
        {posts.map((post) => {
          // Use the reply_count directly from the thread_listings view
          const replyCount = post.reply_count || 0;
          
          // Check if this is an imported post
          const isImported = post.is_imported === true;
          
          // Show last reply info for all posts if it exists
          const hasReplies = replyCount > 0 && post.last_reply_at;
          
          // Check if thread is unread
          const unread = isThreadUnread(post);
          
          // Get the correct author name and date display
          const authorName = isImported ? post.imported_author_name : post.author;
          const dateDisplay = formatDate(post.created_at);    

          // Get last reply info
          const lastReplyBy = post.last_reply_by || '';
          const lastReplyDate = post.last_reply_at ? formatDate(post.last_reply_at) : '';

          // Derive the correct avatar source
          // If it's imported, we give it a null or empty string 
          // so MUI shows the fallback avatar
  const avatarSrc = isImported
  ? post.avatar_url // or post.imported_avatar_url directly
  : post.avatar_url;          
          return (
            <AuthWrapper 
              key={post.id}
              message="Please log in to view thread details"
              renderContent={(showModal) => (
                <ListItem
                  onClick={() => handleClick(post, showModal)}
                  sx={{
                    p: isMobile ? 1 : 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' },
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: 1
                  }}
                >
                  {/* Mobile Layout */}
                  {isMobile ? (
                    <>
                      {/* Top Section - Title and Avatar */}
                      <Box sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <Avatar 
                          src={avatarSrc} 
                          sx={{ 
                            width: 40, 
                            height: 40
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            sx={{ 
                              color: 'primary.main',
                              fontWeight: unread ? 700 : 600,
                              fontSize: '1rem',
                              lineHeight: 1.2
                            }}
                          >
                            {post.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              by {authorName} · {dateDisplay}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Bottom Section - Preview Text and Stats */}
                      <Box sx={{ width: '100%', pl: 6 }}>
                        {/* Bottom row with replies count and tags */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {/* Reply Count */}
                          <Typography variant="caption" color="text.secondary">
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                          </Typography>
                          
                          {/* Tags in bottom right */}
                          {post.tags && post.tags.length > 0 && (
                            <Box>
                              <ActiveTags tags={post.tags.slice(0, TAG_LIMIT)} small />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </>
                  ) : (
                    /* Desktop Layout */
                    <>
                      {/* Left Side: Avatar */}
                      <Box 
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 70,
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: '8px 0 0 8px',
                          borderRight: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Avatar 
                          src={avatarSrc} 
                          sx={{ 
                            width: 50, 
                            height: 50
                          }}
                        />
                      </Box>

                      {/* Main Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Title and Tags Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography 
                            sx={{ 
                              color: 'primary.main',
                              fontWeight: unread ? 700 : 600,
                              fontSize: '1.1rem',
                              flex: 1,
                              mr: 2
                            }}
                          >
                            {post.title}
                          </Typography>

                          {/* Adding tags back for desktop */}
                          {post.tags && post.tags.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 0.5 }}>
                              <ActiveTags tags={post.tags.slice(0, TAG_LIMIT)} small />
                            </Box>
                          )}
                        </Box>

                        {/* Bottom Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          {/* Author Info and Stats on Left */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                by {authorName} · {dateDisplay}
                              </Typography>
                            </Box>
                            
                            <Typography variant="caption">
                              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                            </Typography>
                          </Box>
                          
                          {/* Last Reply Info - Desktop Only, Right Aligned */}
                          {/* Show for all posts with replies */}
                          {hasReplies && (
                            <Typography variant="caption" color="text.secondary">
                              last reply by {lastReplyBy} {lastReplyDate}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </>
                  )}
                </ListItem>
              )}
            />
          );
        })}
      </List>
    </Paper>
  );
};

export default ListOfAllThreads;