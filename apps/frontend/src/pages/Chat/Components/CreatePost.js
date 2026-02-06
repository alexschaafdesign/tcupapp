import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Keep if needed for token fetching
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
import theme from '../../../styles/theme'; // Assuming theme is still needed
import { useTheme } from '@mui/material/styles';
import ChatImageUpload from './ChatImageUpload';
import { LinkDecorator } from './LinkDecorator';

// *** Import the useAuth hook (adjust path as needed) ***
import { useAuth } from '../../../hooks/useAuth';

const initialEditorState = EditorState.createEmpty(LinkDecorator);

const CreatePost = ({ onPostCreated, tags, setTags }) => {
  const { getAccessTokenSilently } = useAuth0(); // Keep for API calls

  // *** Get admin status from useAuth ***
  const { isAdmin } = useAuth(); // Assuming useAuth provides an isAdmin boolean

  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [editorState, setEditorState] = useState(initialEditorState);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [recentlyAddedTag, setRecentlyAddedTag] = useState(null);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Imported/historical fields
  const [importedAuthorName, setImportedAuthorName] = useState('');
  const [importedDate, setImportedDate] = useState('');
  const [importedAvatarUrl, setImportedAvatarUrl] = useState('');

  const theme = useTheme(); // Keep if theme is used elsewhere

  // --- Existing handlers (handleTagToggle, handleAddTag) remain the same ---
  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setIsAddingTag(true);

    const tempId = `temp-${Date.now()}`;
    const tempTag = { id: tempId, name: newTag.trim() };

    setTags((prevTags) => [...prevTags, tempTag]);
    setSelectedTags((prev) => [...prev, tempId]);
    setRecentlyAddedTag(tempId);
    setNewTag('');

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
        // Tag already exists
        setSelectedTags((prev) => [
          ...prev.filter((id) => id !== tempId),
          data.tag.id
        ]);
        setRecentlyAddedTag(data.tag.id);
      } else if (response.ok) {
        // Replace the temporary tag with the real tag
        setTags((prevTags) =>
          prevTags.map((tag) => (tag.id === tempId ? data : tag))
        );
        setSelectedTags((prev) => [
          ...prev.filter((id) => id !== tempId),
          data.id
        ]);
        setRecentlyAddedTag(data.id);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      // Clean up temporary tag if API call fails
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== tempId));
      setSelectedTags((prev) => prev.filter((id) => id !== tempId));

    } finally {
      setIsAddingTag(false);
      setTimeout(() => setRecentlyAddedTag(null), 2000);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentState = editorState.getCurrentContent();
    const hasText = contentState.hasText();
    const hasImages = images.length > 0;

    if (!title.trim() || (!hasText && !hasImages)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      const rawContent = convertToRaw(contentState);

      const bodyData = {
        title,
        content: JSON.stringify(rawContent),
        tags: selectedTags,
        images
      };

      // Check if the user is an admin AND if any imported fields have values
      const hasImportedInfo = isAdmin && (
        importedAuthorName.trim() ||
        importedDate.trim() ||
        importedAvatarUrl.trim()
      );

      if (hasImportedInfo) {
        bodyData.is_imported = true;
        bodyData.imported_author_name = importedAuthorName.trim() || null;
        bodyData.imported_date = importedDate.trim() || null;
        bodyData.imported_avatar_url = importedAvatarUrl.trim() || null;
      } else {
        // Ensure these are not sent if user isn't admin or fields are empty
        bodyData.is_imported = false;
        bodyData.imported_author_name = null;
        bodyData.imported_date = null;
        bodyData.imported_avatar_url = null;
      }


      const response = await fetch(`${process.env.REACT_APP_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
         const errorData = await response.json(); // Try to get error details
         console.error("Error response:", errorData);
         throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      onPostCreated(newPost);

      // Reset form function (moved definition outside try block)
      const resetForm = () => {
        setTitle('');
        setSelectedTags([]);
        setEditorState(EditorState.createEmpty(LinkDecorator));
        setImages([]);
        setImportedAuthorName('');
        setImportedDate('');
        setImportedAvatarUrl('');
      };

      resetForm(); // Call reset form on success

    } catch (error) {
      console.error('Error creating post:', error);
      // Optionally, show an error message to the user here
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

      <Box sx={{ my: 2 }}>
        <ChatImageUpload images={images} setImages={setImages} />
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {/* --- Tag rendering logic remains the same --- */}
          {tags.map((tag) => {
            const isActive = selectedTags.includes(tag.id);
            const isNew = recentlyAddedTag === tag.id;

            return (
              <Chip
                key={tag.id}
                label={tag.name}
                onClick={() => handleTagToggle(tag.id)}
                color={isActive ? 'primary' : 'default'}
                variant="outlined"
                 sx={{
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                  bgcolor: isNew
                    ? theme.palette.success.light // Keep distinct highlight for new
                    : isActive
                    ? theme.palette.primary.main
                    : 'transparent', // Use transparent for default
                  border: isNew
                    ? `2px solid ${theme.palette.success.main}` // Border for new
                    : isActive
                    ? `2px solid ${theme.palette.primary.dark}` // Darker border for active
                    : `1px solid ${theme.palette.divider}`, // Standard border for default
                  color: isNew
                    ? theme.palette.success.dark // Darker text for contrast
                    : isActive
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary, // Standard text color
                  fontWeight: isActive || isNew ? 600 : 400, // Make active/new bolder
                  '&:hover': {
                    bgcolor: isNew
                      ? theme.palette.success.dark // Darker background on hover for new
                      : isActive
                      ? theme.palette.primary.dark // Darker background on hover for active
                      : theme.palette.action.hover, // Standard hover effect
                    borderColor: isNew
                      ? theme.palette.success.dark
                      : isActive
                      ? theme.palette.primary.dark
                      : theme.palette.text.primary, // Darken border on hover for default
                    color: isNew
                      ? theme.palette.common.white // White text on hover for new
                      : isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  }
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
           {/* --- Add Tag input logic remains the same --- */}
          <TextField
            fullWidth
            size="small" // Make it smaller to match button
            label="Create new tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            variant="outlined"
            disabled={isAddingTag}
            onKeyPress={(e) => { // Optional: Allow adding tag with Enter key
              if (e.key === 'Enter' && !isAddingTag && newTag.trim()) {
                handleAddTag();
                e.preventDefault(); // Prevent form submission
              }
            }}
          />
          <Button
            variant="contained"
            size="medium" // Match size if TextField is small
            onClick={handleAddTag}
            disabled={!newTag.trim() || isAddingTag}
          >
            {isAddingTag ? 'Adding...' : 'Add'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
         {/* --- Submit button logic remains the same --- */}
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