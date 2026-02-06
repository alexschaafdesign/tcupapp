import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

const RedirectPage = ({ 
  title = "Redirecting...",
  description = "You are being redirected to an external site.",
  targetUrl,
  autoRedirect = true,
  redirectDelay = 1500
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (autoRedirect && targetUrl) {
      timer = setTimeout(() => {
        window.location.href = targetUrl;
      }, redirectDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoRedirect, targetUrl, redirectDelay]);

  const handleManualRedirect = () => {
    window.location.href = targetUrl;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        p: 3
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>

        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          {autoRedirect && <CircularProgress size={40} />}
        </Box>

        <Typography variant="body1" paragraph>
          {description}
        </Typography>

        <Typography variant="body2" sx={{ mb: 4, fontStyle: 'italic' }}>
          {autoRedirect 
            ? `You will be redirected automatically in a few seconds...` 
            : `Click the button below to continue.`
          }
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            endIcon={<OpenInNewIcon />}
            onClick={handleManualRedirect}
          >
            Continue to Site
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RedirectPage;