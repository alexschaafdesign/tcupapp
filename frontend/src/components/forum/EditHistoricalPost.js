import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Typography, TextField, Button, Select, MenuItem, Chip } from '@mui/material';

const EditHistoricalPost = ({ postId, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    selectedUserId: '',
    createdAt: '',
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();
        
        // Fetch users
        const usersResponse = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch available tags
        const tagsResponse = await fetch(`${process.env.REACT_APP_API_URL}/tags`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData);

        // Fetch post data
        const postResponse = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { post } = await postResponse.json();

        setFormData({
          title: post.title || '',
          content: post.content,
          selectedUserId: post.auth0_id,
          createdAt: new Date(post.created_at).toISOString().slice(0, 16),
          tags: post.tags?.map(tag => tag.id) || [],
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Error loading post data');
        setIsLoading(false);
      }
    };
    fetchData();
  }, [postId, getAccessTokenSilently]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/edit/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          userId: formData.selectedUserId,
          createdAt: formData.createdAt,
          tags: formData.tags,
        })
      });

      if (response.ok) {
        setMessage('Post updated successfully');
        onClose?.();
      } else {
        const error = await response.json();
        setMessage(`Error updating post: ${error.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <Box className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <Typography variant="h5" gutterBottom>Edit Historical Post</Typography>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Title"
          fullWidth
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          margin="normal"
        />

        <TextField
          label="Content"
          fullWidth
          multiline
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          required
          margin="normal"
        />

        <Select
          fullWidth
          value={formData.selectedUserId}
          onChange={(e) => setFormData(prev => ({ ...prev, selectedUserId: e.target.value }))}
          required
          margin="normal"
          displayEmpty
          label="Post as User"
        >
          <MenuItem value="">Select a user</MenuItem>
          {users.map(user => (
            <MenuItem key={user.auth0_id} value={user.auth0_id}>
              {user.username || user.email}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Date and Time"
          type="datetime-local"
          fullWidth
          value={formData.createdAt}
          onChange={(e) => setFormData(prev => ({ ...prev, createdAt: e.target.value }))}
          required
          margin="normal"
        />

        <Select
          multiple
          fullWidth
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          margin="normal"
          label="Tags"
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((tagId) => (
                <Chip
                  key={tagId}
                  label={availableTags.find(tag => tag.id === tagId)?.name}
                  size="small"
                />
              ))}
            </Box>
          )}
        >
          {availableTags.map(tag => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? 'Updating...' : 'Update Post'}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth
          >
            Cancel
          </Button>
        </Box>

        {message && (
          <Typography 
            color={message.includes('Error') ? 'error' : 'success'}
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default EditHistoricalPost;