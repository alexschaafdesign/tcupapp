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
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { Edit as EditIcon, Close as CloseIcon, History as HistoryIcon } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import CreatePost from './Components/CreatePost';
import PostList from './Components/PostList';
import { height } from '@mui/system';

export const ForumContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
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
        let url = `${apiUrl}/posts`;
        if (selectedTags.length > 0) {
          url += `?tags=${selectedTags.join(',')}`;
        }
        const response = await fetch(url); 
        const data = await response.json();
        console.log('Posts response:', data); // Add in fetchPosts after json()
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [apiUrl, selectedTags]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
  };

  const handleTagClick = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Tag Filter */}
      <Paper sx={{ p: 2, mb: 4, }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by tags:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {tags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleTagClick(tag.id)}
              color={selectedTags.includes(tag.id) ? "primary" : "default"}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Create Post Trigger */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2, 
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
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small"
            sx={{ height: '42px' }}

          
          >
            New thread
          </Button>
          <Button 
            variant="outlined" 
            size="small" 

            startIcon={<HistoryIcon />}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/import');
            }}
            sx={{}}
          >
          </Button>
        </Stack>
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