import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import EditorWithFormatting from './EditorWithFormatting';
import { EditorState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  TextField, 
  Button, 
  Box,
  Chip,
  Paper,
  Typography
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import theme from '../../../styles/theme';
import { useTheme } from '@mui/material/styles';
import ChatImageUpload from './ChatImageUpload';

const CreatePost = ({ onPostCreated, tags, setTags }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [recentlyAddedTag, setRecentlyAddedTag] = useState(null);
  const [images, setImages] = useState([]); // State for image uploads
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  const theme = useTheme();

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setIsAddingTag(true); // Show loading state

    // Generate a temporary tag with a unique ID
    const tempId = `temp-${Date.now()}`;
    const tempTag = { id: tempId, name: newTag.trim() };

    // ✅ Show the new tag in UI immediately
    setTags(prevTags => [...prevTags, tempTag]);
    setSelectedTags(prev => [...prev, tempId]);
    setRecentlyAddedTag(tempId);

    setNewTag(''); // Clear input field

    try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: tempTag.name })
        });

        const data = await response.json();

        if (response.status === 409) {
            // If the tag already exists, use the existing tag ID
            setSelectedTags(prev => [...prev.filter(id => id !== tempId), data.tag.id]);
            setRecentlyAddedTag(data.tag.id);
        } else if (response.ok) {
            // ✅ Replace temporary tag with the real tag from the database
            setTags(prevTags => prevTags.map(tag => 
                tag.id === tempId ? data : tag
            ));
            setSelectedTags(prev => [...prev.filter(id => id !== tempId), data.id]);
            setRecentlyAddedTag(data.id);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error adding tag:', error);

        // ❌ If an error occurs, remove the temp tag from the UI
        setTags(prevTags => prevTags.filter(tag => tag.id !== tempId));
    } finally {
        setIsAddingTag(false);
        setTimeout(() => setRecentlyAddedTag(null), 2000); // Remove highlight after 2s
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there's either text content or images
    const contentState = editorState.getCurrentContent();
    const hasText = contentState.hasText();
    const hasImages = images.length > 0;
    
    if (!title.trim() || (!hasText && !hasImages)) {
      // Either require a title with text content, or a title with images
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = await getAccessTokenSilently();
      const rawContent = convertToRaw(contentState);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content: JSON.stringify(rawContent),
          tags: selectedTags,
          images: images // Include images array in the request
        })
      });

      if (!response.ok) throw new Error('Failed to create post');

      const newPost = await response.json();
      onPostCreated(newPost);
      
      // Reset form
      setTitle('');
      setSelectedTags([]);
      setEditorState(EditorState.createEmpty());
      setImages([]); // Clear images after posting
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
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
      
      {/* Add the ChatImageUpload component */}
      <Box sx={{ my: 2 }}>
        <ChatImageUpload images={images} setImages={setImages} />
      </Box>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag) => {
            const isActive = selectedTags.includes(tag.id);
            const isNew = recentlyAddedTag === tag.id;

            return (
              <Chip
                key={tag.id}
                label={tag.name}
                onClick={() => handleTagToggle(tag.id)}
                color={isActive ? "primary" : "default"}
                variant="outlined"
                sx={{
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',

                  // ✅ Background color logic
                  bgcolor: isNew
                    ? theme.palette.success.light  // Highlight new tag
                    : isActive
                      ? theme.palette.primary.main  // Selected tag background (purple)
                      : 'inherit', // Default state

                  // ✅ Border logic - Remove border if it's new
                  border: isNew
                    ? "none" // ✅ Remove border if new
                    : isActive
                      ? `2px solid ${theme.palette.primary.main}`  // Active tags get a border
                      : `1px solid ${theme.palette.neutral.light}`, // Default border

                  // ✅ Text color logic
                  color: isNew
                    ? theme.palette.text.primary
                    : isActive
                      ? theme.palette.primary.contrastText // White text for active tags
                      : theme.palette.text.primary,

                  // ✅ Hover styles
                  '&:hover': {
                    bgcolor: isNew 
                      ? theme.palette.success.dark  // Keep new tag highlighted
                      : isActive 
                        ? `${theme.palette.primary.dark} !important` // Darker purple when active
                        : theme.palette.action.hover, // Default MUI hover for inactive

                    borderColor: isNew 
                      ? "none" // ✅ Keep no border on hover if new
                      : isActive 
                        ? theme.palette.primary.dark // Darken the border on hover when active
                        : theme.palette.neutral.light, // Keep normal border for inactive tags

                    color: isActive 
                      ? theme.palette.primary.contrastText // Maintain white text for active hover
                      : theme.palette.text.primary
                  }
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="Create new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            variant="outlined"
            disabled={isAddingTag} // Prevent input while adding
          />
          <Button 
            variant="contained" 
            onClick={handleAddTag}
            disabled={!newTag.trim() || isAddingTag} // Prevent clicking while adding
          >
            {isAddingTag ? 'Adding...' : 'Add'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={
            isSubmitting || 
            !title.trim() || 
            (!editorState.getCurrentContent().hasText() && images.length === 0)
          }
          endIcon={<SendIcon />}
          sx={{ px: 4, py: 1 }}
        >
          {isSubmitting ? 'Posting...' : 'Post Discussion'}
        </Button>
      </Box>
    </form>
  );
};

export default CreatePost;