import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
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

export default function ChargeTypeView({ setTab }) {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [inputVal, setInputVal] = useState('');
  const [chargeTypes, setChargeTypes] = useState(configs?.chargeType || []);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const filteredTypes = useMemo(() => {
    if (!search.trim()) return chargeTypes;
    return chargeTypes.filter((t) => t.toLowerCase().includes(search.toLowerCase()));
  }, [search, chargeTypes]);

  const handleAdd = async () => {
    const newVal = inputVal.trim().toUpperCase();
    if (!newVal) {
      enqueueSnackbar('Charge type cannot be empty', { variant: 'warning' });
      return;
    }
    if (chargeTypes.some((t) => t.toUpperCase() === newVal)) {
      enqueueSnackbar('This charge type already exists', { variant: 'info' });
      return;
    }
    const newChargeTypes = [...chargeTypes, newVal];
    setLoading(true);
    try {
      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      await axios.put(URL, { ...configs, chargeType: newChargeTypes });
      setChargeTypes(newChargeTypes);
      setInputVal('');
      enqueueSnackbar('Charge type added successfully', { variant: 'success' });
      setTab('Permission');
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to add charge type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const updatedChargeTypes = chargeTypes.filter((type) => type !== deleteTarget);
    setLoading(true);
    try {
      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      await axios.put(URL, { ...configs, chargeType: updatedChargeTypes });
      setChargeTypes(updatedChargeTypes);
      enqueueSnackbar('Charge type deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete charge type', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEditConfirm = async () => {
    const newVal = editValue.trim().toUpperCase();
    if (!newVal) {
      enqueueSnackbar('Charge type cannot be empty', { variant: 'warning' });
      return;
    }
    if (chargeTypes.some((t) => t.toUpperCase() === newVal && t !== editTarget)) {
      enqueueSnackbar('This charge type already exists', { variant: 'info' });
      return;
    }

    const updatedChargeTypes = chargeTypes.map((t) => (t === editTarget ? newVal : t));
    setLoading(true);
    try {
      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      await axios.put(URL, { ...configs, chargeType: updatedChargeTypes });
      setChargeTypes(updatedChargeTypes);
      enqueueSnackbar('Charge type updated successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to update charge type', { variant: 'error' });
    } finally {
      setLoading(false);
      setEditTarget(null);
      setEditValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, md: 2 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Add New Charge Type
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Charge Type"
              placeholder="Enter new charge type"
              value={inputVal}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={loading}
                startIcon={loading && <CircularProgress size={18} />}
              >
                Add
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Existing Charge Types
              </Typography>
              <TextField
                size="small"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-linear" />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <Iconify icon="solar:close-circle-linear" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {filteredTypes.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  py: 6,
                }}
              >
                <Iconify
                  icon="solar:document-add-linear"
                  width={48}
                  height={48}
                  sx={{ opacity: 0.5, mb: 1 }}
                />
                <Typography>No charge types found</Typography>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {filteredTypes.map((type, index) => (
                  <Chip
                    key={index}
                    label={type}
                    color="primary"
                    onDelete={() => setDeleteTarget(type)}
                    deleteIcon={
                      <Tooltip title="Delete">
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </Tooltip>
                    }
                    onClick={() => {
                      setEditTarget(type);
                      setEditValue(type);
                    }}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      '& .MuiChip-label': { fontWeight: 500 },
                      '&:hover': { opacity: 0.9 },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:trash-bin-trash-bold" color="error.main" />
          Confirm Delete
        </DialogTitle>
        <Divider />
        <Box sx={{ px: 3, py: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget}</strong>? This action cannot be
            undone.
          </Typography>
        </Box>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={handleDeleteConfirm}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} /> : <Iconify icon="solar:trash-bin-2-bold" />
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:pen-bold" color="primary.main" />
          Edit Charge Type
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Charge Type"
            value={editValue}
            inputProps={{ style: { textTransform: 'uppercase' } }}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={loading}
            autoFocus
            helperText="Enter a unique name for this charge type"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setEditTarget(null)}
            disabled={loading}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditConfirm}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} /> : <Iconify icon="solar:check-circle-bold" />
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
