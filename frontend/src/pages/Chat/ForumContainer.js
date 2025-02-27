import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Collapse,
  Paper,
  Chip,
  Dialog,
  IconButton
} from '@mui/material';
import { 
  FilterList as FilterIcon, 
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import CreatePost from './Components/CreatePost';
import PostList from './PostList';
import AuthContentOverlay from '../../components/auth/AuthOverlay';

export const ForumContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
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
      
      {/* Header with Latest Posts and Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}
      >
        {/* Left-aligned "LATEST POSTS" */}
        <Typography variant="h3" sx={{ color: 'text.primary' }}>
          LATEST POSTS
        </Typography>
  
        {/* Right-aligned buttons - only visible when authenticated */}
        {isAuthenticated && (
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<FilterIcon />} 
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter by tags
            </Button>
    
            <Button 
              variant="contained" 
              size="small"
              startIcon={<AddIcon />} 
              onClick={() => setIsModalOpen(true)}
            >
              Start a new thread
            </Button>
          </Stack>
        )}
      </Box>
  
      {/* Create Post Modal */}
      <Dialog 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight={500}>Create New Post</Typography>
          <IconButton onClick={() => setIsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          <CreatePost 
            onPostCreated={handlePostCreated}
            tags={tags}
            setTags={setTags}
          />
        </Box>
      </Dialog>
  
      {/* Tag filters - only visible when authenticated */}
      {isAuthenticated && (
        <Collapse in={showFilters}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              mb: 4, 
              borderRadius: '8px' 
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Select tags to filter discussions:
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              sx={{ gap: 1 }}
            >            
              {tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => handleTagClick(tag.id)}
                  color={selectedTags.includes(tag.id) ? "primary" : "default"}
                  variant={selectedTags.includes(tag.id) ? "filled" : "outlined"}
                  sx={{
                    minWidth: 80,
                    height: 32,
                    borderWidth: selectedTags.includes(tag.id) ? 2 : 1,
                    transition: 'none',
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Collapse>
      )}
  
      {/* Post List with Auth Content Overlay */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length > 0 ? (
        <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
          <AuthContentOverlay>
            <PostList posts={posts} />
          </AuthContentOverlay>
        </Box>
      ) : (
        <Box sx={{ mb: 4, textAlign: 'center', p: 4 }}>
          <Typography variant="body1">
            No posts available.
          </Typography>
        </Box>
      )}
      
    </Container>
  );
};

export default ForumContainer;