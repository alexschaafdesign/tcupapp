import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Button
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useInView } from 'react-intersection-observer';
import '@fontsource/arimo';
import { emailTemplateMarkdown, htmlContent } from './Components/Advance';

const SimplePledgePage = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const [copied, setCopied] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const fetchImages = useCallback(async (cursor = null) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        perPage: '100',
        ...(cursor && { nextCursor: cursor }),
      });

      const response = await fetch(`${apiUrl}/images/pledge-photos?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      const repeatedImages = [...data.images, ...data.images];

      setGalleryImages(repeatedImages);
      setHasMore(false);
      setTotalImages(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchImages(nextCursor);
    }
  }, [inView, hasMore, loading, fetchImages, nextCursor]);

  // Email template written in markdown
  // Email template written in markdown with an HTML table for layout
  const handleCopy = async () => {
    try {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([emailTemplateMarkdown], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Gallery */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute',
          inset: 0,
          bgcolor: 'background.paper',
          opacity: 0.9
        }} />
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Grid container spacing={1} sx={{ opacity: 0.15 }}>
            {galleryImages.map((image) => (
              <Grid item xs={3} sm={2} md={2} lg={1} key={image.id}>
                <Box sx={{ 
                  position: 'relative',
                  paddingTop: '100%',
                  overflow: 'hidden'
                }}>
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.alt}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    loading="lazy"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 2
            }}>
              <Box
                component="img"
                src="https://res.cloudinary.com/dsll3ms2c/image/upload/c_thumb,w_200,dpr_auto,g_face/v1739141056/tcuplogo212_tgrmdm.png"
                alt="TCUP Logo"
                sx={{ 
                    height: 'auto',  // note the quotes to indicate a CSS string value
                    width: '100px'   // add units (e.g., 'px') for proper sizing
                }}
                />
                </Box>

            <Typography variant="h1" align="center" gutterBottom>
              TCUP ADVANCE
            </Typography>

            <Typography variant="body1" paragraph>
            By launching our TCUP Advance, TCUP is taking an initial step to improve the relationship between venues and performers, establishing a consistent standard of communication and transparency.
            </Typography>

            <Typography variant="body1" paragraph>
            We understand that not all situations are the same and you will have different needs for every show, so we trust that you will use this resource in the best way you see fit. 
            </Typography>

            <Typography variant="body1" paragraph>
Hit "Copy text" and then paste into your email. <b>Don't forget to fill out the second section with your own information before sending!</b>            </Typography>

            {/* "Copy Text" Button with Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Button
                variant="contained"
                onClick={handleCopy}
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              >
                {copied ? 'Text copied' : 'Copy Text'}
              </Button>
            </Box>

            {/* Display the HTML content so that bold text is visible on the page */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mt: 3,
                    bgcolor: '#ffffff',
                    // Remove the monospace font if you want to keep your default font
                    // fontFamily: 'monospace'
                }}
>
                <Box
                    component="div"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    sx={{
                    // Adjust headers (e.g., "Performance Agreement")
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                        marginTop: '12px',    // some space above the header
                        marginBottom: '8px', // a bit less below the header
                        lineHeight: 1.2,
                    },
                    // Adjust paragraphs
                    '& p': {
                        marginTop: '4px',
                        marginBottom: '8px',
                        lineHeight: 1.3,
                    },
                    // Adjust lists if needed
                    '& ul, & ol': {
                        marginTop: '8px',
                        marginBottom: '12px',
                        paddingLeft: '1em'
                    },
                    }}
                />
                </Paper>
              
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SimplePledgePage;