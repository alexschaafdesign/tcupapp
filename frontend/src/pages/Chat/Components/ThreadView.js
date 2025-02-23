import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { createClient } from '@supabase/supabase-js';
import { Container, Link, Typography, Button, Avatar, Box, CircularProgress, Paper, IconButton, Dialog } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
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
import ReactionBar from './ReactionBar';
import EditHistoricalPost from './EditHistoricalPost';
import HistoricalReplyForm from './HistoricalReplyForm';
import EditorWithFormatting from './EditorWithFormatting';
import 'draft-js/dist/Draft.css';
import { useSearchParams } from 'react-router-dom';

const ThreadView = () => {
  const { threadId } = useParams();
  const { getAccessTokenSilently, user } = useAuth0();
  const [searchParams] = useSearchParams();
  const highlightedReplyId = searchParams.get('highlight');
  const replyRef = useRef(null);
  const [threadData, setThreadData] = useState(null);
  const [likedPosts, setLikedPosts] = useState({}); // Track liked state for each post
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showHistoricalReplyModal, setShowHistoricalReplyModal] = useState(false);
  const [postReactions, setPostReactions] = useState({});

  const [replyEditorState, setReplyEditorState] = useState(EditorState.createEmpty());
  const [focusTrigger, setFocusTrigger] = useState(0);

  const replyBoxRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (highlightedReplyId) {
      setTimeout(() => {
        if (replyRef.current) {
          console.log("Scrolling to highlighted element", replyRef.current);
          replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.log("No element found with the highlighted id");
        }
      }, 500); // Increase or decrease delay as needed
    }
  }, [highlightedReplyId, threadData]);

  useEffect(() => {
    console.log("highlightedReplyId:", highlightedReplyId);
  }, [highlightedReplyId]);

  // Fetch the thread data
  const fetchThread = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setThreadData(data);
  
      // ✅ Fetch reactions from Supabase (contains only user_id)
      const { data: reactions, error } = await supabase
        .from('user_reactions')
        .select('post_id, user_id, type');
  
      if (error) throw error;
  
      // ✅ Extract unique auth0_id values
      const uniqueAuth0Ids = [...new Set(reactions.map((r) => r.user_id))];
  
      let users = [];
      if (uniqueAuth0Ids.length > 0) {
        // ✅ Fetch usernames from your PostgreSQL backend API (which you already have)
        const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const allUsers = await userResponse.json();
        console.log("Fetched all users from PostgreSQL:", allUsers);
  
        // ✅ Filter only the users who reacted
        users = allUsers.filter((user) => uniqueAuth0Ids.includes(user.auth0_id));
      }
  
      // ✅ Map reactions to usernames
      const reactionsByPost = {};
      reactions.forEach((reaction) => {
        const user = users.find((u) => u.auth0_id === reaction.user_id);
        if (user) {
          if (!reactionsByPost[reaction.post_id]) reactionsByPost[reaction.post_id] = [];
          reactionsByPost[reaction.post_id].push({ id: user.auth0_id, username: user.username });
        }
      });
  
      console.log("Mapped reactions:", reactionsByPost);
  
      setPostReactions(reactionsByPost);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [threadId, getAccessTokenSilently, apiUrl]);

  // Helper to create a [QUOTE="author"] block
  const createQuoteBlock = (text, author) => {
    return `[QUOTE="${author}"]${text}[/QUOTE]\n\n`;
  };

  // Safely render post content (including quotes)
  const renderContent = (content) => {
    try {
      // Parse the content
      const contentObj = JSON.parse(content);
      const contentState = convertFromRaw(contentObj);
      const plainText = contentState.getPlainText();

      // If we detect the [QUOTE="xyz"] syntax, we render them with Paper boxes
      if (plainText.includes('[QUOTE="') && plainText.includes('[/QUOTE]')) {
        const parts = [];
        const quoteRegex = /\[QUOTE="([^"]+)"\]([\s\S]*?)\[\/QUOTE\]/g;
        let match;
        let lastIndex = 0;

        while ((match = quoteRegex.exec(plainText)) !== null) {
          // Text before the quote
          if (match.index > lastIndex) {
            parts.push(
              <Typography key={`text-${lastIndex}`} variant="body1" component="div">
                {plainText.substring(lastIndex, match.index)}
              </Typography>
            );
          }

          // The quote itself
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
              <Typography variant="body2">{quoteText}</Typography>
            </Paper>
          );

          lastIndex = match.index + match[0].length;
        }

        // Text after the last quote
        if (lastIndex < plainText.length) {
          parts.push(
            <Typography key={`text-${lastIndex}`} variant="body1" component="div">
              {plainText.substring(lastIndex)}
            </Typography>
          );
        }

        return <Box>{parts}</Box>;
      }

      // Otherwise, no quotes. Render the raw content as a readOnly Editor
      const editorState = EditorState.createWithContent(contentState);
      return (
        <Box>
          <Editor editorState={editorState} onChange={() => {}} readOnly />
        </Box>
      );
    } catch (error) {
      // If parse fails, just render as plain text
      return <Typography variant="body1">{content}</Typography>;
    }
  };

  const handleLikeClick = async (postId) => {
    if (!user) return;
  
    const userAuth0Id = user.sub; // Auth0 ID of the logged-in user
    const hasLiked = postReactions[postId]?.some((reaction) => reaction.id === userAuth0Id);
  
    console.log(`User ${userAuth0Id} clicked like. Has liked?`, hasLiked); // Debugging
  
    if (hasLiked) {
      // ✅ Unlike (DELETE reaction)
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
      // ✅ Like (INSERT new reaction)
      const { error: insertError } = await supabase
        .from("user_reactions")
        .insert([{ post_id: postId, type: "love", user_id: userAuth0Id }]);
  
      if (!insertError) {
        setPostReactions((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), { id: userAuth0Id, username: user.name }],
        }));
      }
    }
  };

  /**
   * handleReplyClick: triggered when user clicks "Reply" on a post.
   * Insert a [QUOTE="username"] block into the editor and scroll to it.
   */
  const handleReplyClick = (reply) => {
    setReplyingTo(reply);
  
    // 1️⃣ Extract clean text without nested quotes
    let cleanText = '';
    try {
      const parsed = JSON.parse(reply.content);
      const contentState = convertFromRaw(parsed);
      cleanText = contentState
        .getPlainText()
        .replace(/\[QUOTE=".*?"\].*?\[\/QUOTE\]/gs, '') // ✅ Remove nested quotes
        .trim();
    } catch (e) {
      cleanText = reply.content || '';
    }
  
    // 2️⃣ Create blocks: One for the quote, one for spacing, and one empty block for the cursor
    const quoteBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: `[QUOTE="${reply.username}"]${cleanText}[/QUOTE]`,
    });
  
    const spacingBlock = new ContentBlock({ key: genKey(), type: 'unstyled', text: '' }); // ✅ Empty line for spacing
  
    const emptyBlock = new ContentBlock({ key: genKey(), type: 'unstyled', text: '' }); // ✅ Active cursor starts here
  
    // 3️⃣ Build a new ContentState from these blocks
    const newContentState = ContentState.createFromBlockArray([quoteBlock, spacingBlock, emptyBlock]);
  
    // 4️⃣ Build an EditorState from that content
    let newEditorState = EditorState.createWithContent(newContentState);
  
    // 5️⃣ Force the cursor to be in the empty block
    const blockArray = newContentState.getBlocksAsArray();
    const emptyBlockKey = blockArray[2].getKey(); // ✅ Cursor lands on the last block
  
    const selection = new SelectionState({
      anchorKey: emptyBlockKey,
      anchorOffset: 0,
      focusKey: emptyBlockKey,
      focusOffset: 0,
      isBackward: false,
      hasFocus: true,
    });
  
    newEditorState = EditorState.forceSelection(newEditorState, selection);
  
    // 6️⃣ Apply new editor state & trigger focus
    setReplyEditorState(newEditorState);
    setFocusTrigger(Date.now());
  
    // 7️⃣ Optional: Small delay before scrolling to ensure smooth UI update
    setTimeout(() => {
      replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /**
   * handleReply: post the new reply to the server.
   */
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
        }),
      });

      const newReply = await response.json();
      setThreadData((prev) => ({
        ...prev,
        replies: [...prev.replies, newReply],
      }));

      // Clear the reply editor
      setReplyEditorState(EditorState.createEmpty());
      setReplyingTo(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Renders the top line (title, date, post ID, etc.)
  const renderPostHeader = (post, isReply) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Box>
        {!isReply && (
          <Typography variant="h3" sx={{ mb: 1 }}>
            {post.title}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {new Date(post.created_at).toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
        <IconButton size="small" onClick={() => setEditingPost(post)} sx={{ padding: 0.5 }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          #{post.id}
        </Typography>
      </Box>
    </Box>
  );

  // Renders a single post or reply
  const renderPost = (post, isReply = false) => {
    const userAuth0Id = user?.sub; // Auth0 ID of logged-in user
    const likedUsers = postReactions[post.id] || [];
    const userHasLiked = likedUsers.some(reaction => reaction.id === userAuth0Id); // ✅ Fix the flipped logic
    const isHighlighted = post.id === Number(highlightedReplyId);
    if (isHighlighted) {
      console.log("Highlighting post:", post.id);
    }

    return (
      <Paper
      ref={isHighlighted ? replyRef : null} // Attach ref if this post is highlighted
      elevation={0}
      sx={{
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        backgroundColor: isHighlighted ? 'rgba(124, 96, 221, 0.1)' : (isReply ? 'background.default' : 'background.paper'),

        transition: 'background-color 0.3s ease',
        scrollMarginTop: '100px', // Adjust based on your header height
      }}
    >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            bgcolor: isReply ? 'background.default' : 'background.paper',
            minHeight: 120,
          }}
        >
          {/* Left Side: Avatar + Username */}
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 160,
              bgcolor: 'grey.100',
              p: 1,
              borderRadius: '8px 0 0 8px',
              borderRight: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              minHeight: 120,
            }}
          >
            <Avatar
              src={post.avatar_url}
              alt={post.username}
              sx={{ width: 60, height: 60 }}
            />
            <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 600, mt: 1, wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', display: 'block' }}>
              {post.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              TCUP Member
            </Typography>
          </Box>
  
          {/* ✅ Main Content Area - Adjusted for Better Spacing */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',  // ✅ Ensure text starts at the top
            minHeight: 120,
          }}>
            
            {/* ✅ Top Row: Timestamp (Top Right) */}
            {/* ✅ Move timestamp to the top left */}
            <Box sx={{ width: '100%', borderBottom: '1px solid', borderColor: 'divider', mb: 1, position: 'relative', top: '-6px' }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.created_at).toLocaleString()}
              </Typography>
            </Box>

            {/* ✅ Post Content (Below Timestamp) */}
            <Box sx={{ 
              mt: 0.5, 
              width: '100%', 
              wordBreak: 'break-word', 
              overflowWrap: 'anywhere', 
            }}> 
              {renderContent(post.content)}
            </Box>
  
            {/* ✅ Bottom Row: Like/Reply (Left), "Liked by..." (Right) */}
            {/* Bottom Row: Always push Like/Reply to the right */}
            <Box 
              sx={{ 
                pt: 1, 
                mt: 'auto', 
                display: 'flex', 
                justifyContent: 'space-between', // ✅ Always separate content
                alignItems: 'center', 
                width: '100%' 
              }}
            >
              {/* Liked by Section */}
              <Box sx={{ flexGrow: 1 }}>
                {likedUsers.length > 0 && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Liked by{" "}
                    {likedUsers.slice(0, 2).map((user, index) => (
                      <React.Fragment key={user.id}>
                        <Link
                          to={`/profile/${user.id}`}
                          style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
                        >
                          {user.username}
                        </Link>
                        {index < likedUsers.length - 1 ? (index === likedUsers.length - 2 ? " and " : ", ") : ""}
                      </React.Fragment>
                    ))}
                    {likedUsers.length > 2 && <> and {likedUsers.length - 2} others</>}
                  </Typography>
                )}
              </Box>

              {/* ✅ Always keep Like/Reply on the right */}
              <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography 
                variant="caption"
                sx={{
                  cursor: 'pointer',
                  fontWeight: userHasLiked ? 'bold' : 'normal',  // ✅ Bold when liked
                  color: userHasLiked ? '#2E7D32' : 'primary.main',  // ✅ Green when liked, Purple otherwise
                  transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',  // ✅ Smooth transition
                  '&:hover': { textDecoration: 'underline' },
                  width: '45px',  // ✅ Forces fixed width to match both "Like" & "Liked"
                  display: 'inline-block', // ✅ Keeps layout consistent
                  textAlign: 'center',
                  whiteSpace: 'nowrap', // ✅ Ensures no unintended wrapping
                }}
                onClick={() => handleLikeClick(post.id)}
              >
                {userHasLiked ? 'Liked' : 'Like'}
              </Typography>
                <Typography 
                  variant="caption" 
                  color="primary" 
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleReplyClick(post)}
                >
                  Reply
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Loading or not found states
  if (loading) return <CircularProgress />;
  if (!threadData?.post) return <Typography>Thread not found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
    {/* Thread Title */}
    <Typography variant="h3" sx={{ mb: 2, fontWeight: '400' }}>
      {threadData.post.title}
    </Typography>

      {/* Original Post */}
      {renderPost(threadData.post)}

      {/* Replies */}
      {threadData.replies.map((reply) => (
        <Box key={reply.id}>
          {renderPost(reply, true)}
        </Box>
      ))}

      {/* Reply Editor */}
      <Box
        ref={replyBoxRef}
        sx={{
          mt: 3,
          // If you have a 64px-high sticky header, this ensures we don't scroll behind it
          scrollMarginTop: '64px',
        }}
      >
        <EditorWithFormatting
          editorState={replyEditorState}
          setEditorState={setReplyEditorState}
          autoFocus={replyingTo !== null}
          focusTrigger={focusTrigger}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => handleReply(threadData.post.id)}
          disabled={!replyEditorState.getCurrentContent().hasText()}
        >
          Post Reply
        </Button>
        <Button variant="outlined" onClick={() => setShowHistoricalReplyModal(true)}>
          Add Historical Reply
        </Button>
      </Box>

      {/* Historical Reply Dialog */}
      {showHistoricalReplyModal && (
        <Dialog
          open
          onClose={() => setShowHistoricalReplyModal(false)}
          maxWidth="md"
          fullWidth
        >
          <HistoricalReplyForm
            threadId={threadId}
            onReplyCreated={(reply) => {
              setThreadData((prev) => ({
                ...prev,
                replies: [...prev.replies, reply],
              }));
              setShowHistoricalReplyModal(false);
            }}
            onClose={() => setShowHistoricalReplyModal(false)}
          />
        </Dialog>
      )}

      {/* Editing Post Overlay */}
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
        >
          <Box
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <EditHistoricalPost
              postId={editingPost.id}
              onClose={() => {
                setEditingPost(null);
                fetchThread();
              }}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ThreadView;