import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function PercentageCreateView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, value: null });
  const [editDialog, setEditDialog] = useState({ open: false, value: null, oldValue: null });
  const { enqueueSnackbar } = useSnackbar();

  const handleAddPercentage = async () => {
    const numericValue = Number(percentage);
    if (!percentage || isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      enqueueSnackbar('Please enter a valid percentage (0–100)', { variant: 'warning' });
      return;
    }

    if (configs?.percentage?.includes(numericValue)) {
      enqueueSnackbar('This percentage already exists', { variant: 'info' });
      return;
    }

    setLoading(true);
    try {
      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const updatedPercentage = configs?.percentage
        ? [...configs.percentage, numericValue].sort((a, b) => a - b)
        : [numericValue];
      const payload = { ...configs, percentage: updatedPercentage };

      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setPercentage('');
        enqueueSnackbar('Percentage added successfully', { variant: 'success' });
        mutate();
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to add Percentage', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePercentage = async (percentageToDelete) => {
    setDeleteDialog({ open: false, value: null });
    setLoading(true);
    try {
      const updatedPercentage = configs.percentage.filter((r) => r !== percentageToDelete);
      const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, percentage: updatedPercentage };

      await axios.put(apiEndpoint, payload);
      enqueueSnackbar('Percentage deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete Percentage', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPercentage = async () => {
    const numericValue = Number(editDialog.value);
    if (!editDialog.value || isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      enqueueSnackbar('Please enter a valid percentage (0–100)', { variant: 'warning' });
      return;
    }

    if (configs?.percentage?.includes(numericValue)) {
      enqueueSnackbar('This percentage already exists', { variant: 'info' });
      return;
    }

    setLoading(true);
    try {
      const updatedPercentage = configs.percentage
        .map((r) => (r === editDialog.oldValue ? numericValue : r))
        .sort((a, b) => a - b);

      const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, percentage: updatedPercentage };

      await axios.put(apiEndpoint, payload);
      enqueueSnackbar('Percentage updated successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to update Percentage', { variant: 'error' });
    } finally {
      setLoading(false);
      setEditDialog({ open: false, value: null, oldValue: null });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Manage Percentages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add, edit, or remove percentages. Useful for calculations and configurations.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="New Percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                helperText="Enter a value between 0 and 100"
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAddPercentage}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Add Percentage
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Percentages
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {configs?.percentage?.length ? (
                configs.percentage
                  .slice()
                  .sort((a, b) => a - b)
                  .map((value, index) => (
                    <Chip
                      key={index}
                      label={`${value}%`}
                      color="primary"
                      sx={{ fontWeight: 600, mb: 1 }}
                      onDelete={() => setDeleteDialog({ open: true, value })}
                      deleteIcon={
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDialog({ open: true, value, oldValue: value });
                              }}
                            >
                              <Iconify icon="eva:edit-fill" width={16} />
                            </IconButton>
                          </Tooltip>
                          <Iconify icon="eva:trash-2-outline" width={18} />
                        </Stack>
                      }
                    />
                  ))
              ) : (
                <Typography color="text.secondary">No percentages added yet.</Typography>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, value: null })}
      >
        <DialogTitle>Delete Percentage</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the percentage "{deleteDialog.value}%"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, value: null })} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => handleDeletePercentage(deleteDialog.value)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, value: null })}>
        <DialogTitle>Edit Percentage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Percentage"
            type="number"
            fullWidth
            value={editDialog.value || ''}
            onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
            inputProps={{ min: 0, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, value: null })} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleEditPercentage} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
