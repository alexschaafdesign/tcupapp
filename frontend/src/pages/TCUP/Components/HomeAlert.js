import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import palette from '../../../styles/colors/palette';

const HomeAlert = () => {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if there's a success message in sessionStorage
    const contactSuccess = sessionStorage.getItem('contactSuccess');
    if (contactSuccess) {
      setAlert({
        open: true,
        message: contactSuccess,
        severity: 'success'
      });
      // Remove the message from sessionStorage to prevent showing it again on refresh
      sessionStorage.removeItem('contactSuccess');
    }
  }, []);

  const handleClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Snackbar
      open={alert.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%', backgroundColor: palette.secondary.dark, color: palette.neutral.white }}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default HomeAlert;