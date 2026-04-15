import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Grid,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useGetConfigs } from 'src/api/config';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function RolesCreatePage({ setTab }) {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editVal, setEditVal] = useState('');

  const roles = configs?.roles || [];

  const filteredRoles = useMemo(
    () => roles.filter((role) => role.toLowerCase().includes(searchVal.toLowerCase())),
    [roles, searchVal]
  );

  const handleAdd = async () => {
    if (!inputVal.trim()) return enqueueSnackbar('Role cannot be empty', { variant: 'warning' });
    if (roles.includes(inputVal.trim()))
      return enqueueSnackbar('Role already exists', { variant: 'info' });

    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, roles: [...roles, inputVal.trim()] };

      const res = await axios.put(url, payload);
      if (res.status === 200) {
        setInputVal('');
        enqueueSnackbar('Role added successfully', { variant: 'success' });
        setTab('Permission');
        mutate();
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to add role', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const updatedRoles = roles.filter((r) => r !== deleteTarget);
      const url = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, roles: updatedRoles };

      await axios.put(url, payload);
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete role', { variant: 'error' });
    } finally {
      setLoading(false);
      setAnchorEl(null);
      setDeleteTarget(null);
    }
  };

  const handleEditSave = async () => {
    if (!editVal.trim()) return enqueueSnackbar('Role cannot be empty', { variant: 'warning' });
    if (roles.includes(editVal.trim()))
      return enqueueSnackbar('Role already exists', { variant: 'info' });

    try {
      setLoading(true);
      const updatedRoles = roles.map((r, i) => (i === editIndex ? editVal.trim() : r));
      const url = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
      const payload = { ...configs, roles: updatedRoles };

      await axios.put(url, payload);
      enqueueSnackbar('Role updated successfully', { variant: 'success' });
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to update role', { variant: 'error' });
    } finally {
      setLoading(false);
      setEditIndex(null);
      setEditVal('');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <CardHeader title="Add New Role" />
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Role Name"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <LoadingButton
                fullWidth
                variant="contained"
                loading={loading}
                onClick={handleAdd}
                startIcon={<Iconify icon="solar:add-circle-bold" />}
              >
                Add Role
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6">Manage Roles</Typography>
                  <Chip label={`${roles.length} total`} size="small" />
                </Stack>
              }
              action={
                <TextField
                  size="small"
                  placeholder="Search roles..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-outline" />
                      </InputAdornment>
                    ),
                  }}
                />
              }
            />
            <Box sx={{ mt: 2 }}>
              {filteredRoles.length ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {filteredRoles.map((role, i) => (
                    <Chip
                      key={i}
                      label={
                        editIndex === i ? (
                          <TextField
                            size="small"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                            autoFocus
                            sx={{ minWidth: 120 }}
                          />
                        ) : (
                          role
                        )
                      }
                      variant="outlined"
                      onDelete={() => {
                        setAnchorEl(document.body);
                        setDeleteTarget(role);
                      }}
                      deleteIcon={
                        <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
                      }
                      onClick={() => {
                        if (editIndex !== i) {
                          setEditIndex(i);
                          setEditVal(role);
                        }
                      }}
                      sx={{
                        px: 1,
                        py: 0.5,
                        fontWeight: 500,
                        bgcolor: 'background.neutral',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  {searchVal ? 'No roles match your search.' : 'No roles added yet.'}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Popover
        open={!!deleteTarget}
        anchorEl={anchorEl}
        onClose={() => {
          setDeleteTarget(null);
          setAnchorEl(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, maxWidth: 240 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Delete role <b>{deleteTarget}</b>?
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <LoadingButton
              size="small"
              color="error"
              variant="contained"
              loading={loading}
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
