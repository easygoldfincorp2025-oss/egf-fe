import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { RHFAutocomplete, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Iconify from 'src/components/iconify';
import { useGetCompanyDetails } from '../../../api/company_details';
import { ACCOUNT_TYPE_OPTIONS } from '../../../_mock';
import { useDispatch } from 'react-redux';
import { updateConfigs } from '../slices/configSlice';
import { useGetConfigs } from '../../../api/config';
import { useGetBranch } from '../../../api/branch';

const personalDetailsSchema = yup.object().shape({
  logo_url: yup.mixed().required('Logo is required'),
  name: yup.string().required('Company Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  contact: yup
    .string()
    .matches(/^[0-9]+$/, 'Only numbers allowed')
    .required('Phone Number is required'),
});

const bankDetailsSchema = yup.object().shape({
  accountNumber: yup.string().required('Account Number is required'),
  accountType: yup.string().required('Account Type is required'),
  accountHolderName: yup.string().required('Account Holder Name is required'),
  bankName: yup.string().required('Bank Name is required'),
  IFSC: yup.string().required('IFSC Code is required'),
  branchName: yup.string().required('Branch Name is required'),
});

export default function CompanyProfile() {
  const { user } = useAuthContext();
  const dispatch = useDispatch();
  const { companyDetail, companyMutate } = useGetCompanyDetails();
  const { enqueueSnackbar } = useSnackbar();
  const { branch } = useGetBranch();
  const { configs, mutate } = useGetConfigs();
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [editingBankDetail, setEditingBankDetail] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, detail: null });
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [showAccountNumber, setShowAccountNumber] = useState({}); // For masking numbers

  const personalDetailsMethods = useForm({
    defaultValues: {
      logo_url: companyDetail?.logo_url || '',
      name: companyDetail?.name || '',
      email: companyDetail?.email || '',
      contact: companyDetail?.contact || '',
      savant: configs?.savant || '',
      branch: configs?.headersConfig?.branch || null,
      webUrl: configs?.headersConfig?.companyDetail?.webUrl || '',
    },
    resolver: yupResolver(personalDetailsSchema),
  });

  const bankDetailsMethods = useForm({
    defaultValues: {
      accountNumber: editingBankDetail?.accountNumber || '',
      accountType: editingBankDetail?.accountType || '',
      accountHolderName: editingBankDetail?.accountHolderName || '',
      bankName: editingBankDetail?.bankName || '',
      IFSC: editingBankDetail?.IFSC || '',
      branch: editingBankDetail
        ? { label: editingBankDetail?.branch?.name, value: editingBankDetail?.branch?._id }
        : null,
      branchName: editingBankDetail?.branchName || '',
    },
    resolver: yupResolver(bankDetailsSchema),
  });

  const { reset: resetPersonalDetails, handleSubmit: handleSubmitPersonalDetails } =
    personalDetailsMethods;
  const { reset: resetBankDetails, handleSubmit: handleSubmitBankDetails } = bankDetailsMethods;

  useEffect(() => {
    if (editingBankDetail) {
      bankDetailsMethods.reset({
        accountNumber: editingBankDetail.accountNumber || '',
        accountType: editingBankDetail.accountType || '',
        accountHolderName: editingBankDetail.accountHolderName || '',
        bankName: editingBankDetail.bankName || '',
        IFSC: editingBankDetail.IFSC || '',
        branchName: editingBankDetail.branchName || '',
        branch: editingBankDetail?.branch
          ? { label: editingBankDetail.branch.name, value: editingBankDetail.branch._id }
          : null,
      });
    } else {
      bankDetailsMethods.reset({
        accountNumber: '',
        accountType: '',
        accountHolderName: '',
        bankName: '',
        IFSC: '',
        branchName: '',
        branch: null,
      });
    }
  }, [editingBankDetail, bankDetailsMethods, configs]);

  const onSubmitPersonalDetails = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        contact: data.contact,
        webUrl: data.webUrl,
      };
      const details = { companyDetail: payload, branch: data.branch };
      const payload2 = { ...configs, headersConfig: details, savant: data.savant };

      const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}`;
      const URL2 = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;

      await axios.put(URL, payload);
      await axios.put(URL2, payload2);

      companyMutate();
      mutate();
      enqueueSnackbar('Personal details updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'An error occurred', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitBankDetails = async (data) => {
    setLoading2(true);
    const newBankAccount = {
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      IFSC: data.IFSC.toUpperCase(),
      branchName: data.branchName,
      branch: data.branch?.value,
    };

    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}`;
    try {
      const response = await axios.get(URL);
      const existingBankAccounts = response.data.data.bankAccounts || [];

      if (editingBankDetail) {
        const updatedBankAccounts = existingBankAccounts.map((account) =>
          account._id === editingBankDetail._id ? { ...newBankAccount, _id: account._id } : account
        );
        await axios.put(URL, { bankAccounts: updatedBankAccounts });
      } else {
        const updatedBankAccounts = [...existingBankAccounts, newBankAccount];
        await axios.put(URL, { bankAccounts: updatedBankAccounts });
      }

      companyMutate();
      enqueueSnackbar(
        editingBankDetail ? 'Bank details updated successfully' : 'Bank details added successfully',
        {
          variant: 'success',
        }
      );

      resetBankDetails();
      setEditingBankDetail(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'An error occurred', { variant: 'error' });
    } finally {
      setLoading2(false);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, { preview: URL.createObjectURL(file) });
      if (file) {
        setProfilePic(file);
        personalDetailsMethods.setValue('logo_url', newFile, { shouldValidate: true });
        if (companyDetail) {
          const formData = new FormData();
          formData.append('company-logo', file);
          dispatch(updateConfigs({ companyId: user.company, payload: formData }));
        }
      }
    },
    [personalDetailsMethods]
  );

  const handleEditBankDetail = (detail) => {
    setEditingBankDetail(detail);
    bankDetailsMethods.reset(detail);
    bankDetailsMethods.setValue('branch', {
      label: detail?.branch?.name,
      value: detail?.branch?._id,
    });
  };

  const handleDeleteBankDetail = async () => {
    if (!deleteDialog.detail) return;
    setLoading2(true);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}`;
    try {
      const response = await axios.get(URL);
      const existingBankAccounts = response.data.data.bankAccounts || [];
      const updatedBankAccounts = existingBankAccounts.filter(
        (account) => account._id !== deleteDialog.detail._id
      );
      await axios.put(URL, { bankAccounts: updatedBankAccounts });
      companyMutate();
      enqueueSnackbar('Bank details deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'An error occurred', { variant: 'error' });
    } finally {
      setLoading2(false);
      setDeleteDialog({ open: false, detail: null });
    }
  };

  const filteredAccounts = companyDetail?.bankAccounts?.filter(
    (acc) =>
      acc.bankName.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountHolderName.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountNumber.includes(search)
  );

  return (
    <Card>
      <CardHeader
        title="🏢 Company Profile"
        subheader="Manage your company information & accounts"
      />
      <Divider />

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="fullWidth"
        sx={{ px: 2 }}
      >
        <Tab label="Profile Info" />
        <Tab label="Bank Accounts" />
      </Tabs>
      <Divider />
      {tab === 0 && (
        <FormProvider methods={personalDetailsMethods}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12} textAlign="center">
                <RHFUploadAvatar name="logo_url" onDrop={handleDrop} />
                <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                  Allowed *.jpeg, *.jpg, *.png — Max size 3MB.
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Stack spacing={3}>
                  <Box
                    columnGap={2}
                    rowGap={3}
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                  >
                    <RHFTextField
                      name="name"
                      label="Company Name"
                      helperText="Legal registered name"
                    />
                    <RHFTextField
                      name="email"
                      label="Email Address"
                      helperText="Official email ID"
                    />
                    <RHFTextField
                      name="contact"
                      label="Phone Number"
                      inputProps={{ inputMode: 'numeric' }}
                    />
                    <RHFTextField name="savant" label="Savant" />
                    <RHFTextField name="webUrl" label="Website URL" />
                  </Box>
                  <Stack direction="row" justifyContent="flex-end" spacing={2}>
                    <LoadingButton
                      onClick={handleSubmitPersonalDetails(onSubmitPersonalDetails)}
                      variant="contained"
                      loading={loading}
                    >
                      Save Changes
                    </LoadingButton>
                    <LoadingButton variant="outlined" onClick={() => resetPersonalDetails()}>
                      Reset
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </FormProvider>
      )}
      {tab === 1 && (
        <FormProvider methods={bankDetailsMethods}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    {editingBankDetail ? '✏️ Edit Bank Account' : '➕ Add New Bank Account'}
                  </Typography>
                  <Stack spacing={2}>
                    <RHFAutocomplete
                      name="branch"
                      label="Branch"
                      placeholder="Choose a Branch"
                      options={
                        branch?.map((branchItem) => ({
                          label: branchItem?.name,
                          value: branchItem?._id,
                        })) || []
                      }
                      isOptionEqualToValue={(option, value) => option?.value === value?.value}
                    />
                    <RHFTextField name="accountNumber" label="Account Number" />
                    <RHFAutocomplete
                      name="accountType"
                      label="Account Type"
                      options={ACCOUNT_TYPE_OPTIONS}
                    />
                    <RHFTextField name="accountHolderName" label="Account Holder Name" />
                    <RHFTextField name="bankName" label="Bank Name" />
                    <RHFTextField
                      name="IFSC"
                      label="IFSC Code"
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                    <RHFTextField name="branchName" label="Branch Name" />
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <LoadingButton
                        onClick={handleSubmitBankDetails(onSubmitBankDetails)}
                        variant="contained"
                        loading={loading2}
                      >
                        {editingBankDetail ? 'Update' : 'Add'}
                      </LoadingButton>
                      {editingBankDetail && (
                        <LoadingButton
                          variant="outlined"
                          onClick={() => {
                            resetBankDetails();
                            setEditingBankDetail(null);
                          }}
                        >
                          Cancel
                        </LoadingButton>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item md={8} xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search bank accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="eva:search-fill" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  {filteredAccounts?.length > 0 ? (
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Bank</TableCell>
                            <TableCell>Holder</TableCell>
                            <TableCell>Account No.</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>IFSC</TableCell>
                            <TableCell>Branch</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAccounts.map((account) => (
                            <TableRow key={account._id} hover>
                              <TableCell>{account.bankName}</TableCell>
                              <TableCell>{account.accountHolderName}</TableCell>
                              <TableCell>
                                {showAccountNumber[account._id]
                                  ? account.accountNumber
                                  : '••••••••••'}
                                <Stack direction="row" spacing={1} component="span">
                                  <Tooltip title="Copy Account Number">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        navigator.clipboard.writeText(account.accountNumber);
                                        enqueueSnackbar('Account number copied!', {
                                          variant: 'info',
                                        });
                                      }}
                                    >
                                      <Iconify icon="eva:copy-fill" width={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={showAccountNumber[account._id] ? 'Hide' : 'Show'}>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setShowAccountNumber((prev) => ({
                                          ...prev,
                                          [account._id]: !prev[account._id],
                                        }))
                                      }
                                    >
                                      <Iconify
                                        icon={
                                          showAccountNumber[account._id]
                                            ? 'eva:eye-off-2-fill'
                                            : 'eva:eye-fill'
                                        }
                                        width={16}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={account.accountType}
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                {account.IFSC}
                                <Tooltip title="Copy IFSC">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(account.IFSC);
                                      enqueueSnackbar('IFSC copied!', { variant: 'info' });
                                    }}
                                  >
                                    <Iconify icon="eva:copy-fill" width={16} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              <TableCell>{account.branchName}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEditBankDetail(account)}
                                  >
                                    <Iconify icon="eva:edit-fill" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    color="error"
                                    onClick={() => setDeleteDialog({ open: true, detail: account })}
                                  >
                                    <Iconify icon="eva:trash-2-outline" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box textAlign="center" py={5}>
                      <Iconify icon="eva:folder-remove-outline" width={40} color="text.secondary" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No bank accounts found. Add your first bank account to get started.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </FormProvider>
      )}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, detail: null })}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:alert-triangle-fill" color="error.main" />
            <span>Confirm Deletion</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>You are about to delete the following bank account:</DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Typography variant="subtitle2">{deleteDialog.detail?.bankName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {deleteDialog.detail?.accountHolderName} — {deleteDialog.detail?.accountNumber}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            variant="outlined"
            onClick={() => setDeleteDialog({ open: false, detail: null })}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="error"
            loading={loading2}
            onClick={handleDeleteBankDetail}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
