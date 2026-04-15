import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthCreateView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [monthInput, setMonthInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editValue, setEditValue] = useState('');

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

  const handleAddMonth = async () => {
    if (!monthInput) {
      enqueueSnackbar('Month cannot be empty', { variant: 'warning' });
      return;
    }
    if (configs?.months?.includes(monthInput)) {
      enqueueSnackbar('This month already exists', { variant: 'info' });
      return;
    }

    try {
      setLoading(true);
      const updatedMonths = configs.months ? [...configs.months, monthInput] : [monthInput];
      await axios.put(URL, { ...configs, months: updatedMonths });
      enqueueSnackbar('Month added successfully', { variant: 'success' });
      setMonthInput('');
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to add month', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMonth = async (monthToDelete) => {
    try {
      setLoading(true);
      const updatedMonths = configs.months.filter((m) => m !== monthToDelete);
      await axios.put(URL, { ...configs, months: updatedMonths });
      enqueueSnackbar('Month deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete month', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleEditMonth = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      enqueueSnackbar('Month cannot be empty', { variant: 'warning' });
      return;
    }
    if (configs.months.includes(trimmed)) {
      enqueueSnackbar('This month already exists', { variant: 'info' });
      return;
    }

    try {
      setLoading(true);
      const updatedMonths = configs.months.map((m) => (m === editTarget ? trimmed : m));
      await axios.put(URL, { ...configs, months: updatedMonths });
      enqueueSnackbar('Month updated successfully', { variant: 'success' });
      setEditTarget(null);
      setEditValue('');
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to update month', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Manage Months
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader title="Add a Month" sx={{ p: 0, mb: 2 }} />
            <Autocomplete
              freeSolo
              options={MONTH_OPTIONS}
              value={monthInput}
              onInputChange={(_, newValue) => setMonthInput(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Month" variant="outlined" fullWidth />
              )}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddMonth}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:plus-fill" />
                )
              }
            >
              {loading ? 'Saving...' : 'Add Month'}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardHeader title="Existing Months" sx={{ p: 0, mb: 2 }} />
            <Divider sx={{ mb: 2 }} />
            {configs?.months && configs.months.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {configs.months.map((month, idx) => (
                  <Chip
                    key={idx}
                    label={month}
                    onClick={() => {
                      setEditTarget(month);
                      setEditValue(month);
                    }}
                    onDelete={() => setConfirmDelete(month)}
                    deleteIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    sx={{
                      fontSize: '0.9rem',
                      px: 1.5,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No months added yet.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleDeleteMonth(confirmDelete)}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogTitle>Edit Month</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Updated Month"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditMonth}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
