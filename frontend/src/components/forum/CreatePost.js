import React, { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import EditorWithFormatting from './EditorWithFormatting';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  TextField, 
  Button, 
  Box,
  Chip,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Send as SendIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatQuote,
  Code,
  Link as LinkIcon,
  FormatListBulleted,
  FormatListNumbered
} from '@mui/icons-material';

export const CreatePost = ({ onPostCreated, tags }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content: JSON.stringify(rawContent),
          tags: selectedTags
        })
      });
      const newPost = await response.json();
      onPostCreated(newPost);
      
      // Reset form
      setTitle('');
      setSelectedTags([]);
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="outlined"
        sx={{ mb: 3 }}
        placeholder="What's on your mind?"
        autoFocus
      />

<EditorWithFormatting 
    editorState={editorState}
    setEditorState={setEditorState}
  />
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleTagToggle(tag.id)}
              color={selectedTags.includes(tag.id) ? "primary" : "default"}
              variant={selectedTags.includes(tag.id) ? "filled" : "outlined"}
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: selectedTags.includes(tag.id) 
                    ? 'primary.dark' 
                    : 'action.hover'
                }
              }}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!title.trim() || !editorState.getCurrentContent().hasText()}
          endIcon={<SendIcon />}
          sx={{ px: 4, py: 1 }}
        >
          Post Discussion
        </Button>
      </Box>
    </form>
  );
};

export default CreatePost;