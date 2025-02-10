import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
 padding: theme.spacing(4),
 maxWidth: 500,
 margin: '2rem auto',
 textAlign: 'center',
 background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
 boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
}));

const Thermometer = styled(Box)(({ theme }) => ({
 position: 'relative',
 width: 60,
 height: 300,
 margin: '40px auto 20px',
 backgroundColor: '#f5f5f5',
 borderRadius: '20px 20px 0 0',
 border: '4px solid #9e9e9e',
 overflow: 'hidden',
 '&::after': {
   content: '""',
   position: 'absolute',
   bottom: -40,
   left: '50%',
   transform: 'translateX(-50%)',
   width: 80,
   height: 80,
   backgroundColor: '#9e9e9e',
   borderRadius: '50%',
   boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
 }
}));

const Mercury = styled(Box)(({ height }) => ({
 position: 'absolute',
 bottom: 0,
 width: '100%',
 height: `${height}%`,
 background: 'linear-gradient(to top, #f44336 0%, #ff7961 100%)',
 transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
 boxShadow: '0 0 15px rgba(244, 67, 54, 0.6)',
 '&::after': {
   content: '""',
   position: 'absolute',
   bottom: -30,
   left: '50%',
   transform: 'translateX(-50%)',
   width: 60,
   height: 60,
   background: 'linear-gradient(to bottom, #ff7961 0%, #f44336 100%)',
   borderRadius: '50%',
   boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
 }
}));

const PledgeTracker = () => {
 const [pledgeCount, setPledgeCount] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const GOAL = 500;

      useEffect(() => {
        const fetchPledgeCount = async () => {
          try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/pledges/count`);
            const data = await response.json();
            setPledgeCount(data.count);
          } catch (error) {
            console.error('Error fetching pledge count:', error);
          } finally {
            setIsLoading(false);
          }
        };

   fetchPledgeCount();
   const interval = setInterval(fetchPledgeCount, 60000);
   return () => clearInterval(interval);
 }, []);

 if (isLoading || pledgeCount === null) {
   return (
     <StyledPaper elevation={3}>
       <Box display="flex" justifyContent="center" alignItems="center" height={400}>
         <CircularProgress />
       </Box>
     </StyledPaper>
   );
 }

 const progress = (pledgeCount / GOAL) * 100;
 const mercuryHeight = Math.min(85, progress * 0.85);

 return (
   <StyledPaper elevation={3}>
     <Typography variant="h4" color="primary" gutterBottom 
       sx={{ 
         fontWeight: 'bold',
         textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
       }}>
       Power Pledge Progress!
     </Typography>
     
     <Typography variant="h5" gutterBottom sx={{ opacity: 0.9 }}>
       <Box component="span" sx={{ fontWeight: 'bold' }}>{pledgeCount}</Box>
       {' '}of{' '}
       <Box component="span" sx={{ fontWeight: 'bold' }}>{GOAL}</Box>
       {' '}Pledges
     </Typography>

     <Box sx={{ position: 'relative' }}>
       <Thermometer>
         <Mercury height={mercuryHeight} />
         {[...Array(5)].map((_, i) => (
           <Box
             key={i}
             sx={{
               position: 'absolute',
               left: 0,
               width: 20,
               height: 2,
               backgroundColor: '#9e9e9e',
               bottom: `${i * 20}%`,
               zIndex: 1,
               '&::after': {
                 content: '""',
                 position: 'absolute',
                 right: -40,
                 width: 20,
                 height: 2,
                 backgroundColor: '#9e9e9e'
               }
             }}
           />
         ))}
       </Thermometer>
     </Box>

     <Typography variant="body1" sx={{ 
       mt: 3,
       color: 'text.secondary',
       fontSize: '1.1rem'
     }}>
       {Math.round(progress)}% Complete
     </Typography>
   </StyledPaper>
 );
};

export default PledgeTracker;