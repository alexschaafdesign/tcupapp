// DeleteDialog.js
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  CircularProgress 
} from '@mui/material';

const DeleteDialog = ({ 
  open, 
  onClose, 
  isDeleting, 
  onDelete, 
  isReply 
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onClose()}
    >
      <DialogTitle>
        {isReply ? "Delete Reply" : "Delete Thread"}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {isReply
            ? "Are you sure you want to delete this reply? This action cannot be undone."
            : "Are you sure you want to delete this thread? This will delete the entire thread and all replies. This action cannot be undone."
          }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onDelete} 
          color="error" 
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;