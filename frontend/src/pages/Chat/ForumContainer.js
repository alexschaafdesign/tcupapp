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
  Stack,
  Collapse,
  Divider,
  Badge,
  Card,
  CardContent
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Close as CloseIcon, 
  History as HistoryIcon,
  FilterList as FilterIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import CreatePost from './Components/CreatePost';
import PostList from './Components/PostList';

export const ForumContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
      
      {/* Create Post Trigger */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider'
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <EditIcon sx={{ mr: 2, color: 'text.secondary' }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Start a new thread..."
          InputProps={{ 
            disableUnderline: true,
            readOnly: true,
            sx: { fontSize: '1rem' }
          }}
          sx={{ mr: 2 }}
        />
       
      </Paper>

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
            <CloseIcon  />
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
      
      {/* Collapsible Tag Filter */}
            
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mb: 2 // some spacing below
        }}
      >
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<FilterIcon />} 
          onClick={() => setShowFilters(!showFilters)}
        >
          Filter by tags
        </Button>
      </Box>

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
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {tags.map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                onClick={() => handleTagClick(tag.id)}
                color={selectedTags.includes(tag.id) ? "primary" : "default"}
                variant={selectedTags.includes(tag.id) ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Paper>
      </Collapse>

      

      {/* Post List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          {/* This assumes your PostList component renders the posts.
             If you want to enhance that component directly, you'll need to modify it separately */}
          <PostList posts={posts} />
          
         
        </Box>
      )}
    </Container>
  );
};

export default ForumContainer;