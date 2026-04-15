import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function AreaCreteView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [inputVal, setInputVal] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState(configs?.area || []);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, name: '' });
  const [editDialog, setEditDialog] = useState({ open: false, oldName: '', newName: '' });

  const filteredAreas = useMemo(() => {
    return area.filter((a) => a.toLowerCase().includes(search.toLowerCase()));
  }, [search, area]);

  const saveAreas = async (updatedArea, successMsg) => {
    try {
      setLoading(true);
      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, area: updatedArea };

      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setArea(updatedArea);
        enqueueSnackbar(successMsg, { variant: 'success' });
        mutate();
      }
    } catch (err) {
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = () => {
    const trimmedVal = inputVal.trim().toUpperCase();
    if (!trimmedVal) {
      enqueueSnackbar('Area name cannot be empty', { variant: 'warning' });
      return;
    }
    if (area.includes(trimmedVal)) {
      enqueueSnackbar('Area already exists', { variant: 'info' });
      return;
    }
    const updatedArea = [...area, trimmedVal];
    saveAreas(updatedArea, 'Area added successfully');
    setInputVal('');
  };

  const handleDelete = (name) => {
    setDeleteDialog({ open: true, name });
  };

  const confirmDelete = () => {
    const updatedArea = area.filter((a) => a !== deleteDialog.name);
    saveAreas(updatedArea, 'Area deleted successfully');
    setDeleteDialog({ open: false, name: '' });
  };

  const handleEdit = (name) => {
    setEditDialog({ open: true, oldName: name, newName: name });
  };

  const confirmEdit = () => {
    const trimmedVal = editDialog.newName.trim().toUpperCase();
    if (!trimmedVal) {
      enqueueSnackbar('Area name cannot be empty', { variant: 'warning' });
      return;
    }
    if (area.includes(trimmedVal) && trimmedVal !== editDialog.oldName) {
      enqueueSnackbar('Area already exists', { variant: 'info' });
      return;
    }

    const updatedArea = area.map((a) => (a === editDialog.oldName ? trimmedVal : a));
    saveAreas(updatedArea, 'Area updated successfully');
    setEditDialog({ open: false, oldName: '', newName: '' });
  };

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Add New Area
            </Typography>
            <TextField
              fullWidth
              label="Area Name"
              variant="outlined"
              value={inputVal}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
            />
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              onClick={handleAddArea}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Saving...' : 'Add Area'}
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Existing Areas
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search areas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-linear" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {filteredAreas.length}
              </Typography>
              {filteredAreas.length === 0 ? (
                <Typography color="text.secondary">No areas found.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredAreas.map((name, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        sx={{
                          p: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                        }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
                        <Box>
                          <IconButton color="primary" onClick={() => handleEdit(name)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(name)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, name: '' })}>
        <DialogTitle>Delete Area</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, name: '' })} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, oldName: '', newName: '' })}>
        <DialogTitle>Edit Area</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label="Area Name"
            value={editDialog.newName}
            onChange={(e) => setEditDialog((prev) => ({ ...prev, newName: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, oldName: '', newName: '' })} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmEdit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
