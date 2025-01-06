import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const ReactionBar = ({ postId, postAuthor, onReplyClick }) => {
 const { getAccessTokenSilently } = useAuth0();
 const [showReactions, setShowReactions] = useState(false);
 const [reactions, setReactions] = useState([]);

 const REACTIONS = [
   { type: 'like', emoji: '👍', label: 'Like' },
   { type: 'love', emoji: '❤️', label: 'Love' },
   { type: 'laugh', emoji: '🤣', label: 'Laugh' },
   { type: 'wow', emoji: '😮', label: 'Wow' },
   { type: 'sad', emoji: '😞', label: 'Sad' },
   { type: 'angry', emoji: '😠', label: 'Angry' }
 ];

 useEffect(() => {
   fetchReactions();
 }, [postId]);

 const fetchReactions = async () => {
   try {
     const token = await getAccessTokenSilently();
     const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/reactions`, {
       headers: { Authorization: `Bearer ${token}` }
     });
     const data = await response.json();
     setReactions(data);
   } catch (error) {
     console.error('Error:', error);
   }
 };

 const handleReaction = async (type) => {
   try {
     const token = await getAccessTokenSilently();
     await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/reactions`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
       },
       body: JSON.stringify({ type })
     });
     fetchReactions();
     setShowReactions(false);
   } catch (error) {
     console.error('Error:', error);
   }
 };

 return (
   <Box sx={{
     display: 'flex',
     justifyContent: 'space-between',
     alignItems: 'center',
     width: '100%',
     mt: 1,
     pt: 1,
     borderTop: '1px solid',
     borderColor: 'divider'
   }}>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
       {Object.entries(reactions).map(([type, data]) => (
         <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <span role="img" aria-label={type}>{REACTIONS.find(r => r.type === type)?.emoji}</span>
           <Typography variant="body2" sx={{ mr: 2 }}>by {postAuthor}</Typography>
         </Box>
       ))}
     </Box>

     <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
       <Box
         onMouseEnter={() => setShowReactions(true)}
         onMouseLeave={() => setShowReactions(false)}
       >
         <Button sx={{
           padding: '4px 8px',
           minWidth: 'auto',
           fontSize: '0.8rem'
         }}>
           Like
         </Button>
         
         {showReactions && (
           <Paper sx={{ 
             position: 'absolute',
             top: -50,
             left: 0,
             p: 1, 
             display: 'flex', 
             gap: 0.5,
             zIndex: 1000
           }}>
             {REACTIONS.map(({ type, emoji, label }) => (
               <Button 
                 key={type} 
                 onClick={() => handleReaction(type)}
                 size="small"
               >
                 <span role="img" aria-label={label}>{emoji}</span>
               </Button>
             ))}
           </Paper>
         )}
       </Box>
       
       <Button 
         onClick={onReplyClick}
         sx={{
           padding: '4px 8px',
           minWidth: 'auto',
           fontSize: '0.8rem'
         }}>
         Reply
       </Button>
     </Box>
   </Box>
 );
};

export default ReactionBar;