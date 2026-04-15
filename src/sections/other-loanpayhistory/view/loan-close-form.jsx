import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Dialog,
  DialogActions,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../../components/hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { TableHeadCustom } from '../../../components/table';
import { useAuthContext } from '../../../auth/hooks';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useGetBranch } from '../../../api/branch';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import { useBoolean } from '../../../hooks/use-boolean';
import { useGetConfigs } from '../../../api/config';
import LoanCloseDetailsPdf from '../PDF/loan-close-details-pdf';
import { getResponsibilityValue } from '../../../permission/permission';
import { useGetOtherCloseLoan } from '../../../api/other-loan-close.js';
import { fDate } from '../../../utils/format-time.js';
import { ConfirmDialog } from '../../../components/custom-dialog/index.js';
import Iconify from '../../../components/iconify/index.js';

const TABLE_HEAD = [
  { id: 'totalLoanAmt', label: 'Total loan amt' },
  { id: 'paidLoanAmt', label: 'Paid loan amt' },
  { id: 'closingCharge', label: 'Closing Charge' },
  { id: 'entryDate', label: 'Entry Date' },
  { id: 'payDate', label: 'Pay Date' },
  { id: 'cashAmt', label: 'Cash Amt' },
  { id: 'bankAmt', label: 'Bank Amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'remark', label: 'Remark' },
  { id: 'action', label: 'Action' },
];

function LoanCloseForm({ currentOtherLoan, mutate }) {
  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState('');
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const [paymentMode, setPaymentMode] = useState('');
  const { otherLoanClose, refetchOtherLoanClose } = useGetOtherCloseLoan(currentOtherLoan._id);
  const view = useBoolean();
  const [data, setData] = useState(null);
  const { configs } = useGetConfigs();

  const paymentSchema =
    paymentMode === 'Bank'
      ? {
          account: Yup.object().required('Account is required'),
          bankAmount: Yup.string()
            .required('Bank Amount is required')
            .test(
              'is-positive',
              'Bank Amount must be a positive number',
              (value) => parseFloat(value) >= 0
            ),
        }
      : paymentMode === 'Cash'
        ? {
            cashAmount: Yup.string()
              .required('Cash Amount is required')
              .test(
                'is-positive',
                'Cash Amount must be a positive number',
                (value) => parseFloat(value) >= 0
              ),
          }
        : {
            cashAmount: Yup.string()
              .required('Cash Amount is required')
              .test(
                'is-positive',
                'Cash Amount must be a positive number',
                (value) => parseFloat(value) >= 0
              ),
            bankAmount: Yup.string()
              .required('Bank Amount is required')
              .test(
                'is-positive',
                'Bank Amount must be a positive number',
                (value) => parseFloat(value) >= 0
              ),
            account: Yup.object().required('Account is required'),
          };

  const NewLoanCloseSchema = Yup.object().shape({
    totalLoanAmount: Yup.number()
      .min(1, 'Total Loan Amount must be greater than 0')
      .required('Total Loan Amount is required')
      .typeError('Total Loan Amount must be a number'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    ...paymentSchema,
  });

  const defaultValues = {
    totalLoanAmount: currentOtherLoan?.amount || '',
    paidLoanAmount: '',
    pendingLoanAmount: currentOtherLoan.loan?.interestLoanAmount || '',
    closeRemarks: '',
    paymentMode: '',
    cashAmount: '',
    account: null,
    bankAmount: null,
    payDate: currentOtherLoan?.payDate || new Date(),
    closingCharge: '',
    remark: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewLoanCloseSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
      setValue('paymentMode', watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  useEffect(() => {
    setValue('netAmount', Number(watch('pendingLoanAmount')) + Number(watch('closingCharge')));
  }, [watch('closingCharge'), watch('pendingLoanAmount')]);

  const handleChargeIn = (data) => {
    try {
      let paymentDetail = {
        paymentMode: data.paymentMode,
      };

      if (data.paymentMode === 'Cash') {
        paymentDetail = {
          ...paymentDetail,
          cashAmount: data.cashAmount,
        };
      } else if (data.paymentMode === 'Bank') {
        paymentDetail = {
          ...paymentDetail,
          account: data.account,
          bankAmount: data.bankAmount,
        };
      } else if (data.paymentMode === 'Both') {
        paymentDetail = {
          ...paymentDetail,
          cashAmount: data.cashAmount,
          bankAmount: data.bankAmount,
          account: data.account,
        };
      }
      const payload = {
        chargeType: 'OTHER CLOSE CHARGE',
        date: new Date(),
        branch: currentOtherLoan.loan.customer.branch._id,
        status: 'Payment Out',
        paymentDetail: paymentDetail,
        category: currentOtherLoan.otherNumber,
        otherLoanId: currentOtherLoan._id,
      };
      const res = axios.post(`${import.meta.env.VITE_BASE_URL}/${user?.company}/charge`, payload);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!configs.chargeType.includes('OTHER CLOSE CHARGE')) {
      return enqueueSnackbar('OTHER CLOSE CHARGE is not including in charge type', {
        variant: 'error',
      });
    }

    let paymentDetail = {
      paymentMode: data.paymentMode,
    };

    if (data.paymentMode === 'Cash') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: data.cashAmount,
      };
    } else if (data.paymentMode === 'Bank') {
      paymentDetail = {
        ...paymentDetail,
        ...data.account,
        bankAmount: data.bankAmount,
      };
    } else if (data.paymentMode === 'Both') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: data.cashAmount,
        bankAmount: data.bankAmount,
        ...data.account,
      };
    }

    const payload = {
      totalLoanAmount: data.totalLoanAmount,
      paidLoanAmount: data.paidLoanAmount,
      remark: data.remark,
      paymentDetail: paymentDetail,
      closingCharge: data.closingCharge,
      payDate: data.payDate,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/${user.company}/other-loans/${currentOtherLoan._id}/loan-close`;
      const config = {
        method: 'post',
        url,
        data: payload,
      };

      const response = await axios(config);
      if (data.closingCharge > 0 && configs.chargeType.includes('OTHER CLOSE CHARGE')) {
        handleChargeIn(data);
      }
      reset();
      refetchOtherLoanClose();
      mutate();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to close Loan', { variant: 'error' });
    }
  });

  const handleCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('paidLoanAmount')) || '';

    if (newCashAmount > currentLoanAmount) {
      setValue('cashAmount', currentLoanAmount);
      enqueueSnackbar('Cash amount cannot be greater than the loan amount.', {
        variant: 'warning',
      });
    } else {
      setValue('cashAmount', newCashAmount);
    }
    if (watch('paymentMode') === 'Both') {
      const calculatedBankAmount = currentLoanAmount - newCashAmount;
      setValue('bankAmount', calculatedBankAmount >= 0 ? calculatedBankAmount : '');
    }
  };

  const handleLoanAmountChange = (event) => {
    const newLoanAmount = parseFloat(event.target.value) || '';
    setValue('loanAmount', newLoanAmount);
    const paymentMode = watch('paymentMode');

    if (paymentMode === 'Cash') {
      setValue('cashAmount', newLoanAmount);
      setValue('bankAmount', 0);
    } else if (paymentMode === 'Bank') {
      setValue('bankAmount', newLoanAmount);
      setValue('cashAmount', 0);
    } else if (paymentMode === 'Both') {
      setValue('cashAmount', newLoanAmount);
      setValue('bankAmount', 0);
    }
  };

  const handleDeleteInterest = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user._id}/other-loans/${currentOtherLoan._id}/loan-close/${id}`
      );
      setDeleteId(null);
      confirm.onFalse();
      mutate();
      refetchOtherLoanClose();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to pay interest', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid rowSpacing={3} columnSpacing={2}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(5, 1fr)',
            }}
          >
            <RHFTextField
              name="totalLoanAmount"
              label="Total Loan Amount"
              req={'red'}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
            <RHFTextField name="paidLoanAmount" label="Paid Loan Amount" />
            <RHFTextField
              name="closingCharge"
              label="Closing charge"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
            <RHFTextField name="remark" label="Remark" />
          </Box>
        </Grid>
        <Grid pb={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle1" my={1}>
              Payment Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box
                width={'100%'}
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(5, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="paymentMode"
                  label="Payment Mode"
                  req="red"
                  options={['Cash', 'Bank', 'Both']}
                  getOptionLabel={(option) => option}
                  onChange={(event, value) => {
                    setValue('paymentMode', value);
                    handleLoanAmountChange({ target: { value: watch('paidLoanAmount') } });
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                {(watch('paymentMode') === 'Cash' || watch('paymentMode') === 'Both') && (
                  <Controller
                    name="cashAmount"
                    control={control}
                    render={({ field }) => (
                      <RHFTextField
                        {...field}
                        label="Cash Amount"
                        req={'red'}
                        inputProps={{ min: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCashAmountChange(e);
                        }}
                      />
                    )}
                  />
                )}
                {(watch('paymentMode') === 'Bank' || watch('paymentMode') === 'Both') && (
                  <>
                    <RHFAutocomplete
                      name="account"
                      label="Account"
                      req="red"
                      fullWidth
                      options={Array.from(
                        new Map(
                          branch
                            .flatMap((item) => item.company.bankAccounts)
                            .map((item) => [item.bankName + item._id, item])
                        ).values()
                      )}
                      getOptionLabel={(option) =>
                        `${option.bankName} (${option.accountHolderName})` || ''
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option._id || option.bankName}>
                          {`${option.bankName} (${option.accountHolderName})`}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    <Controller
                      name="bankAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Bank Amount"
                          req={'red'}
                          disabled={watch('paymentMode') === 'Bank' ? false : true}
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </>
                )}
                <RhfDatePicker name="payDate" control={control} label="Pay Date" req={'red'} />
              </Box>
              {currentOtherLoan.status !== 'Closed' && (
                <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                  <Button color="inherit" variant="outlined" onClick={() => reset()}>
                    Reset
                  </Button>
                  {getResponsibilityValue('create_other_loan_close', configs, user) && (
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                      Submit
                    </LoadingButton>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </FormProvider>
      <Table sx={{ borderRadius: '8px', overflow: 'hidden', mt: 2.5 }}>
        <TableHeadCustom headLabel={TABLE_HEAD} />
        <TableBody>
          {otherLoanClose.map((row, index) => (
            <TableRow key={index}>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.totalLoanAmount}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paidLoanAmount}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.closingCharge || '-'}
              </TableCell>{' '}
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {fDate(row.createdAt) || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {fDate(row.payDate) || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.cashAmount || 0}
              </TableCell>{' '}
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.bankAmount || 0}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.bankName || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.remark || '-'}
              </TableCell>
              <TableCell sx={{ py: 0, px: 2 }}>
                {getResponsibilityValue('delete_other_interest', configs, user) ? (
                  <IconButton
                    color="error"
                    onClick={() => {
                      if (index === 0) {
                        confirm.onTrue();
                        setDeleteId(row?._id);
                      }
                    }}
                    sx={{
                      cursor: index === 0 ? 'pointer' : 'default',
                      opacity: index === 0 ? 1 : 0.5,
                      pointerEvents: index === 0 ? 'auto' : 'none',
                    }}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog fullScreen open={view.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              p: 1.5,
            }}
          >
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <LoanCloseDetailsPdf data={data} configs={configs} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => handleDeleteInterest(deleteId)}>
            Delete
          </Button>
        }
      />
    </>
  );
}

export default LoanCloseForm;
