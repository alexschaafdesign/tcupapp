import React from 'react';
import palette from '../../../styles/colors/palette';
import { Box, Typography } from '@mui/material';

{/* Thread starter header */}
<Box sx={{ 
    bgcolor: palette.secondary.main, 
    color: palette.neutral.black,
    px: 2,
    py: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Typography variant="h4">{post.title}</Typography>
    <Typography variant="body2" sx={{ color: palette.text.secondary }}>
      {new Date(post.created_at).toLocaleString()}
    </Typography>
  </Box>