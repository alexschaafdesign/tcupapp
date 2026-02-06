// File: components/PasswordDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useApi from '../../../hooks/useApi';
import PasswordRequirements from './PasswordRequirements';

const PasswordDialog = ({ open, onClose, showFeedback }) => {
  const { callApi } = useApi();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleClose = () => {
    if (!isChangingPassword) {
      resetForm();
      onClose();
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    try {
      setPasswordError(null);
      setIsChangingPassword(true);
      
      const response = await callApi(`${apiUrl}/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.error) throw new Error(response.error);
      
      resetForm();
      onClose();
      showFeedback('Password changed successfully');
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">Change Password</Typography>
      </DialogTitle>
      <form onSubmit={handlePasswordUpdate}>
        <DialogContent>
          <TextField
            autoComplete="current-password"
            name="current-password"
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 1.5 }
            }}
            disabled={isChangingPassword}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            autoComplete="new-password"
            name="new-password"
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 1.5 }
            }}
            disabled={isChangingPassword}
            size="small"
            sx={{ mb: 1 }}
          />

          <TextField
            autoComplete="new-password"
            name="confirm-password"
            margin="dense"
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 1.5 }
            }}
            disabled={isChangingPassword}
            size="small"
          />
          
          {/* Use your existing PasswordRequirements component */}
          <Box sx={{ mt: 2 }}>
            <PasswordRequirements password={newPassword} />
          </Box>
          
          {passwordError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {passwordError}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            type="button" 
            onClick={handleClose} 
            disabled={isChangingPassword}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isChangingPassword}
            sx={{ borderRadius: 1.5 }}
          >
            {isChangingPassword ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PasswordDialog;