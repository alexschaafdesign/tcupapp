import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { emailTemplateMarkdown, htmlContent } from './Advance';

const EmailTemplateModal = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Render the shared HTML content without extra elevation */}
      <Paper
        elevation={0} // Removes extra shadow
        sx={{
          p: 3,
          bgcolor: '#ffffff', // Keeps white background without elevation
        }}
      >
        <Box
          component="div"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: '12px',
              marginBottom: '8px',
              lineHeight: 1.2,
            },
            '& p': {
              marginTop: '4px',
              marginBottom: '8px',
              lineHeight: 1.3,
            },
            '& ul, & ol': {
              marginTop: '8px',
              marginBottom: '12px',
              paddingLeft: '1em',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default EmailTemplateModal;