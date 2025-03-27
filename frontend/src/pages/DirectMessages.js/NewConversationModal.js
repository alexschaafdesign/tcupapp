import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button,
  Autocomplete,
  Avatar,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import EditorWithFormatting from '../Chat/Components/EditorWithFormatting';
import ChatImageUpload from '../Chat/Components/ChatImageUpload';
import { EditorState, convertToRaw } from 'draft-js';
import { LinkDecorator } from '../Chat/Components/LinkDecorator';

const NewConversationModal = ({ initialUser, onConversationCreated, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [messageEditorState, setMessageEditorState] = useState(EditorState.createEmpty(LinkDecorator));
  const [messageImages, setMessageImages] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  useEffect(() => {
    if (initialUser) {
      setSelectedUser(initialUser);
      console.log("Initialized with user:", initialUser);
    }
  }, [initialUser]);

  // Fetch users for autocomplete
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);
        
        const token = await getAccessTokenSilently();
        const response = await fetch(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Loaded ${data.length} users for selection`);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [getAccessTokenSilently, apiUrl]);
  
  const handleStartConversation = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting conversation with user:", selectedUser.username);
      
      const token = await getAccessTokenSilently();
      const contentState = messageEditorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      
      const response = await fetch(`${apiUrl}/direct-messages/send`, {
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
        const errorText = await response.text();
        console.error(`Error sending message (${response.status}):`, errorText);
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Message sent, response:", responseData);
      
      // Extract conversation info from the response
      const conversationInfo = {
        id: responseData.conversation_id,
        other_user: selectedUser,
        last_message: contentState.getPlainText(),
        last_message_at: new Date().toISOString()
      };
      
      console.log("Created conversation:", conversationInfo);
      
      // Pass the conversation info to the parent component
      onConversationCreated(conversationInfo);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error.message || "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Autocomplete
        value={selectedUser}  // This is important - it sets the initial value
        options={users}
        loading={loadingUsers}
        getOptionLabel={(option) => option?.username || ""}
        renderOption={(props, option) => (
          <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
            <Avatar 
              alt={option.username || 'User'} 
              src={option.avatar_url} 
              sx={{ width: 24, height: 24, mr: 2 }}
            />
            {option.username || 'Unnamed User'}
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
                      alt={selectedUser.username || 'User'} 
                      src={selectedUser.avatar_url} 
                      sx={{ width: 24, height: 24, ml: 1, mr: 1 }}
                    />
                  )}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
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
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleStartConversation}
          disabled={
            !selectedUser || 
            (!messageEditorState.getCurrentContent().hasText() && messageImages.length === 0) || 
            loading
          }
        >
          {loading ? <CircularProgress size={24} /> : 'Send Message'}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default NewConversationModal;