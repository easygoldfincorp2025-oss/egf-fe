import React, { useMemo, useState } from 'react';
import {
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
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetConfigs } from 'src/api/config';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function OtherNameCreateView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [otherName, setOtherName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editValue, setEditValue] = useState('');

  const filteredOtherNames = useMemo(() => {
    if (!configs?.otherNames) return [];
    return configs.otherNames.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [configs, search]);

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

  const handleAddOtherName = async () => {
    const trimmedName = otherName.trim().toUpperCase();
    if (!trimmedName) {
      enqueueSnackbar('Other name cannot be empty', { variant: 'warning' });
      return;
    }
    if (configs?.otherNames?.includes(trimmedName)) {
      enqueueSnackbar('Other name already exists', { variant: 'info' });
      return;
    }

    setLoading(true);
    const updatedOtherNames = configs.otherNames
      ? [...configs.otherNames, trimmedName]
      : [trimmedName];

    try {
      await axios.put(URL, { ...configs, otherNames: updatedOtherNames });
      enqueueSnackbar('Other name added successfully', { variant: 'success' });
      setOtherName('');
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to add other name', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOtherName = async () => {
    setLoading(true);
    const updatedOtherNames = configs.otherNames.filter((n) => n !== deleteTarget);

    try {
      await axios.put(URL, { ...configs, otherNames: updatedOtherNames });
      enqueueSnackbar('Other name deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete other name', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEditOtherName = async () => {
    const trimmedName = editValue.trim().toUpperCase();
    if (!trimmedName) {
      enqueueSnackbar('Name cannot be empty', { variant: 'warning' });
      return;
    }
    if (configs.otherNames.includes(trimmedName)) {
      enqueueSnackbar('This name already exists', { variant: 'info' });
      return;
    }

    setLoading(true);
    const updatedOtherNames = configs.otherNames.map((n) =>
      n === editTarget ? trimmedName : n
    );

    try {
      await axios.put(URL, { ...configs, otherNames: updatedOtherNames });
      enqueueSnackbar('Other name updated successfully', { variant: 'success' });
      setEditTarget(null);
      setEditValue('');
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to update other name', { variant: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }} elevation={3}>
            <Typography variant="h6" fontWeight={600}>
              Add New Other Name
            </Typography>
            <TextField
              label="Other Name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value.toUpperCase())}
              fullWidth
              placeholder="Enter other name"
              InputProps={{ sx: { textTransform: 'uppercase' } }}
            />
            <Button
              variant="contained"
              onClick={handleAddOtherName}
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} color="inherit" />}
            >
              Add Name
            </Button>
            <Divider sx={{ my: 1 }} />
            <TextField
              label="Search Names"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              placeholder="Search by name"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {search ? (
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    ) : (
                      <Iconify icon="eva:search-fill" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title="Manage Other Names"
              subheader="Edit or delete existing names"
              sx={{ px: 0 }}
            />
            <Divider sx={{ my: 2 }} />
            {filteredOtherNames.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No other names found.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {filteredOtherNames.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    color="primary"
                    variant="outlined"
                    onDelete={() => setDeleteTarget(name)}
                    deleteIcon={
                      <Tooltip title="Delete">
                        <Iconify icon="eva:trash-2-outline" />
                      </Tooltip>
                    }
                    onClick={() => {
                      setEditTarget(name);
                      setEditValue(name);
                    }}
                    sx={{ mb: 1, cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{deleteTarget}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDeleteOtherName}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} color="inherit" />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)}>
        <DialogTitle>Edit Other Name</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Updated Name"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.toUpperCase())}
            sx={{ mt: 2 }}
            InputProps={{ sx: { textTransform: 'uppercase' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditOtherName}
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
