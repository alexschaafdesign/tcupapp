import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const HistoricalReplyForm = ({ threadId, onReplyCreated, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    content: '',
    selectedUserId: '',
    createdAt: new Date().toISOString().slice(0, 16)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/posts/${threadId}/historical-reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: formData.content,
            userId: formData.selectedUserId,
            createdAt: formData.createdAt
          })
        }
      );

      if (response.ok) {
        const reply = await response.json();
        onReplyCreated(reply);
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Add Historical Reply</Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Reply Content"
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        required
        margin="normal"
      />

      <Select
        fullWidth
        value={formData.selectedUserId}
        onChange={(e) => setFormData(prev => ({ ...prev, selectedUserId: e.target.value }))}
        label="Post as User"
        required
        margin="dense"
      >
        <MenuItem value="">Select a user</MenuItem>
        {users.map(user => (
          <MenuItem key={user.auth0_id} value={user.auth0_id}>
            {user.username || user.email}
          </MenuItem>
        ))}
      </Select>

      <TextField
        fullWidth
        type="datetime-local"
        label="Reply Date/Time"
        value={formData.createdAt}
        onChange={(e) => setFormData(prev => ({ ...prev, createdAt: e.target.value }))}
        required
        margin="normal"
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Reply...' : 'Add Reply'}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default HistoricalReplyForm;