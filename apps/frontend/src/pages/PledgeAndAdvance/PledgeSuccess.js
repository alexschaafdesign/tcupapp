import React from 'react';
import { Box, Container, Typography, Paper, Link, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';

const PledgeSuccess = () => {
  const location = useLocation();
  const { pledgeImage, compositeImage } = location.state || {};

  const downloadImage = (imageUrl, fileName) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Box
            component="img"
            src="https://res.cloudinary.com/dsll3ms2c/image/upload/v1735343525/LOGO_512_3x_t11sld.png"
            alt="TCUP Logo"
            sx={{
              width: '200px',
              height: '200px',
              objectFit: 'contain'
            }}
          />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #9c27b0 30%, #f50057 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Thank you!
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Your pledge has been received.
            </Typography>

            {/* Download Buttons */}
            {pledgeImage && compositeImage && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => downloadImage(pledgeImage, 'pledge-card.jpg')}
                >
                  Download Pledge Card
                </Button>
                <Button
                  variant="contained"
                  onClick={() => downloadImage(compositeImage, 'final-pledge.jpg')}
                >
                  Download Final Image
                </Button>
              </Box>
            )}

            {/* Links */}
            <Box mt={3} display="flex" flexDirection="column" gap={1}>
              <Link
                href="/advance"
                color="primary.dark"
                variant="body"
                underline="hover"
              >
                Bookmark the TCUP Advance for future use!
              </Link>
              <Link
                href="https://airtable.com/appWhJi1YbIsdiXrw/pagHJycS1fOI0TGLS/form?fbclid=PAZXh0bgNhZW0CMTEAAaY_bSJpfW0iCIohFPoVp5SsDtS-JZ1WUmz9X2T6E-xlgtY-S8wyMFlyr98_aem_q7oYyhinTGZPmA9-0FzL-A"
                color="primary.dark"
                variant="body"
                underline="hover"
              >
                Interested in joining TCUP as a full member? Fill out this New Member Interest Form!
              </Link>
              <Link
                href="https://www.tcupboard.org"
                color="primary.dark"
                variant="body"
                underline="hover"
              >
                Join the tCUPBOARD, the online home for the Minnesota music scene
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PledgeSuccess;