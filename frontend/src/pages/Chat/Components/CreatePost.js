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
  const [images, setImages] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Imported/historical fields
  const [importedAuthorName, setImportedAuthorName] = useState('');
  const [importedDate, setImportedDate] = useState('');
  const [importedAvatarUrl, setImportedAvatarUrl] = useState('');  // <--- new field

  const theme = useTheme();

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
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== tempId));
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
      // Must have either text or images in the post
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      const rawContent = convertToRaw(contentState);

      // Build request body
      const bodyData = {
        title,
        content: JSON.stringify(rawContent),
        tags: selectedTags,
        images
      };

      // If user provided *any* of these imported fields, mark it as imported
      const hasImportedInfo =
        importedAuthorName.trim() ||
        importedDate.trim() ||
        importedAvatarUrl.trim();

      if (hasImportedInfo) {
        bodyData.is_imported = true;
        bodyData.imported_author_name = importedAuthorName.trim() || null;
        bodyData.imported_date = importedDate.trim() || null;
        bodyData.imported_avatar_url = importedAvatarUrl.trim() || null; // <--- included
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
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      onPostCreated(newPost);

      // Reset form
      setTitle('');
      setSelectedTags([]);
      setEditorState(EditorState.createEmpty());
      setImages([]);
      setImportedAuthorName('');
      setImportedDate('');
      setImportedAvatarUrl(''); // reset avatar field
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

      {/* Imported fields row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Imported Author Name (Optional)"
          value={importedAuthorName}
          onChange={(e) => setImportedAuthorName(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Imported Date (Optional)"
          value={importedDate}
          onChange={(e) => setImportedDate(e.target.value)}
          variant="outlined"
          fullWidth
          placeholder="e.g. 01/02/2018 3:45 PM"
        />
      </Box>

      {/* Imported Avatar URL field */}
      <TextField
        label="Imported Avatar URL (Optional)"
        value={importedAvatarUrl}
        onChange={(e) => setImportedAvatarUrl(e.target.value)}
        variant="outlined"
        fullWidth
        placeholder="e.g. https://example.com/myavatar.png"
        sx={{ mb: 2 }}
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
                  transition: 'background-color 0.3s ease, border-color 0.3s ease',
                  bgcolor: isNew
                    ? theme.palette.success.light
                    : isActive
                    ? theme.palette.primary.main
                    : 'inherit',
                  border: isNew
                    ? 'none'
                    : isActive
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.neutral.light}`,
                  color: isNew
                    ? theme.palette.text.primary
                    : isActive
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: isNew
                      ? theme.palette.success.dark
                      : isActive
                      ? `${theme.palette.primary.dark} !important`
                      : theme.palette.action.hover,
                    borderColor: isNew
                      ? 'none'
                      : isActive
                      ? theme.palette.primary.dark
                      : theme.palette.neutral.light,
                    color: isActive
                      ? theme.palette.primary.contrastText
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
            disabled={isAddingTag}
          />
          <Button
            variant="contained"
            onClick={handleAddTag}
            disabled={!newTag.trim() || isAddingTag}
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