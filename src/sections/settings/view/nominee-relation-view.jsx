import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function NomineeRelationView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const [inputVal, setInputVal] = useState('');
  const [search, setSearch] = useState('');
  const [relation, setRelation] = useState(() =>
    Array.isArray(configs?.nomineeRelation) ? configs.nomineeRelation : []
  );

  useEffect(() => {
    if (!configs || Array.isArray(configs)) return;
    setRelation(Array.isArray(configs.nomineeRelation) ? configs.nomineeRelation : []);
  }, [configs]);
  const [editIndex, setEditIndex] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, name: '' });

  const { enqueueSnackbar } = useSnackbar();

  const filteredRelations = useMemo(() => {
    return relation.filter((r) => r.toLowerCase().includes(search.toLowerCase()));
  }, [relation, search]);

  const handleAdd = async () => {
    const newVal = inputVal.trim().toUpperCase();

    if (!newVal) {
      enqueueSnackbar('Nominee relation cannot be empty', { variant: 'warning' });
      return;
    }
    if (relation.includes(newVal)) {
      enqueueSnackbar('This relation already exists', { variant: 'info' });
      return;
    }

    const updatedRelation = [...relation, newVal];
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, nomineeRelation: updatedRelation };

    try {
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        setInputVal('');
        setRelation(updatedRelation);
        enqueueSnackbar('Relation added successfully', { variant: 'success' });
        mutate();
      }
    } catch (err) {
      enqueueSnackbar('Failed to add relation', { variant: 'error' });
      console.error(err);
    }
  };

  const handleUpdate = async (index) => {
    const newVal = editVal.trim().toUpperCase();
    if (!newVal) {
      enqueueSnackbar('Relation cannot be empty', { variant: 'warning' });
      return;
    }
    if (relation.includes(newVal) && relation[index] !== newVal) {
      enqueueSnackbar('This relation already exists', { variant: 'info' });
      return;
    }

    const updatedRelation = [...relation];
    updatedRelation[index] = newVal;

    const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, nomineeRelation: updatedRelation };

    try {
      await axios.put(apiEndpoint, payload);
      setRelation(updatedRelation);
      enqueueSnackbar('Relation updated successfully', { variant: 'success' });
      setEditIndex(null);
      setEditVal('');
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to update relation', { variant: 'error' });
      console.error(err);
    }
  };

  const handleDelete = async () => {
    const updatedArea = relation.filter((a) => a !== deleteDialog.name);
    const apiEndpoint = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, nomineeRelation: updatedArea };

    try {
      await axios.put(apiEndpoint, payload);
      setRelation(updatedArea);
      enqueueSnackbar('Relation deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete relation', { variant: 'error' });
      console.error(err);
    } finally {
      setDeleteDialog({ open: false, name: '' });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Add Nominee Relation" subheader="Manage nominee relationship types" />
            <Divider />
            <CardContent>
              <TextField
                fullWidth
                name="relation"
                variant="outlined"
                label="Nominee Relation"
                value={inputVal}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />

              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  onClick={handleAdd}
                  startIcon={<Iconify icon="solar:add-circle-bold" />}
                >
                  Add Relation
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Nominee Relations"
              subheader="All saved nominee relations"
              action={
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-bold" />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch('')}>
                          <Iconify icon="eva:close-fill" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              }
            />
            <Divider />
            <CardContent>
              {filteredRelations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Iconify
                    icon="solar:user-id-bold-duotone"
                    sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No relations found. Add a new one from the left panel.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredRelations.map((name, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.neutral',
                          boxShadow: 1,
                          '&:hover': { boxShadow: 3 },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {editIndex === index ? (
                          <TextField
                            size="small"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(index)}
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                          />
                        ) : (
                          <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
                        )}

                        <Stack direction="row" spacing={1}>
                          {editIndex === index ? (
                            <>
                              <Tooltip title="Save">
                                <IconButton color="success" onClick={() => handleUpdate(index)}>
                                  <Iconify icon="eva:checkmark-circle-2-fill" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  color="warning"
                                  onClick={() => {
                                    setEditIndex(null);
                                    setEditVal('');
                                  }}
                                >
                                  <Iconify icon="eva:close-circle-fill" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    setEditIndex(index);
                                    setEditVal(name);
                                  }}
                                >
                                  <Iconify icon="eva:edit-fill" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  color="error"
                                  onClick={() => setDeleteDialog({ open: true, name })}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, name: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <b>{deleteDialog.name}</b>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, name: '' })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
