import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { createClient } from '@supabase/supabase-js';
import { Container, Link, Tooltip, Chip, Typography, Button, Avatar, Box, CircularProgress, Paper, IconButton, Dialog, useMediaQuery, useTheme } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  EditorState,
  ContentState,
  convertFromRaw,
  genKey,
  ContentBlock,
  Editor,
  convertToRaw,
  SelectionState
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useSearchParams } from 'react-router-dom';
import ReactionBar from './Components/ReactionBar';
import EditorWithFormatting from './Components/EditorWithFormatting';
import ActiveTags from './Components/ActiveTags';
import IndividualPost from './Components/IndividualPost';
import { stateToHTML } from 'draft-js-export-html';
import parse from 'html-react-parser';
import ChatImageUpload from './Components/ChatImageUpload';
import HistoricalReplyForm from './Components/HistoricalReplyForm';

const ViewSingleThread = () => {
  const { threadId } = useParams();
  const { getAccessTokenSilently, user } = useAuth0();
  const [searchParams] = useSearchParams();
  const highlightedReplyId = searchParams.get('highlight');
  const replyRef = useRef(null);
  const [threadData, setThreadData] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [postReactions, setPostReactions] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();
  const [replyEditorState, setReplyEditorState] = useState(EditorState.createEmpty());
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [replyImages, setReplyImages] = useState([]);
  const [editEditorState, setEditEditorState] = useState(null);
  const [showHistoricalForm, setShowHistoricalForm] = useState(false);


  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const replyBoxRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const canEditPost = (post) => {
    if (!user) return false;
    return post.auth0_id === user.sub || userRoles.includes('admin');
  };

  const handleHistoricalReplyCreated = (newReply) => {
    setThreadData((prev) => ({
      ...prev,
      replies: [...prev.replies, newReply]
    }));
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    
    try {
      // Parse the content and create editor state
      const contentObj = typeof post.content === 'string' 
        ? JSON.parse(post.content) 
        : post.content;
      
      const contentState = convertFromRaw(contentObj);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditEditorState(newEditorState);
    } catch (error) {
      console.error('Error initializing editor:', error);
      // Fallback to empty editor if there's an error
      setEditEditorState(EditorState.createEmpty());
    }
  };

  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

  const fetchUserRoles = async () => {
    if (!user) return;
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserRoles(userData.roles || []);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const saveEditedPost = async () => {
    try {
      if (!editingPost || !editEditorState) return;
      
      console.log("Saving edited post:", editingPost.id);
      
      const token = await getAccessTokenSilently();
      const contentState = editEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      const endpoint = `${apiUrl}/posts/edit/${editingPost.id}`;
      console.log("Endpoint:", endpoint);
  
      // Create the request body
      const requestBody = {
        content: rawContent,
        images: editingPost.images || [],
        userId: user.sub,
        title: editingPost.title // Add original title if it exists
      };
      
      console.log("Request body:", requestBody);
  
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update post: ${response.status} ${errorText}`);
      }
      
      // Close modal and refresh data
      setEditingPost(null);
      setEditEditorState(null);
      fetchThread();
    } catch (error) {
      console.error('Error saving edited post:', error);
    }
  };

  useEffect(() => {
    if (user && threadId) {
      markThreadAsRead();
    }
  }, [threadId, user]);
  
  // Add this function to your component's functions
  const markThreadAsRead = async () => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${apiUrl}/read-status/${threadId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };
  
  useEffect(() => {
    if (highlightedReplyId) {
      setTimeout(() => {
        if (replyRef.current) {
          console.log("Scrolling to highlighted element", replyRef.current);
          replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.log("No element found with the highlighted id");
        }
      }, 500);
    }
  }, [highlightedReplyId, threadData]);

  // Fetch the thread data
  const fetchThread = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/posts/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setThreadData(data);
  
      // Fetch reactions from Supabase
      const { data: reactions, error } = await supabase
        .from('user_reactions')
        .select('post_id, user_id, type');
  
      if (error) throw error;
  
      // Extract unique auth0_id values
      const uniqueAuth0Ids = [...new Set(reactions.map((r) => r.user_id))];
  
      let users = [];
      if (uniqueAuth0Ids.length > 0) {
        // Fetch usernames from PostgreSQL backend API
        const userResponse = await fetch(`${apiUrl}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const allUsers = await userResponse.json();
        console.log("Fetched all users from PostgreSQL:", allUsers);
  
        // Filter only the users who reacted
        users = allUsers.filter((user) => uniqueAuth0Ids.includes(user.auth0_id));
      }
  
      // Map reactions to usernames
      const reactionsByPost = {};
      reactions.forEach((reaction) => {
        const user = users.find((u) => u.auth0_id === reaction.user_id);
        if (user) {
          if (!reactionsByPost[reaction.post_id]) reactionsByPost[reaction.post_id] = [];
          // Ensure no duplicate users in the reactions list
          if (!reactionsByPost[reaction.post_id].some(r => r.id === user.auth0_id)) {
            reactionsByPost[reaction.post_id].push({ id: user.auth0_id, username: user.username });
          }
        }
      });
  
      console.log("Mapped reactions:", reactionsByPost);
  
      setPostReactions(reactionsByPost);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
    fetchUserRoles();
  }, [threadId, getAccessTokenSilently, apiUrl, user]);

  // Safely render post content (including quotes)
  const renderContent = (content) => {
    try {
      // Parse the content
      const contentObj = typeof content === 'string' ? JSON.parse(content) : content;
      const contentState = convertFromRaw(contentObj);
      const plainText = contentState.getPlainText();
  
      // HTML options for stateToHTML conversion
      const exportOptions = {
        entityStyleFn: (entity) => {
          const entityType = entity.get('type').toLowerCase();
          if (entityType === 'link') {
            const data = entity.getData();
            return {
              element: 'a',
              attributes: {
                href: data.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'post-link'
              }
            };
          }
        }
      };
  
      // Handle quotes
      if (plainText.includes('[QUOTE="') && plainText.includes('[/QUOTE]')) {
        const parts = [];
        const quoteRegex = /\[QUOTE="([^"]+)"\]([\s\S]*?)\[\/QUOTE\]/g;
        let match;
        let lastIndex = 0;
  
        while ((match = quoteRegex.exec(plainText)) !== null) {
          // Add text before the quote
          if (match.index > lastIndex) {
            const beforeText = plainText.substring(lastIndex, match.index);
            // For text parts, we'll convert that portion to HTML
            const textBlocks = beforeText.split('\n').map((line, i) => 
              `<p key="line-${i}">${line}</p>`
            ).join('');
            
            parts.push(
              <Box key={`text-${lastIndex}`} sx={{ my: 1 }}>
                {parse(textBlocks)}
              </Box>
            );
          }
  
          // Add the quote
          const author = match[1];
          const quoteText = match[2].trim();
          parts.push(
            <Paper
              key={`quote-${match.index}`}
              elevation={0}
              sx={{
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                bgcolor: 'rgba(0,0,0,0.05)',
                p: 2,
                my: 2,
                maxWidth: '100%',
              }}
            >
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                {author} wrote:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {quoteText}
              </Typography>
            </Paper>
          );
  
          lastIndex = match.index + match[0].length;
        }
  
        // Add text after the last quote
        if (lastIndex < plainText.length) {
          const afterText = plainText.substring(lastIndex);
          const textBlocks = afterText.split('\n').map((line, i) => 
            `<p key="line-${i}">${line}</p>`
          ).join('');
          
          parts.push(
            <Box key={`text-${lastIndex}`} sx={{ my: 1 }}>
              {parse(textBlocks)}
            </Box>
          );
        }
  
        return <Box sx={{ mt: 1 }}>{parts}</Box>;
      }
      
      // For non-quoted content, convert to HTML with preserved links
      const html = stateToHTML(contentState, exportOptions);
      
      return (
        <Box 
          sx={{ 
            mt: 1,
            // Style links in the content
            '& a.post-link': {
              color: 'primary.main',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none'
              }
            },
            // Preserve paragraph spacing
            '& p': {
              my: 1
            }
          }}
        >
          {parse(html)}
        </Box>
      );
    } catch (error) {
      console.error('Error rendering content:', error);
      // Fallback for plain text or parsing errors
      return (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', my: 1 }}>
          {typeof content === 'string' ? content : JSON.stringify(content)}
        </Typography>
      );
    }
  };

  const handleLikeClick = async (postId) => {
    if (!user) return;
  
    const userAuth0Id = user.sub;
    const hasLiked = postReactions[postId]?.some((reaction) => reaction.id === userAuth0Id);
  
    console.log(`User ${userAuth0Id} clicked like. Has liked?`, hasLiked);
  
    if (hasLiked) {
      // Unlike (DELETE reaction)
      const { error: deleteError } = await supabase
        .from("user_reactions")
        .delete()
        .match({ post_id: postId, type: "love", user_id: userAuth0Id });
  
      if (!deleteError) {
        setPostReactions((prev) => ({
          ...prev,
          [postId]: prev[postId].filter((reaction) => reaction.id !== userAuth0Id),
        }));
      }
    } else {
      // Like (INSERT new reaction)
      const { error: insertError } = await supabase
        .from("user_reactions")
        .insert([{ post_id: postId, type: "love", user_id: userAuth0Id }]);
  
      if (!insertError) {
        setPostReactions((prev) => {
          // Get the username from the user object
          const username = user.name || user.nickname || 'User';
          return {
            ...prev,
            [postId]: [...(prev[postId] || []), { id: userAuth0Id, username }],
          };
        });
      }
    }
  };

  const handleReplyClick = (reply) => {
    setReplyingTo(reply);
  
    // Extract clean text without nested quotes
    let cleanText = '';
    try {
      const parsed = JSON.parse(reply.content);
      const contentState = convertFromRaw(parsed);
      cleanText = contentState
        .getPlainText()
        .replace(/\[QUOTE=".*?"\].*?\[\/QUOTE\]/gs, '')
        .trim();
    } catch (e) {
      cleanText = reply.content || '';
    }
  
    // Create blocks: Quote block, spacing block, and empty cursor block
    const quoteBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: `[QUOTE="${reply.username}"]${cleanText}[/QUOTE]`,
    });
  
    const spacingBlock = new ContentBlock({ key: genKey(), type: 'unstyled', text: '' });
    const emptyBlock = new ContentBlock({ key: genKey(), type: 'unstyled', text: '' });
  
    // Build ContentState and EditorState
    const newContentState = ContentState.createFromBlockArray([quoteBlock, spacingBlock, emptyBlock]);
    let newEditorState = EditorState.createWithContent(newContentState);
  
    // Position cursor in empty block
    const blockArray = newContentState.getBlocksAsArray();
    const emptyBlockKey = blockArray[2].getKey();
  
    const selection = new SelectionState({
      anchorKey: emptyBlockKey,
      anchorOffset: 0,
      focusKey: emptyBlockKey,
      focusOffset: 0,
      isBackward: false,
      hasFocus: true,
    });
  
    newEditorState = EditorState.forceSelection(newEditorState, selection);
  
    // Update state and trigger focus
    setReplyEditorState(newEditorState);
    setFocusTrigger(Date.now());
  
    // Scroll to reply box
    setTimeout(() => {
      replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReply = async (parentId = null) => {
    try {
      const token = await getAccessTokenSilently();
      const contentState = replyEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
  
      const response = await fetch(`${apiUrl}/posts/${threadId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: rawContent,
          parent_id: parentId || (replyingTo?.id || null),
          images: replyImages
        }),
      });
  
      const newReply = await response.json();
      setThreadData((prev) => ({
        ...prev,
        replies: [...prev.replies, newReply],
      }));
  
      // Clear the reply editor and images
      setReplyEditorState(EditorState.createEmpty());
      setReplyImages([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Navigate back to the forum
  const handleBackClick = () => {
    navigate('/chat');
  };

  // Loading or not found states
  if (loading) return <CircularProgress />;
  if (!threadData?.post) return <Typography>Thread not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Mobile Back Button */}
      {isMobile && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'medium',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Back to chat
          </Button>
        </Box>
      )}
      
      {/* Thread Title + Tags */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
      </Box>
  
      {/* Thread Starter Card */}
      <IndividualPost 
        post={threadData.post}
        isThreadStarter={true}
        isHighlighted={threadData.post.id === Number(highlightedReplyId)}
        user={user}
        handleLikeClick={handleLikeClick}
        handleReplyClick={handleReplyClick}
        renderContent={renderContent}
        postReactions={postReactions}
        handleEditClick={handleEditClick}
        canEditPost={canEditPost(threadData.post)}
      />

      <ActiveTags tags={threadData.post.tags} limit={3} />
  
      {/* Reply Header */}
      {threadData.replies.length > 0 && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h5" component="h2">
            Replies ({threadData.replies.length})
          </Typography>
        </Box>
      )}
  
      {/* Render Replies */}
      {threadData.replies.map((reply) => (
        <IndividualPost 
          key={reply.id}
          post={reply}
          isReply={true}
          isThreadStarter={false}
          isHighlighted={reply.id === Number(highlightedReplyId)}
          user={user}
          handleLikeClick={handleLikeClick}
          handleReplyClick={handleReplyClick}
          renderContent={renderContent}
          postReactions={postReactions}
          highlightedReplyId={highlightedReplyId}
          handleEditClick={handleEditClick}
          canEditPost={canEditPost(reply)}
        />
      ))}
  
      {/* Reply Editor */}
      <Box ref={replyBoxRef} sx={{ mt: 3, scrollMarginTop: '64px' }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Post a Reply
          </Typography>
          <EditorWithFormatting
            editorState={replyEditorState}
            setEditorState={setReplyEditorState}
            autoFocus={replyingTo !== null}
            focusTrigger={focusTrigger}
          />
          <ChatImageUpload 
           images={replyImages} 
           setImages={setReplyImages} 
          />
        </Paper>
      </Box>
    
  
      {/* Post Reply & Historical Reply Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleReply(threadData.post.id)}
          disabled={!replyEditorState.getCurrentContent().hasText()}
        >
          Post Reply
        </Button>
      </Box>

    {/* A button only you (admin) can see to add a historical reply */}
        <Button onClick={() => setShowHistoricalForm(true)}>
          Add Historical Reply
        </Button>
      

      {/* If showHistoricalForm is true, display the HistoricalReplyForm in a modal or inline */}
      {showHistoricalForm && (
        <Paper sx={{ mt: 2 }}>
          <HistoricalReplyForm
            threadId={threadId}
            onReplyCreated={handleHistoricalReplyCreated}
            onClose={() => setShowHistoricalForm(false)}
          />
        </Paper>
      )}
        
  
      {/* Editing Post Modal */}
{editingPost && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}
    onClick={() => setEditingPost(null)} // Close when clicking outside
  >
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: 600, 
        maxHeight: '90vh', 
        overflow: 'auto', 
        bgcolor: 'background.paper', 
        borderRadius: 1,
        p: 3 
      }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on modal
    >
      <Typography variant="h6" gutterBottom>
        Edit Post
      </Typography>
      
      {/* Add the editor component for editing */}
      <EditorWithFormatting
        editorState={editEditorState}
        setEditorState={setEditEditorState}
      />
      
      {/* Add image management if needed */}
      {editingPost.images && (
        <ChatImageUpload 
          images={editingPost.images} 
          setImages={(newImages) => {
            setEditingPost({
              ...editingPost,
              images: newImages
            });
          }} 
        />
      )}
      
      {/* Add buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => setEditingPost(null)}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={saveEditedPost}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  </Box>
)}
    </Container>
  );
};

export default ViewSingleThread;