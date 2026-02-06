import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, List, ListItem, Paper, useMediaQuery, useTheme, CircularProgress, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthWrapper from '../../../components/auth/AuthWrapper';
import { useAuth0 } from '@auth0/auth0-react';
import ActiveTags from './ActiveTags';
import { useApi } from '../../../hooks/useApi';

const ListOfAllThreads = ({ posts, pagination, onPageChange }) => {
  console.log("ListOfAllThreads received posts:", posts?.length);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const TAG_LIMIT = isMobile ? 1 : 2;
  const { callApi } = useApi();
  const [readStatus, setReadStatus] = useState({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

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
    if (!readStatus[post.id]) return true;
    
    const threadTimestamp = new Date(post.created_at);
    const lastReplyTimestamp = post.last_reply_at ? new Date(post.last_reply_at) : null;
    const latestActivity = lastReplyTimestamp && lastReplyTimestamp > threadTimestamp 
      ? lastReplyTimestamp : threadTimestamp;
    
    const lastReadAt = new Date(readStatus[post.id]);
    return latestActivity > lastReadAt;
  };

  const formatDate = (rawDate) => {
    const postDate = new Date(rawDate);
    if (isNaN(postDate.valueOf())) {
      return rawDate;
    }
  
    const now = new Date();
    const diff = now - postDate;
    const days = diff / (1000 * 60 * 60 * 24);
  
    if (days < 1) {
      if (postDate.getDate() === now.getDate()) {
        return `Today at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Yesterday at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (days < 7) {
      return `${postDate.toLocaleDateString([], { weekday: 'long' })} at ${postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return postDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleThreadClick = async (post) => {
    if (isAuthenticated) {
      try {
        await callApi(`/api/posts/${post.id}/read`, {
          method: 'POST'
        });
        
        setReadStatus(prev => ({
          ...prev,
          [post.id]: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error marking thread as read:', error);
      }
      navigate(`/chat/${post.id}`);
    }
    // No else clause needed - AuthWrapper will handle showing the login modal
  };

  if (isLoadingStatus && posts?.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!posts || !Array.isArray(posts)) {
    console.error("Posts is not an array:", posts);
    return <Box>No posts available</Box>;
  }

  return (
    <>
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <List sx={{ p: 0 }}>
          {posts.map((post) => {
            const replyCount = post.reply_count || 0;
            const isImported = post.is_imported === true;
            const hasReplies = replyCount > 0 && post.last_reply_at;
            const unread = isThreadUnread(post);
            const authorName = isImported ? post.imported_author_name : post.author;
            const dateDisplay = formatDate(post.created_at);
            const lastReplyBy = post.last_reply_by || '';
            const lastReplyDate = post.last_reply_at ? formatDate(post.last_reply_at) : '';
            const avatarSrc = isImported ? post.avatar_url : post.avatar_url;
            
            return (
              <AuthWrapper
                key={post.id}
                mode="modal"
                authMessage="Please log in to view thread details"
              >
                <ListItem
                  onClick={() => handleThreadClick(post)}
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
                  {isMobile ? (
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        alignItems: 'center',
                        gap: 1,
                        mb: 1
                      }}>
                        <Avatar 
                          src={avatarSrc} 
                          sx={{ width: 40, height: 40 }}
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
                      <Box sx={{ width: '100%', pl: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                          </Typography>
                          {post.tags && post.tags.length > 0 && (
                            <Box>
                              <ActiveTags tags={post.tags.slice(0, TAG_LIMIT)} small />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <>
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
                          sx={{ width: 50, height: 50 }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
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
                          {post.tags && post.tags.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 0.5 }}>
                              <ActiveTags tags={post.tags.slice(0, TAG_LIMIT)} small />
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
              </AuthWrapper>
            );
          })}
        </List>
      </Paper>

      {pagination && pagination.pages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={pagination.pages ?? 1} 
            page={pagination.page ?? 1} 
            onChange={onPageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}
    </>
  );
};

export default ListOfAllThreads;