import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button,
  Autocomplete,
  Avatar,
  CircularProgress,
  Typography
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import EditorWithFormatting from '../Chat/Components/EditorWithFormatting';
import ChatImageUpload from '../Chat/Components/ChatImageUpload';
import { EditorState, convertToRaw } from 'draft-js';

const NewConversationModal = ({ onConversationCreated }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageEditorState, setMessageEditorState] = useState(EditorState.createEmpty());
  const [messageImages, setMessageImages] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Fetch users for autocomplete
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleStartConversation = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      const response = await fetch(`${apiUrl}/messages/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: selectedUser.auth0_id,
          content: rawContent,
          images: messageImages
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newConversation = await response.json();
      onConversationCreated(newConversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Autocomplete
        options={users}
        getOptionLabel={(option) => option.username}
        renderOption={(props, option) => (
          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
            <Avatar 
              alt={option.username} 
              src={option.avatar_url} 
              sx={{ width: 24, height: 24, mr: 2 }}
            />
            {option.username}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select a user"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {selectedUser && (
                    <Avatar 
                      alt={selectedUser.username} 
                      src={selectedUser.avatar_url} 
                      sx={{ width: 24, height: 24, ml: 1, mr: 1 }}
                    />
                  )}
                  {params.InputProps.startAdornment}
                </>
              )
            }}
          />
        )}
        onChange={(event, newValue) => {
          setSelectedUser(newValue);
        }}
        fullWidth
      />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Message
        </Typography>
        <EditorWithFormatting
          editorState={messageEditorState}
          setEditorState={setMessageEditorState}
          placeholder="Type your message..."
        />
      </Box>
      
      <ChatImageUpload 
        images={messageImages} 
        setImages={setMessageImages} 
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleStartConversation}
          disabled={!selectedUser || (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0) || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Message'}
        </Button>
      </Box>
    </Box>
  );
};

export default NewConversationModal;