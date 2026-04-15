import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
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

export default function BusinessTypeCreteView({ setTab }) {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [businessTypes, setBusinessTypes] = useState(configs?.businessType || []);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

  const handleAdd = async () => {
    const trimmedVal = inputVal.trim().toUpperCase();
    if (!trimmedVal)
      return enqueueSnackbar('Business type cannot be empty', { variant: 'warning' });
    if (businessTypes.includes(trimmedVal))
      return enqueueSnackbar('This business type already exists', { variant: 'info' });

    const updatedBusinessTypes = [...businessTypes, trimmedVal];
    const payload = { ...configs, businessType: updatedBusinessTypes };

    setLoading(true);
    try {
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setBusinessTypes(updatedBusinessTypes);
        setInputVal('');
        enqueueSnackbar('Business type added successfully', { variant: 'success' });
        setTab('Permission');
        mutate();
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to add business type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type) => {
    setDeleteTarget(type);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    const updatedBusinessTypes = businessTypes.filter((bt) => bt !== deleteTarget);
    const payload = { ...configs, businessType: updatedBusinessTypes };

    setLoading(true);
    try {
      await axios.put(URL, payload);
      setBusinessTypes(updatedBusinessTypes);
      enqueueSnackbar('Business type deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete business type', { variant: 'error' });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (type) => {
    setEditTarget(type);
    setEditVal(type);
  };

  const confirmEdit = async () => {
    const trimmedVal = editVal.trim().toUpperCase();
    if (!trimmedVal)
      return enqueueSnackbar('Business type cannot be empty', { variant: 'warning' });
    if (businessTypes.includes(trimmedVal) && trimmedVal !== editTarget)
      return enqueueSnackbar('This business type already exists', { variant: 'info' });

    const updatedBusinessTypes = businessTypes.map((bt) => (bt === editTarget ? trimmedVal : bt));
    const payload = { ...configs, businessType: updatedBusinessTypes };

    setLoading(true);
    try {
      await axios.put(URL, payload);
      setBusinessTypes(updatedBusinessTypes);
      setEditTarget(null);
      setEditVal('');
      enqueueSnackbar('Business type updated successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to update business type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = businessTypes.filter((bt) =>
    bt.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Manage Business Types
          </Typography>
          <Divider sx={{ mt: 1, mb: 3 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Add New Business Type
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Business Type"
              value={inputVal}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleAdd}
                loading={loading}
              >
                Add
              </LoadingButton>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, flexGrow: 1 }}>
                Existing Business Types
              </Typography>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Stack spacing={2} sx={{ overflowY: 'auto', pr: 1 }}>
              {filteredTypes.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 3 }}
                >
                  No business types found.
                </Typography>
              )}
              {filteredTypes.map((type, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 1,
                    justifyContent: 'space-between',
                    '&:hover': { boxShadow: 4, backgroundColor: 'grey.100' },
                  }}
                >
                  {editTarget === type ? (
                    <TextField
                      size="small"
                      fullWidth
                      value={editVal}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                      onChange={(e) => setEditVal(e.target.value)}
                      sx={{ mr: 2 }}
                    />
                  ) : (
                    <Typography>{type}</Typography>
                  )}
                  <Stack direction="row" spacing={1}>
                    {editTarget === type ? (
                      <>
                        <LoadingButton
                          size="small"
                          variant="contained"
                          onClick={confirmEdit}
                          loading={loading}
                        >
                          Save
                        </LoadingButton>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => {
                            setEditTarget(null);
                            setEditVal('');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(type)} color="primary">
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(type)} color="error">
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the business type "{deleteTarget}"? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <LoadingButton color="error" onClick={confirmDelete} loading={loading}>
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
