import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function ExpenseTypeCreateView({ setTab }) {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [inputVal, setInputVal] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState(configs?.expenseType || []);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null });
  const [editingType, setEditingType] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const filteredExpenseTypes = useMemo(
    () => expenseTypes.filter((t) => t.toLowerCase().includes(search.toLowerCase())),
    [expenseTypes, search]
  );

  const handleAddOrUpdate = async () => {
    const val = inputVal.trim().toUpperCase();
    if (!val) {
      enqueueSnackbar('Expense type cannot be empty', { variant: 'warning' });
      return;
    }
    if (expenseTypes.includes(val) && editingType !== val) {
      enqueueSnackbar('This expense type already exists', { variant: 'error' });
      return;
    }

    const updatedExpenseTypes = editingType
      ? expenseTypes.map((t) => (t === editingType ? val : t))
      : [...expenseTypes, val];

    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, expenseType: updatedExpenseTypes };

    try {
      setLoading(true);
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setExpenseTypes(updatedExpenseTypes);
        setInputVal('');
        setEditingType(null);
        enqueueSnackbar(
          editingType ? 'Expense type updated successfully' : 'Expense type added successfully',
          { variant: 'success' }
        );
        mutate();
        if (!editingType) setTab('Permission');
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Something went wrong. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (type) => {
    setDeleteDialog({ open: true, type });
  };

  const handleDelete = async () => {
    const type = deleteDialog.type;
    const updatedExpenseTypes = expenseTypes.filter((t) => t !== type);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, expenseType: updatedExpenseTypes };

    try {
      setLoading(true);
      await axios.put(URL, payload);
      setExpenseTypes(updatedExpenseTypes);
      enqueueSnackbar('Expense type deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete expense type', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, type: null });
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {editingType ? 'Edit Expense Type' : 'Add Expense Type'}
            </Typography>
            <TextField
              fullWidth
              label="Expense Type"
              value={inputVal}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              onChange={(e) => setInputVal(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {editingType && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setEditingType(null);
                    setInputVal('');
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleAddOrUpdate}
                disabled={loading}
                startIcon={<Iconify icon={editingType ? 'eva:edit-fill' : 'eva:plus-fill'} />}
              >
                {editingType ? 'Update' : 'Add'}
              </Button>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search expense types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            {filteredExpenseTypes.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No expense types found.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {filteredExpenseTypes.map((type, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{type}</Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                          setEditingType(type);
                          setInputVal(type);
                        }}
                      >
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => confirmDelete(type)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{deleteDialog.type}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: null })}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
