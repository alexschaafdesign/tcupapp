import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper,
  TextField,
  Button,
  Dialog,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import CreatePost from '../components/forum/CreatePost';
import PostList from '../components/forum/PostList';

export const ForumContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTags = async () => {
      const response = await fetch(`${apiUrl}/tags`);
      const data = await response.json();
      setTags(data);
    };
    fetchTags();
  }, [apiUrl]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiUrl}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [getAccessTokenSilently, apiUrl]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Create Post Trigger */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <EditIcon sx={{ mr: 2, color: 'text.secondary' }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Start a new discussion..."
          InputProps={{ 
            disableUnderline: true,
            readOnly: true
          }}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" size="small">
          Create Post
        </Button>
      </Paper>

      {/* Create Post Modal */}
      <Dialog 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6">Create New Post</Typography>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          <CreatePost 
            onPostCreated={handlePostCreated}
            tags={tags}
          />
        </Box>
      </Dialog>

      {/* Post List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PostList posts={posts} />
      )}
    </Container>
  );
};

export default ForumContainer;