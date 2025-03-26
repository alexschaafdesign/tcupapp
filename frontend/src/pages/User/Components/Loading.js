import React from 'react';
import { Container, CircularProgress } from '@mui/material';

const Loading = () => (
  <Container maxWidth="sm" sx={{ mt: 3, textAlign: 'center' }}>
    <CircularProgress size={40} />
  </Container>
);

export default Loading;