import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Typography, Button, Avatar, Box, CircularProgress, Paper, IconButton, Dialog } from '@mui/material';
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

const ThreadView = () => {
  const { threadId } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  const [threadData, setThreadData] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showHistoricalReplyModal, setShowHistoricalReplyModal] = useState(false);

  const [replyEditorState, setReplyEditorState] = useState(EditorState.createEmpty());
  const [focusTrigger, setFocusTrigger] = useState(0);

  const replyBoxRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch the thread data
  const fetchThread = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/posts/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setThreadData(data);
    } catch (error) {
      console.error('Error:', error);
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

  /**
   * handleReplyClick: triggered when user clicks "Reply" on a post.
   * Insert a [QUOTE="username"] block into the editor and scroll to it.
   */
  const handleReplyClick = (reply) => {
    // 1) We’re replying to this post
    setReplyingTo(reply);
  
    // 2) Extract text without nested quotes
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
  
    // 3) Create two blocks: one with the quote, one completely empty
    const quoteBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: `[QUOTE="${reply.username}"]${cleanText}[/QUOTE]`,
    });
    const emptyBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: '',
    });
  
    // 4) Build a new ContentState from those two blocks
    const newContentState = ContentState.createFromBlockArray([quoteBlock, emptyBlock]);
  
    // 5) Build an EditorState from that content
    let newEditorState = EditorState.createWithContent(newContentState);
  
    // 6) Force the cursor to be in the empty block (the second block)
    const blockArray = newContentState.getBlocksAsArray();
    const emptyBlockKey = blockArray[1].getKey();
  
    const selection = new SelectionState({
      anchorKey: emptyBlockKey,
      anchorOffset: 0,
      focusKey: emptyBlockKey,
      focusOffset: 0,
      isBackward: false,
      hasFocus: true,
    });
  
    // 7) Apply that forced selection
    newEditorState = EditorState.forceSelection(newEditorState, selection);
  
    // 8) Put this EditorState into our component & trigger focus
    setReplyEditorState(newEditorState);
    setFocusTrigger(Date.now());
  
    // 9) Optional small delay so the DOM can update before scrolling
    setTimeout(() => {
      replyBoxRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
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
  const renderPost = (post, isReply = false) => (
    <Paper
      elevation={0}
      sx={{
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          bgcolor: isReply ? 'background.default' : 'background.paper',
        }}
      >
        <Box sx={{ width: 100, flexShrink: 0 }}>
          <Avatar
            src={post.avatar_url}
            alt={post.username}
            sx={{ mb: 1, width: 48, height: 48 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {post.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            TCUP Member
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {renderPostHeader(post, isReply)}
          {renderContent(post.content)}
          <Box sx={{ mt: 2 }}>
            <ReactionBar
              postId={post.id}
              postAuthor={post.username}
              onReplyClick={() => handleReplyClick(post)}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  // Loading or not found states
  if (loading) return <CircularProgress />;
  if (!threadData?.post) return <Typography>Thread not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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