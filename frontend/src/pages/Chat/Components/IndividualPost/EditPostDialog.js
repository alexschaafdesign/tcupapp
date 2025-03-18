// EditPostDialog.js
import React from 'react';
import { Dialog } from '@mui/material';
import EditPost from '../EditPost';

const EditPostDialog = ({ open, onClose, onSave, post }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <EditPost 
        post={post}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
};

export default EditPostDialog;