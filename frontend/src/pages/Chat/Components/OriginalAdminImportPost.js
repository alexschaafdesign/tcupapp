import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Card, CardContent, TextField, Button, Typography, 
  Box, Chip, Alert, Grid, Paper, FormControl, 
  InputLabel
} from '@mui/material';
import { AccessTime, PersonOutline, LabelOutlined, Reply } from '@mui/icons-material';

const OriginalAdminImportPost = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '', // Changed from selectedUserId to authorName
    postDate: new Date().toISOString().split('T')[0],
    postTime: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
    tags: [],
    parentThreadId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const getFormattedDateTime = () => {
    const dateTime = new Date(`${formData.postDate}T${formData.postTime}`);
    return dateTime.toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await getAccessTokenSilently();
      const timestamp = new Date(`${formData.postDate}T${formData.postTime}`).toISOString();

      // Determine which endpoint to call based on whether it's a new thread or a reply
      const endpoint = formData.parentThreadId 
        ? `${process.env.REACT_APP_API_URL}/posts/${formData.parentThreadId}/reply`
        : `${process.env.REACT_APP_API_URL}/posts`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          is_imported: true,
          imported_author_name: formData.authorName,
          imported_date: getFormattedDateTime(),
          created_at: timestamp,
          tags: formData.tags,
        })
      });

      if (response.ok) {
        setMessage('Post imported successfully');
        setFormData({
          title: '',
          content: '',
          authorName: '',
          postDate: new Date().toISOString().split('T')[0],
          postTime: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
          tags: [],
          parentThreadId: ''
        });
      } else {
        const error = await response.json();
        setMessage(`Error importing post: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (event) => {
    const tagArray = event.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: tagArray }));
  };

  return (
    <Card elevation={3} className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <Typography variant="h4" component="h1" className="mb-6 font-bold">
          Import Historical Post
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thread Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title for new threads"
                variant="outlined"
                disabled={formData.parentThreadId !== ''}
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2 text-gray-400">
                      <LabelOutlined />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Original Author Name"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                required
                placeholder="Enter the original author's name"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2 text-gray-400">
                      <PersonOutline />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.postDate}
                onChange={(e) => setFormData(prev => ({ ...prev, postDate: e.target.value }))}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={formData.postTime}
                onChange={(e) => setFormData(prev => ({ ...prev, postTime: e.target.value }))}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} className="p-3 bg-gray-50">
                <Box className="flex items-center text-gray-600">
                  <AccessTime className="mr-2" />
                  <Typography variant="body2">
                    Will be imported as: {getFormattedDateTime()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reply to Thread ID"
                value={formData.parentThreadId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentThreadId: e.target.value }))}
                placeholder="Leave empty for new thread"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2 text-gray-400">
                      <Reply />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="community, events, etc."
                variant="outlined"
                helperText="Separate tags with commas"
                disabled={formData.parentThreadId !== ''}
              />
              <Box className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => {
                      const newTags = formData.tags.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, tags: newTags }));
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className={`h-12 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? 'Importing...' : 'Import Post'}
              </Button>
            </Grid>
          </Grid>
        </form>

        {message && (
          <Box className="mt-4">
            <Alert severity={message.includes('Error') ? 'error' : 'success'}>
              {message}
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OriginalAdminImportPost;