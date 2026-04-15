import React, { useState } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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
import { useGetEmployee } from '../../../api/employee.js';

export default function DeviceAccessView() {
  const { user } = useAuthContext();
  const { employee: employees } = useGetEmployee();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [deviceInput, setDeviceInput] = useState({ employee: null, macAddress: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [currentIp, setCurrentIp] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null });

  const handleGetCurrentIp = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_HOST_API}/api/ip`);
      if (res.data?.ip) {
        setCurrentIp(res.data.ip);
        enqueueSnackbar(`Your IP address: ${res.data.ip}`, { variant: 'info' });
      } else {
        enqueueSnackbar('IP address not found in response', { variant: 'warning' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to fetch IP address', { variant: 'error' });
    }
  };

  const handleCopyIp = () => {
    if (currentIp) {
      navigator.clipboard.writeText(currentIp);
      enqueueSnackbar('IP address copied to clipboard', { variant: 'success' });
    }
  };

  const handleAddOrUpdateDevice = () => {
    if (!deviceInput.employee || !deviceInput.macAddress.trim()) {
      enqueueSnackbar('Employee and MAC address are required', { variant: 'warning' });
      return;
    }

    const newDevice = {
      employee: {
        userId: deviceInput.employee.user?._id,
        name: `${deviceInput.employee?.user.firstName || ''} ${deviceInput.employee?.user.middleName || ''} ${deviceInput.employee?.user.lastName || ''}`.trim(),
      },
      macAddress: deviceInput.macAddress.trim(),
    };

    let updatedDevices = configs?.devices ? [...configs.devices] : [];
    if (editIndex !== null) {
      updatedDevices[editIndex] = newDevice;
    } else {
      updatedDevices.push(newDevice);
    }

    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, devices: updatedDevices };

    axios
      .put(URL, payload)
      .then(() => {
        enqueueSnackbar(
          editIndex !== null ? 'Device updated successfully' : 'Device added successfully',
          { variant: 'success' }
        );
        mutate();
        handleResetForm();
      })
      .catch((err) => {
        enqueueSnackbar('Failed to save device', { variant: 'error' });
        console.log(err);
      });
  };

  const handleEditDevice = (device, index) => {
    const fullEmployee = employees.find((emp) => emp.user._id === device.employee.userId);
    setDeviceInput({ employee: fullEmployee || null, macAddress: device.macAddress });
    setEditIndex(index);
  };

  const confirmDeleteDevice = (index) => {
    setDeleteDialog({ open: true, index });
  };

  const handleDeleteDevice = () => {
    const updatedDevices = configs.devices.filter((_, i) => i !== deleteDialog.index);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    const payload = { ...configs, devices: updatedDevices };

    axios
      .put(URL, payload)
      .then(() => {
        enqueueSnackbar('Device deleted successfully', { variant: 'success' });
        mutate();
        if (editIndex === deleteDialog.index) {
          handleResetForm();
        }
        setDeleteDialog({ open: false, index: null });
      })
      .catch((err) => {
        enqueueSnackbar('Failed to delete device', { variant: 'error' });
        console.log(err);
      });
  };

  const handleResetForm = () => {
    setDeviceInput({ employee: null, macAddress: '' });
    setEditIndex(null);
  };

  const filteredDevices = configs?.devices?.filter(
    (device) =>
      device.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.macAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Device Access Management
        </Typography>
        <Chip label={`${configs?.devices?.length || 0} Devices`} color="primary" />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              title={editIndex !== null ? 'Edit Device' : 'Add New Device'}
              subheader="Assign devices to employees for access control"
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Autocomplete
                  options={employees || []}
                  getOptionLabel={(option) =>
                    `${option.user.firstName || ''} ${option.user.middleName || ''} ${option.user.lastName || ''}`
                  }
                  value={deviceInput.employee}
                  onChange={(_, newValue) => setDeviceInput({ ...deviceInput, employee: newValue })}
                  renderInput={(params) => <TextField {...params} label="Employee Name" />}
                />
                <TextField
                  fullWidth
                  label="MAC Address"
                  value={deviceInput.macAddress}
                  onChange={(e) => setDeviceInput({ ...deviceInput, macAddress: e.target.value })}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title="Fetch your current IP address">
                    <Button variant="outlined" onClick={handleGetCurrentIp}>
                      Get Current IP
                    </Button>
                  </Tooltip>
                  {currentIp && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                      <TextField
                        value={currentIp}
                        size="small"
                        InputProps={{ readOnly: true }}
                        sx={{ flex: 1 }}
                      />
                      <Tooltip title="Copy IP address">
                        <IconButton color="primary" onClick={handleCopyIp}>
                          <Iconify icon="solar:copy-bold" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color={editIndex !== null ? 'warning' : 'primary'}
                    onClick={handleAddOrUpdateDevice}
                    startIcon={<Iconify icon="solar:add-square-bold" />}
                    fullWidth
                  >
                    {editIndex !== null ? 'Update Device' : 'Add Device'}
                  </Button>
                  {editIndex !== null && (
                    <Button variant="outlined" color="inherit" onClick={handleResetForm} fullWidth>
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardHeader
              title="Devices List"
              subheader="Manage registered devices"
              action={
                <TextField
                  size="small"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-linear" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {filteredDevices?.length > 0 ? (
                  filteredDevices.map((device, index) => (
                    <Grid key={index} item xs={12} sm={6}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          transition: '0.2s',
                          '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {device.employee.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {device.employee.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            <strong>MAC:</strong> {device.macAddress}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Tooltip title="Edit Device">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditDevice(device, index)}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Device">
                              <IconButton color="error" onClick={() => confirmDeleteDevice(index)}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No devices found.
                  </Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, index: null })}
      >
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this device?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, index: null })}>Cancel</Button>
          <Button onClick={handleDeleteDevice} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
