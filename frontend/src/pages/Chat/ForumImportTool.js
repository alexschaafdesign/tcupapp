import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Card, 
  CardContent,
  Divider,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const ForumImportTool = () => {
  const [inputText, setInputText] = useState('');
  const [threadTitle, setThreadTitle] = useState('');
  const [parsedPosts, setParsedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const theme = useTheme();

  // Improved parser that better handles the forum format
  const handlePreview = () => {
    setLoading(true);
    try {
      const lines = inputText.split('\n');
      const posts = [];
      let currentPost = null;
      let nextLineIsDate = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines when not in a post
        if (!currentPost && line === '') continue;
        
        // Start of a new post - looking for username on its own line
        if (!currentPost && line && !nextLineIsDate) {
          currentPost = {
            author: line,
            date: '',
            content: []
          };
          nextLineIsDate = true;
          continue;
        }
        
        // The next line after username should be a date
        if (currentPost && nextLineIsDate && line) {
          currentPost.date = line;
          nextLineIsDate = false;
          continue;
        }
        
        // If we're in a post and hit an empty line, check if next non-empty line could be a new username
        if (currentPost && !nextLineIsDate && line === '') {
          // Look ahead to see if we might be starting a new post
          let isNewPostStart = false;
          let j = i + 1;
          
          // Skip any additional blank lines
          while (j < lines.length && lines[j].trim() === '') {
            j++;
          }
          
          // If we found a non-empty line
          if (j < lines.length) {
            const possibleUsername = lines[j].trim();
            
            // Check if it's followed by another line (possibly a date)
            if (j + 1 < lines.length) {
              // If the potential username line is short and standalone, treat it as a new post
              if (possibleUsername.length < 30 && !possibleUsername.includes(' at ')) {
                isNewPostStart = true;
              }
            }
          }
          
          if (isNewPostStart) {
            // Finish current post and prepare for new one
            posts.push({...currentPost});
            currentPost = null;
            continue;
          }
        }
        
        // Add content line to current post if we have one
        if (currentPost && !nextLineIsDate) {
          currentPost.content.push(line);
        }
      }
      
      // Add the final post if there is one
      if (currentPost) {
        posts.push(currentPost);
      }
      
      // Process the posts (combine content lines, etc)
      const processedPosts = posts.map(post => ({
        ...post,
        content: post.content.join('\n')
      }));
      
      setParsedPosts(processedPosts);
      setPreviewMode(true);
      
      // Use the thread topic as the title if not set
      if (!threadTitle && processedPosts.length > 0) {
        const firstContentLine = processedPosts[0].content.split('\n')[0];
        setThreadTitle(firstContentLine.substring(0, 100));
      }
    } catch (error) {
      console.error('Error parsing text:', error);
      setSnackbarMessage('Error parsing text: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Import the thread to the database
  const handleImport = async () => {
    if (!parsedPosts.length) {
      setSnackbarMessage('No posts to import');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!threadTitle) {
      setSnackbarMessage('Please enter a thread title');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Create thread first
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: threadTitle,
          content: parsedPosts[0].content,
          is_imported: true,
          imported_author_name: parsedPosts[0].author,
          imported_date: parsedPosts[0].date,
          tags: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create thread');
      }
      
      const threadData = await response.json();
      const threadId = threadData.id;
      
      // Add all replies
      for (let i = 1; i < parsedPosts.length; i++) {
        const reply = parsedPosts[i];
        const replyResponse = await fetch(`${process.env.REACT_APP_API_URL}/posts/${threadId}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: reply.content,
            is_imported: true,
            imported_author_name: reply.author,
            imported_date: reply.date
          })
        });
        
        if (!replyResponse.ok) {
          const errorData = await replyResponse.json();
          throw new Error(errorData.error || `Failed to add reply ${i}`);
        }
      }
      
      setSnackbarMessage('Thread imported successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Reset form after a delay and navigate to the new thread
      setTimeout(() => {
        navigate(`/thread/${threadId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error importing thread:', error);
      setSnackbarMessage('Error importing thread: ' + error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset everything
  const handleReset = () => {
    setInputText('');
    setThreadTitle('');
    setParsedPosts([]);
    setPreviewMode(false);
  };
  
  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Import Forum Content
      </Typography>
      
      <Typography variant="body1" paragraph>
        Paste formatted text from the old platform to import as a threaded conversation.
        Each post should follow this format:
      </Typography>
      
      <Box 
        component="pre" 
        sx={{ 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 1, 
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          fontSize: '0.85rem',
          mb: 3
        }}
      >
        {`username

date/time

content line 1
content line 2
content line 3

another_username

another date/time

reply content...`}
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        {!previewMode ? (
          <>
            <TextField
              label="Paste Forum Text"
              multiline
              rows={12}
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              margin="normal"
              placeholder="Paste the formatted forum text here..."
              disabled={loading}
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={handlePreview}
                disabled={!inputText || loading}
              >
                Preview Posts
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
              
              {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </>
        ) : (
          <>
            <TextField
              label="Thread Title"
              fullWidth
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              margin="normal"
              disabled={loading}
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Preview: {parsedPosts.length} posts detected
            </Typography>
            
            {parsedPosts.map((post, index) => (
              <Card key={index} sx={{ mb: 2, borderLeft: index === 0 ? `4px solid ${theme.palette.primary.main}` : '2px solid gray' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {post.author} {index === 0 && '(Thread Starter)'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.date}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {post.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleImport}
                disabled={loading || !parsedPosts.length || !threadTitle}
              >
                Import Thread
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={() => setPreviewMode(false)}
                disabled={loading}
              >
                Back to Edit
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
              
              {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForumImportTool;