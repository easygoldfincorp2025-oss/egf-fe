import React from 'react';
import { Dialog, DialogContent, Button } from '@mui/material';

const ImgDialog = ({ children, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogContent>
        {children}
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImgDialog;
