import React from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { htmlContent } from './Advance';

const EmailTemplateModal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screens

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 1, sm: 2, md: 3 }, // Less padding on smaller screens
      }}
    >
      <Paper
        elevation={0} // Removes extra shadow
        sx={{
          p: { xs: 1, sm: 3 }, // Reduce padding for smaller screens
          bgcolor: '#ffffff',
        }}
      >
        <Box
          component="div"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: { xs: '8px', sm: '12px' }, // Smaller top margin on mobile
              marginBottom: { xs: '6px', sm: '8px' },
              lineHeight: 1.2,
            },
            '& p': {
              marginTop: { xs: '2px', sm: '4px' },
              marginBottom: { xs: '6px', sm: '8px' },
              lineHeight: 1.3,
            },
            '& ul, & ol': {
              marginTop: { xs: '6px', sm: '8px' },
              marginBottom: { xs: '10px', sm: '12px' },
              paddingLeft: { xs: '0.8em', sm: '1em' },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default EmailTemplateModal;