import React from 'react';
import { Dialog, Alert, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const AuthModal = ({ open, onClose, message = "Please log in to continue" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Dialog open={open} onClose={onClose}>
      <Alert 
        severity="info" 
        action={
          <Button color="inherit" size="small" onClick={loginWithRedirect}>
            Log in / Register
          </Button>
        }
      >
        {message}
      </Alert>
    </Dialog>
  );
};

export default AuthModal;