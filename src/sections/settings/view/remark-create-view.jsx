import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function RemarkCreateView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, remark: null });
  const [editing, setEditing] = useState({ idx: null, value: '' });
  const { enqueueSnackbar } = useSnackbar();
  const remarksEndRef = useRef(null);

  const scrollToBottom = () => {
    remarksEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemarkSave = async () => {
    if (!remark.trim()) {
      enqueueSnackbar('Remark cannot be empty', { variant: 'warning' });
      return;
    }
    if (remark.length > 200) {
      enqueueSnackbar('Remark must be under 200 characters', { variant: 'warning' });
      return;
    }

    setLoading(true);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

    let updatedRemarks;
    if (editing.idx !== null) {
      updatedRemarks = [...configs.remarks];
      updatedRemarks[editing.idx] = remark.trim();
    } else {
      updatedRemarks = configs.remarks ? [...configs.remarks, remark.trim()] : [remark.trim()];
    }

    const payload = { ...configs, remarks: updatedRemarks };

    try {
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setRemark('');
        setEditing({ idx: null, value: '' });
        enqueueSnackbar(editing.idx !== null ? 'Remark updated successfully' : 'Remark added successfully', {
          variant: 'success',
        });
        mutate();
        scrollToBottom();
      }
    } catch (err) {
      enqueueSnackbar('Failed to save remark', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRemark = async () => {
    setLoading(true);
    const updatedRemarks = configs.remarks.filter((r) => r !== deleteDialog.remark);
    const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, remarks: updatedRemarks };

    try {
      await axios.put(apiEndpoint, payload);
      enqueueSnackbar('Remark deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete remark', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, remark: null });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Card sx={{ maxWidth: 600, mb: 3 }}>
        <CardHeader title="Remark Manager" subheader="Add new remarks or edit existing ones" />
        <Divider />
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={editing.idx !== null ? 'Edit Remark' : 'New Remark'}
              variant="outlined"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              helperText={`${remark.length}/200`}
              inputProps={{ maxLength: 200 }}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              {editing.idx !== null && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Iconify icon="mdi:close" />}
                  onClick={() => {
                    setEditing({ idx: null, value: '' });
                    setRemark('');
                  }}
                >
                  Cancel
                </Button>
              )}
              <LoadingButton
                variant="contained"
                loading={loading}
                startIcon={editing.idx !== null ? <Iconify icon="mdi:content-save" /> : null}
                onClick={handleRemarkSave}
              >
                {editing.idx !== null ? 'Save Changes' : 'Add Remark'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Box>
      </Card>
      <Card>
        <CardHeader title="Existing Remarks" subheader="Manage previously added remarks" />
        <Divider />
        <Box sx={{ p: 2, maxHeight: 250, overflowY: 'auto' }}>
          {configs?.remarks?.length ? (
            <List>
              {configs.remarks.map((r, idx) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditing({ idx, value: r });
                            setRemark(r);
                          }}
                        >
                          <Iconify icon="mdi:pencil" width={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, remark: r })}
                        >
                          <Iconify icon="mdi:delete" width={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemText primary={r} />
                </ListItem>
              ))}
              <div ref={remarksEndRef} />
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No remarks added yet.
            </Typography>
          )}
        </Box>
      </Card>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, remark: null })}>
        <DialogTitle>Delete Remark</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the following remark?
            <Box
              component="span"
              sx={{
                display: 'block',
                mt: 1,
                fontWeight: 'bold',
                color: 'error.main',
              }}
            >
              "{deleteDialog.remark}"
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, remark: null })}>Cancel</Button>
          <LoadingButton color="error" onClick={handleDeleteRemark} loading={loading}>
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
