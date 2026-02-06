import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Editor, EditorState, convertToRaw, convertFromRaw, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  Box, Typography, TextField, Button, Select, MenuItem, Chip,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatQuote,
  Code,
  FormatListBulleted,
  FormatListNumbered
} from '@mui/icons-material';

const EditHistoricalPost = ({ postId, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({
    title: '',
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
        
        // Fetch initial data
        const [usersResponse, tagsResponse, postResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.REACT_APP_API_URL}/tags`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const [usersData, tagsData, { post }] = await Promise.all([
          usersResponse.json(),
          tagsResponse.json(),
          postResponse.json()
        ]);

        setUsers(usersData);
        setAvailableTags(tagsData);

        // Initialize editor state from post content
        try {
          const contentState = convertFromRaw(JSON.parse(post.content));
          setEditorState(EditorState.createWithContent(contentState));
        } catch {
          // If content isn't in Draft.js format, create new state with text
          setEditorState(EditorState.createEmpty());
        }

        setFormData({
          title: post.title || '',
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

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await getAccessTokenSilently();
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/edit/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: rawContent,
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

  if (isLoading) return <Box p={4}>Loading...</Box>;

  return (
    <Box sx={{ maxWidth: '2xl', mx: 'auto', p: 6, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h5" gutterBottom>Edit Historical Post</Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          margin="normal"
        />

        <Box sx={{ my: 2 }}>
          <ToggleButtonGroup size="small" sx={{ mb: 1 }}>
            <ToggleButton 
              value="BOLD"
              onClick={() => toggleInlineStyle('BOLD')}
            >
              <FormatBold />
            </ToggleButton>
            <ToggleButton 
              value="ITALIC"
              onClick={() => toggleInlineStyle('ITALIC')}
            >
              <FormatItalic />
            </ToggleButton>
            <ToggleButton 
              value="UNDERLINE"
              onClick={() => toggleInlineStyle('UNDERLINE')}
            >
              <FormatUnderlined />
            </ToggleButton>
            <ToggleButton 
              value="blockquote"
              onClick={() => toggleBlockType('blockquote')}
            >
              <FormatQuote />
            </ToggleButton>
            <ToggleButton 
              value="code-block"
              onClick={() => toggleBlockType('code-block')}
            >
              <Code />
            </ToggleButton>
            <ToggleButton 
              value="unordered-list-item"
              onClick={() => toggleBlockType('unordered-list-item')}
            >
              <FormatListBulleted />
            </ToggleButton>
            <ToggleButton 
              value="ordered-list-item"
              onClick={() => toggleBlockType('ordered-list-item')}
            >
              <FormatListNumbered />
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ 
            border: 1,
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 2,
            minHeight: '200px',
            '& .DraftEditor-root': { height: '100%' }
          }}>
            <Editor
              editorState={editorState}
              onChange={setEditorState}
            />
          </Box>
        </Box>

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