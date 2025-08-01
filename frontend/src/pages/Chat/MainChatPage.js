// This is /chat, which holds PostList (the lists of threads)

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
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  FilterList as FilterIcon, 
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import CreatePost from './Components/CreatePost';
import ListOfAllThreads from './Components/ListOfAllThreads';
import AuthWrapper from '../../components/auth/AuthWrapper';
import palette from '../../styles/colors/palette';

const ForumContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Check if apiUrl is defined
        if (!apiUrl) {
          console.warn('API URL is undefined');
          return;
        }
        
        const response = await fetch(`${apiUrl}/tags`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Set empty tags array to prevent further errors
        setTags([]);
      }
    };
    fetchTags();
  }, [apiUrl]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 Add this line here


        let url = `${apiUrl}/posts`;
        
        // Add page and limit parameters
        const queryParams = new URLSearchParams();
        if (selectedTags.length > 0) {
          queryParams.append('tags', selectedTags.join(','));
        }
        queryParams.append('page', (pagination.page ?? 1).toString());
        queryParams.append('limit', (pagination.limit ?? 20).toString());
        
        url = `${url}?${queryParams.toString()}`;
        
        console.log('Fetching posts from URL:', url);
        const response = await fetch(url); 
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Handle the response format correctly
        if (data && Array.isArray(data.posts)) {
          console.log("Setting posts from data.posts:", data.posts.length);
          setPosts(data.posts);
          setPagination(prev => ({
            ...prev,
            ...data.pagination
          }));
        } else {
          console.warn("Unexpected response format from /posts:", data);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [apiUrl, selectedTags, pagination.page, pagination.limit]);

  const handlePageChange = (event, newPage) => {
    console.log("Page clicked:", newPage);
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

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
    <Container maxWidth="lg" sx={{ py: isMobile ? 0 : 0, px: isMobile ? 1 : 2 }}>
      
      {/* Header with Latest Posts and Buttons */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          mt: { xs: 0, sm: 0 } 
        }}
      >
        {/* Left-aligned "LATEST POSTS" */}
        <Typography 
          variant={isMobile ? "h5" : "h3"} 
          sx={{ color: 'text.primary' }}
        >
          LATEST POSTS
        </Typography>
  
        {/* Right-aligned buttons - only visible when authenticated */}
          <Stack direction="row" spacing={2}>
            {isMobile ? (
              <IconButton
                size="small"
                color={showFilters ? "primary" : "default"}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ border: 1, borderColor: 'divider', color: palette.primary.main }}
              >
                <FilterIcon />
              </IconButton>
            ) : (
              <Button 
                variant="white" 
                size="small"
                startIcon={<FilterIcon />} 
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter by tags
              </Button>
            )}
    
          <AuthWrapper 
            mode="modal"
            authMessage="Please log in to create a new thread"
          >
            {isMobile ? (
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsModalOpen(true);
                  }
                  // If not authenticated, the AuthWrapper will handle showing the login modal
                }}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <AddIcon />
              </IconButton>
            ) : (
              <Button 
                variant="contained" 
                size="small"
                startIcon={<AddIcon />} 
                onClick={() => {
                  if (isAuthenticated) {
                    setIsModalOpen(true);
                  }
                  // If not authenticated, the AuthWrapper will handle showing the login modal
                }}
              >
                Start a new thread
              </Button>
            )}
          </AuthWrapper>
          </Stack>
        
      </Box>
  
      {/* Create Post Modal */}
      <Dialog 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : '8px' }
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
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <CreatePost 
            onPostCreated={handlePostCreated}
            tags={tags}
            setTags={setTags}
          />
        </Box>
      </Dialog>
  
      {/* Tag filters - only visible when authenticated and showFilters is true */}
        <Collapse in={showFilters}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: isMobile ? 1 : 2, 
              mb: { xs: 3, sm: 4 }, 
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
              {Array.isArray(tags) && tags.length > 0 ? (
                tags.map(tag => (
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
                      transition: 'none'
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No tags available</Typography>
              )}
            </Stack>
          </Paper>
        </Collapse>
    
  
      {/* Post List with Auth Content Overlay */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length > 0 ? (
        <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: '8px' }}>
            <ListOfAllThreads 
              posts={posts} 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
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