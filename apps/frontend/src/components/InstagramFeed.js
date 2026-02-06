import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Grid } from '@mui/material';

const InstagramFeed = () => {
 const [posts, setPosts] = useState([]);
 const ACCESS_TOKEN = process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN;

 useEffect(() => {
    const fetchPosts = async () => {
        const url = `https://graph.instagram.com/${process.env.REACT_APP_INSTAGRAM_USER_ID}/media?fields=id,caption,media_url,permalink&access_token=${process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN}`;
        console.log('Request URL:', url);
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Response:', data);
        setPosts(data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchPosts();
  }, []);

 return (
   <Box sx={{ py: 6 }}>
     <Container>
       <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', color: '#1a1240' }}>
         @tcupminnesota
       </Typography>
       <Grid container spacing={3}>
         {posts.map(post => (
           <Grid item xs={12} sm={6} md={4} key={post.id}>
             <motion.div
               whileHover={{ scale: 1.05 }}
               transition={{ duration: 0.2 }}
             >
               <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                 <Box
                   component="img"
                   src={post.media_url}
                   alt={post.caption}
                   sx={{
                     width: '100%',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                   }}
                 />
               </a>
             </motion.div>
           </Grid>
         ))}
       </Grid>
     </Container>
   </Box>
 );
};

export default InstagramFeed;