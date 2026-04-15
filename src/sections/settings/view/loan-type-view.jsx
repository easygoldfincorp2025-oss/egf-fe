import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetConfigs } from 'src/api/config';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

export default function LoanTypeView() {
  const { user } = useAuthContext();
  const { configs, mutate } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();

  const [inputVal, setInputVal] = useState({
    loanType: '',
    fixApprovalCharge: { amount: '' },
    variableApprovalCharge: { amount: '', percentage: '' },
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(inputVal);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, loan: null });

  const handleChangeInput = (field, value, type = 'input') => {
    if (type === 'fix') {
      setInputVal({ ...inputVal, fixApprovalCharge: { amount: value } });
    } else if (type === 'variableAmt') {
      setInputVal({
        ...inputVal,
        variableApprovalCharge: { ...inputVal.variableApprovalCharge, amount: value },
      });
    } else if (type === 'variablePerc') {
      setInputVal({
        ...inputVal,
        variableApprovalCharge: { ...inputVal.variableApprovalCharge, percentage: value },
      });
    } else {
      setInputVal({ ...inputVal, [field]: value.toUpperCase() });
    }
  };

  const validateLoan = (loan) => {
    return (
      loan.loanType &&
      loan.fixApprovalCharge.amount &&
      loan.variableApprovalCharge.amount &&
      loan.variableApprovalCharge.percentage
    );
  };

  const handleAddLoan = () => {
    if (!validateLoan(inputVal)) {
      enqueueSnackbar('All fields are required', { variant: 'warning' });
      return;
    }

    if (configs?.loanTypes?.some((l) => l.loanType === inputVal.loanType)) {
      enqueueSnackbar('Loan Type already exists', { variant: 'warning' });
      return;
    }

    const updatedLoanTypes = configs.loanTypes ? [...configs.loanTypes, inputVal] : [inputVal];
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    axios
      .put(URL, { ...configs, loanTypes: updatedLoanTypes })
      .then(() => {
        enqueueSnackbar('Loan Type added successfully', { variant: 'success' });
        setInputVal({
          loanType: '',
          fixApprovalCharge: { amount: '' },
          variableApprovalCharge: { amount: '', percentage: '' },
        });
        mutate();
      })
      .catch(() => enqueueSnackbar('Failed to add Loan Type', { variant: 'error' }));
  };

  const handleEdit = (loan) => {
    setEditingId(loan);
    setEditValues(loan);
  };

  const handleUpdate = () => {
    if (!validateLoan(editValues)) {
      enqueueSnackbar('All fields are required', { variant: 'warning' });
      return;
    }
    const updatedLoanTypes = configs.loanTypes.map((loan) =>
      loan === editingId ? editValues : loan
    );
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    axios
      .put(URL, { ...configs, loanTypes: updatedLoanTypes })
      .then(() => {
        enqueueSnackbar('Loan Type updated successfully', { variant: 'success' });
        setEditingId(null);
        mutate();
      })
      .catch(() => enqueueSnackbar('Failed to update Loan Type', { variant: 'error' }));
  };

  const handleDelete = (loan) => setDeleteDialog({ open: true, loan });

  const confirmDelete = () => {
    const updatedLoanTypes = configs.loanTypes.filter((r) => r !== deleteDialog.loan);
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config/${configs?._id}`;
    axios
      .put(URL, { ...configs, loanTypes: updatedLoanTypes })
      .then(() => {
        enqueueSnackbar('Loan Type deleted successfully', { variant: 'success' });
        mutate();
      })
      .catch(() => enqueueSnackbar('Failed to delete Loan Type', { variant: 'error' }))
      .finally(() => setDeleteDialog({ open: false, loan: null }));
  };

  const handleCancel = () => setEditingId(null);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Loan Type Configuration
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }} elevation={3}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Loan Type
            </Typography>
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Loan Type"
                value={inputVal.loanType}
                fullWidth
                onChange={(e) => handleChangeInput('loanType', e.target.value)}
                placeholder="E.g., PERSONAL, HOME"
              />
              <Typography variant="subtitle2">Fixed Approval Charge</Typography>
              <TextField
                size="small"
                label="Amount (₹)"
                value={inputVal.fixApprovalCharge.amount}
                fullWidth
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) handleChangeInput('', e.target.value, 'fix');
                }}
              />
              <Typography variant="subtitle2">Variable Approval Charge</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    label="Amount (₹)"
                    value={inputVal.variableApprovalCharge.amount}
                    fullWidth
                    onChange={(e) => {
                      if (/^\d*\.?\d*$/.test(e.target.value))
                        handleChangeInput('', e.target.value, 'variableAmt');
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    size="small"
                    label="Percentage (%)"
                    value={inputVal.variableApprovalCharge.percentage}
                    fullWidth
                    onChange={(e) => {
                      if (/^\d*\.?\d*$/.test(e.target.value))
                        handleChangeInput('', e.target.value, 'variablePerc');
                    }}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" fullWidth onClick={handleAddLoan}>
                Add Loan Type
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {configs?.loanTypes?.map((loan, idx) => (
              <Paper
                key={idx}
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 2,
                  bgcolor: editingId === loan ? '#e3f2fd' : '#fafafa',
                  transition: '0.3s',
                  '&:hover': { boxShadow: 3 },
                }}
                elevation={1}
              >
                <Box sx={{ flex: 1 }}>
                  {editingId === loan ? (
                    <Stack spacing={1}>
                      <TextField
                        size="small"
                        label="Loan Type"
                        value={editValues.loanType}
                        onChange={(e) =>
                          setEditValues({ ...editValues, loanType: e.target.value.toUpperCase() })
                        }
                      />
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            label="Fixed (₹)"
                            value={editValues.fixApprovalCharge.amount}
                            onChange={(e) => {
                              if (/^\d*\.?\d*$/.test(e.target.value))
                                setEditValues({
                                  ...editValues,
                                  fixApprovalCharge: { amount: e.target.value },
                                });
                            }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            label="Variable Amt (₹)"
                            value={editValues.variableApprovalCharge.amount}
                            onChange={(e) => {
                              if (/^\d*\.?\d*$/.test(e.target.value))
                                setEditValues({
                                  ...editValues,
                                  variableApprovalCharge: {
                                    ...editValues.variableApprovalCharge,
                                    amount: e.target.value,
                                  },
                                });
                            }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            label="Variable %"
                            value={editValues.variableApprovalCharge.percentage}
                            onChange={(e) => {
                              if (/^\d*\.?\d*$/.test(e.target.value))
                                setEditValues({
                                  ...editValues,
                                  variableApprovalCharge: {
                                    ...editValues.variableApprovalCharge,
                                    percentage: e.target.value,
                                  },
                                });
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="subtitle1">{loan.loanType}</Typography>
                      <Typography variant="body2">
                        Fixed: ₹{loan.fixApprovalCharge.amount} | Variable: ₹
                        {loan.variableApprovalCharge.amount} ({loan.variableApprovalCharge.percentage}
                        %)
                      </Typography>
                    </>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {editingId === loan ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton color="success" onClick={handleUpdate}>
                          <Iconify icon="solar:check-circle-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton color="error" onClick={handleCancel}>
                          <Iconify icon="solar:close-circle-bold" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(loan)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(loan)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, loan: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{deleteDialog.loan?.loanType}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, loan: null })}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
