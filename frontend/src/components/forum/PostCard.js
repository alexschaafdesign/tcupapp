import React, { useState } from 'react';
import { ThreadPreview } from './ThreadPreview';
import { TextField, Button, Box } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const PostCard = ({ post, onPostUpdated }) => {
 const [showReplyForm, setShowReplyForm] = useState(false);
 const [replyContent, setReplyContent] = useState('');
 const { getAccessTokenSilently } = useAuth0();
 const apiUrl = process.env.REACT_APP_API_URL;

 const handleReply = async () => {
   try {
     const token = await getAccessTokenSilently();
     const response = await fetch(`${apiUrl}/posts/${post.id}/reply`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ content: replyContent })
     });
     const newReply = await response.json();
     onPostUpdated({ ...post, replies: [...(post.replies || []), newReply] });
     setReplyContent('');
     setShowReplyForm(false);
   } catch (error) {
     console.error('Error posting reply:', error);
   }
 };

 return (
   <>
     <ThreadPreview 
       post={post} 
       onReplyClick={() => setShowReplyForm(true)} 
     />
     {showReplyForm && (
       <Box sx={{ ml: 4, mb: 2 }}>
         <TextField
           fullWidth
           multiline
           rows={3}
           value={replyContent}
           onChange={(e) => setReplyContent(e.target.value)}
           sx={{ mb: 1 }}
         />
         <Button 
           variant="contained" 
           onClick={handleReply}
           disabled={!replyContent.trim()}
         >
           Post Reply
         </Button>
       </Box>
     )}
   </>
 );
};

export default PostCard;