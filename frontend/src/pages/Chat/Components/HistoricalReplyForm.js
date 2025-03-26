import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const HistoricalReplyForm = ({ threadId, onReplyCreated, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    authorName: '',
    createdAt: new Date().toISOString().slice(0, 16),
    avatarUrl: '' // New: store the custom avatar
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${threadId}/historical-reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: formData.content,
            authorName: formData.authorName,
            createdAt: formData.createdAt,
            avatarUrl: formData.avatarUrl // pass the new field
          })
        }
      );

      if (!resp.ok) {
        throw new Error('Failed to add historical reply');
      }

      const reply = await resp.json();
      // Tell parent about the new reply
      onReplyCreated(reply);
      onClose();
    } catch (error) {
      console.error('Error adding historical reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Historical Reply
      </Typography>

      {/* Reply Content */}
      <TextField
        label="Reply Content"
        multiline
        rows={4}
        fullWidth
        required
        margin="normal"
        value={formData.content}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, content: e.target.value }))
        }
      />

      {/* Historical Author Name */}
      <TextField
        label="Historical Author Name"
        fullWidth
        required
        margin="normal"
        value={formData.authorName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, authorName: e.target.value }))
        }
      />

      {/* Historical Avatar URL */}
      <TextField
        label="Historical Avatar URL (Optional)"
        fullWidth
        margin="normal"
        value={formData.avatarUrl}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))
        }
        placeholder="https://example.com/my-avatar.png"
      />

      {/* Historical Date/Time */}
      <TextField
        type="datetime-local"
        label="Reply Date/Time"
        fullWidth
        required
        margin="normal"
        value={formData.createdAt}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, createdAt: e.target.value }))
        }
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Add Reply'}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default HistoricalReplyForm;