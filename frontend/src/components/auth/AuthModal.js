import React from 'react';
import { Dialog, Alert, Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

// In AuthModal.jsx
const AuthModal = ({ open, onClose, message = "Please log in to continue" }) => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = (e) => {
    e.stopPropagation(); // Prevent any click-through
    loginWithRedirect();
  };

  return (
    <Dialog 
      open={open} 
      onClose={(e) => {
        e.stopPropagation(); // Prevent propagation when closing
        onClose();
      }}
      onClick={e => e.stopPropagation()} // Stop clicks inside modal from propagating
    >
      <Alert 
        severity="info" 
        action={
          <Button color="inherit" size="small" onClick={handleLogin}>
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