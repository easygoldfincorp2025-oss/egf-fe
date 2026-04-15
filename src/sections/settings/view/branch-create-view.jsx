import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFAutocomplete, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import countrystatecity from '../../../_mock/map/csc.json';
import { useGetBranch } from '../../../api/branch';
import { useGetConfigs } from '../../../api/config.js';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import axios from 'axios';

const validationSchema = yup.object().shape({
  name: yup.string().required('Branch Name is required'),
  email: yup.string().email('Invalid email address').nullable(),
  contact: yup.string().nullable(),
  address: yup.object().shape({
    street: yup.string().required('Street is required'),
    country: yup.string().required('Country is required'),
    state: yup.string().required('State is required'),
    city: yup.string().required('City is required'),
    zipcode: yup.string().required('Zipcode is required'),
  }),
  isActive: yup.boolean(),
  branchCode: yup.string().nullable(),
  series: yup.string().required('Series is required'),
});

export default function BranchCreateView() {
  const { branch, mutate } = useGetBranch();
  const { configs, mutate: configMutate } = useGetConfigs();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, branchId: null });

  const defaultValues = useMemo(
    () => ({
      name: '',
      email: '',
      contact: '',
      series: '',
      branchCode: '',
      address: { street: '', landmark: '', country: '', state: '', city: '', zipcode: '' },
      isActive: false,
    }),
    []
  );

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const { reset, handleSubmit, watch, setValue } = methods;

  const onSubmitBranchDetails = async (data) => {
    setLoading(true);
    const payload = {
      company: user?.company,
      name: data.name,
      email: data.email || null,
      series: data.series.toUpperCase(),
      contact: data.contact || null,
      branchCode: data.branchCode || null,
      address: { ...data.address },
      isActive: data.isActive,
    };
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/branch`;

    try {
      if (editingBranch) {
        await axios.put(`${URL}/${editingBranch._id}`, payload);
        enqueueSnackbar('Branch updated successfully', { variant: 'success' });
      } else {
        await axios.post(URL, payload);
        enqueueSnackbar('Branch added successfully', { variant: 'success' });
      }
      mutate();
      reset(defaultValues);
      setEditingBranch(null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while saving branch', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    reset(branch);
    setActiveTab(0);
  };

  const handleDeleteBranches = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/${user?.company}/branch`, {
        data: { ids: [id] },
      });
      enqueueSnackbar('Branch deleted successfully', { variant: 'success' });
      mutate();
    } catch (error) {
      enqueueSnackbar(error.message || 'Delete failed', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, branchId: null });
    }
  };

  const checkZipcode = async (zipcode) => {
    if (!zipcode || zipcode.length !== 6) return;
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${zipcode}`);
      const data = response.data[0];
      if (data.Status === 'Success') {
        setValue('address.country', data?.PostOffice[0]?.Country, { shouldValidate: true });
        setValue('address.state', data?.PostOffice[0]?.Circle, { shouldValidate: true });
        setValue('address.city', data?.PostOffice[0]?.District, { shouldValidate: true });
      } else {
        enqueueSnackbar('Invalid Zipcode', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('Failed to fetch zipcode info', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Manage Branches
        </Typography>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(e, newVal) => setActiveTab(newVal)}
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={editingBranch ? 'Edit Branch' : 'Add Branch'} />
        <Tab label="Branch List" />
      </Tabs>
      {activeTab === 0 && user?.role === 'Admin' && (
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Branch Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="name" label="Branch Name" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="series"
                  label="Series"
                  fullWidth
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  onChange={(e) =>
                    setValue('series', e.target.value.toUpperCase(), { shouldValidate: true })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="branchCode" label="Branch Code" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="email" label="Email" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="contact"
                  label="Phone Number"
                  fullWidth
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField
                  name="address.zipcode"
                  label="Zipcode"
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  onBlur={(e) => checkZipcode(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocomplete
                  name="address.country"
                  label="Country"
                  options={countrystatecity.map((c) => c.name)}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocomplete
                  name="address.state"
                  label="State"
                  options={
                    watch('address.country')
                      ? countrystatecity
                          .find((c) => c.name === watch('address.country'))
                          ?.states.map((s) => s.name) || []
                      : []
                  }
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocomplete
                  name="address.city"
                  label="City"
                  options={
                    watch('address.state')
                      ? countrystatecity
                          .find((c) => c.name === watch('address.country'))
                          ?.states.find((s) => s.name === watch('address.state'))
                          ?.cities.map((city) => city.name) || []
                      : []
                  }
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="address.street" label="Street" fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="address.landmark" label="Landmark" fullWidth />
              </Grid>
              {editingBranch && (
                <Grid item xs={12}>
                  <RHFSwitch name="isActive" label="Is Active" />
                </Grid>
              )}
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <LoadingButton
                  sx={{ mr: 2 }}
                  variant="outlined"
                  onClick={() => {
                    reset(defaultValues);
                    setEditingBranch(null);
                  }}
                >
                  Reset
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  onClick={handleSubmit(onSubmitBranchDetails)}
                  loading={loading}
                >
                  {editingBranch ? 'Update Branch' : 'Add Branch'}
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {branch.map((b) => (
            <Grid item xs={12} md={6} key={b._id}>
              <Card>
                <CardHeader
                  title={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {b.name} {b.isActive ? '' : '(Inactive)'}
                    </Typography>
                  }
                  action={
                    <Stack direction="row" spacing={1}>
                      {user?.role === 'Admin' && (
                        <>
                          <Tooltip title="Edit Branch">
                            <IconButton onClick={() => handleEditBranch(b)}>
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Branch">
                            <IconButton
                              color="error"
                              onClick={() => setDeleteDialog({ open: true, branchId: b._id })}
                            >
                              <Iconify icon="eva:trash-2-outline" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  }
                />
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Series:</strong> {b.series || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {b.email || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Contact:</strong> {b.contact || '-'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {b.address.street}, {b.address.city},{' '}
                      {b.address.state}, {b.address.country}, {b.address.zipcode}
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, branchId: null })}
      >
        <DialogTitle>Confirm Delete Branch?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, branchId: null })}>Cancel</Button>
          <Button color="error" onClick={() => handleDeleteBranches(deleteDialog.branchId)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
