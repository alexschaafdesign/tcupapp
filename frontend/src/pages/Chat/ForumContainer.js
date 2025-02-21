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
      {/* Collapsible Tag Filter */}
      <Paper 
        elevation={1}
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: '8px'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: showFilters ? 2 : 0
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle1" fontWeight={500}>
              Filters
              {selectedTags.length > 0 && (
                <Badge 
                  badgeContent={selectedTags.length} 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>
          <IconButton size="small">
            {showFilters ? <CloseIcon fontSize="small" /> : <FilterIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Collapse in={showFilters}>
          <Divider sx={{ my: 1 }} />
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
                sx={{ 
                  m: 0.5,
                  borderRadius: '4px',
                  fontWeight: selectedTags.includes(tag.id) ? 500 : 400,
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </Paper>

      {/* Create Post Trigger */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2, 
          mb: 4, 
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
          placeholder="Start a new discussion..."
          InputProps={{ 
            disableUnderline: true,
            readOnly: true,
            sx: { fontSize: '1rem' }
          }}
          sx={{ mr: 2 }}
        />
        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            size="medium"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ 
              height: '42px',
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '6px',
              boxShadow: 2
            }}
          >
            New thread
          </Button>
          <Button 
            variant="outlined" 
            size="medium" 
            startIcon={<HistoryIcon />}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/import');
            }}
            sx={{
              height: '42px',
              textTransform: 'none',
              borderRadius: '6px'
            }}
          >
            History
          </Button>
        </Stack>
      </Paper>

      {/* Mobile Floating Action Button (visible on small screens) */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          display: { xs: 'block', sm: 'none' },
          zIndex: 10
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: '50%', 
            width: 56, 
            height: 56,
            boxShadow: 3
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <AddIcon />
        </Button>
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
          />
        </Box>
      </Dialog>

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
          
          {/* Alternatively, if you want to directly enhance posts here: */}
          {/* {posts.map(post => (
            <Card 
              key={post.id} 
              elevation={1}
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar src={post.avatar_url} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.author} • {new Date(post.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1}>
                    {post.tags?.map(tag => (
                      <Chip 
                        key={tag.id} 
                        label={tag.name} 
                        size="small"
                        variant="outlined" 
                        sx={{ borderRadius: '4px' }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {post.reply_count || 0} replies • {post.views || 0} views
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))} */}
        </Box>
      )}
    </Container>
  );
};

export default ForumContainer;