import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Controller, useForm } from 'react-hook-form';
import FormProvider, { RHFAutocomplete, RHFTextField } from '../../../components/hook-form';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Table from '@mui/material/Table';
import { TableHeadCustom, useTable } from '../../../components/table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { fDate } from '../../../utils/format-time';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { IconButton, Paper, TableContainer } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useGetBranch } from '../../../api/branch';
import Button from '@mui/material/Button';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import Iconify from '../../../components/iconify';
import { useBoolean } from '../../../hooks/use-boolean';
import { ConfirmDialog } from '../../../components/custom-dialog';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import { useGetOtherLoanInterestPay } from '../../../api/other-loan-interest-pay.js';

const TABLE_HEAD = [
  { id: 'from', label: 'From Date' },
  { id: 'to', label: 'To Date' },
  { id: 'days', label: 'Days' },
  { id: 'interestAmount', label: 'Int. amt' },
  { id: 'charge', label: 'Charge' },
  { id: 'amountPaid', label: 'Amount Paid' },
  { id: 'cashAmt', label: 'Cash Amt' },
  { id: 'BankAmt', label: 'Bank Amt' },
  { id: 'Bank', label: 'Bank' },
  { id: 'EntryDate', label: 'Entry Date' },
  { id: 'action', label: 'Action' },
];

function InterestPayDetailsForm({ currentOtherLoan, mutate, configs }) {
  const [paymentMode, setPaymentMode] = useState('');
  const { branch } = useGetBranch();
  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState('');
  const { otherLoanInterest, refetchOtherLoanInterest } = useGetOtherLoanInterestPay(
    currentOtherLoan._id
  );
  const table = useTable();
  const { user } = useAuthContext();

  const payAmt = otherLoanInterest.reduce(
    (prev, next) => prev + (Number(next?.payAfterAdjust) || 0),
    0
  );

  const cashAmt = otherLoanInterest.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = otherLoanInterest.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.bankAmount) || 0),
    0
  );

  const interestAmount = otherLoanInterest.reduce(
    (prev, next) => prev + (Number(next?.interestAmount) || 0),
    0
  );

  const charge = otherLoanInterest.reduce((prev, next) => prev + (Number(next?.charge) || 0), 0);

  const day = otherLoanInterest.reduce(
    (prev, next) => prev + (Number(next?.days > 0 ? next?.days : 0) || 0),
    0
  );

  const paymentSchema =
    paymentMode === 'Bank'
      ? {
          account: Yup.object().required('Account is required').typeError('Account is required'),
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

  const NewInterestPayDetailsSchema = Yup.object().shape({
    from: Yup.string().required('From Date is required'),
    to: Yup.string().required('To Date is required'),
    days: Yup.string().required('Days is required'),

    paymentMode: Yup.string().required('Payment Mode is required'),
    payAfterAdjusted: Yup.string().required('pay After Adjusted is required'),
    ...paymentSchema,
  });

  const defaultValues = {
    from: otherLoanInterest[0]?.to
      ? new Date(otherLoanInterest[0].to)
      : new Date(currentOtherLoan.date),
    to: new Date(currentOtherLoan?.renewalDate)
      ? new Date(currentOtherLoan?.renewalDate)
      : new Date(),
    days: '',
    amountPaid: '',
    interest: currentOtherLoan?.percentage,
    interestAmount: '',
    payAfterAdjusted: '',
    charge: '',
    cr_dr: '',
    totalPay: '',
    paymentMode: '',
    account: null,
    cashAmount: '',
    bankAmount: '',
  };

  const methods = useForm({
    resolver: yupResolver(NewInterestPayDetailsSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentOtherLoan.status !== 'Closed') {
      const days = watch('days');
      const totalLoanAmount = (
        (((currentOtherLoan.amount * currentOtherLoan.percentage) / 100) * (12 * days)) /
        365
      ).toFixed(2);
      setValue('interestAmount', totalLoanAmount);
    }
  }, [currentOtherLoan.amount, currentOtherLoan.percentage, watch('days')]);

  useEffect(() => {
    const toDate = watch('to');
    const fromDate = watch('from');

    if (toDate && fromDate) {
      const diffTime = new Date(toDate) - new Date(fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setValue('days', diffDays);
    } else {
      setValue('days', 0);
    }
  }, [watch('to'), watch('from')]);

  useEffect(() => {
    if (otherLoanInterest && currentOtherLoan) {
      reset(defaultValues);
    }
  }, [otherLoanInterest, currentOtherLoan?.loan, setValue]);

  useEffect(() => {
    const loanAmount = currentOtherLoan?.amount;
    const interestAmount = watch('interestAmount');
    const totalAmount = Number(loanAmount) + Number(interestAmount);
    setValue('amountPaid', totalAmount);
  }, [currentOtherLoan?.amount, watch('interestAmount')]);

  const updateRenewalDate = (id) => {
    const date = currentOtherLoan.date;
    const fromDate = watch('to');
    const month = currentOtherLoan.month;

    const monthsToAdd =
      month === 'MONTHLY' ? 1 : month === 'YEARLY' ? 12 : parseInt(month.split(' ')[0], 10) || 0;

    const calculatedDate = new Date(date);
    const calculatedDateRenewalDate = new Date(fromDate);

    if (id) {
      calculatedDateRenewalDate.setMonth(calculatedDateRenewalDate.getMonth() - monthsToAdd);
    } else {
      calculatedDateRenewalDate.setMonth(calculatedDateRenewalDate.getMonth() + monthsToAdd);
    }

    if (calculatedDate && calculatedDateRenewalDate) {
      const payload = {
        ...currentOtherLoan,
        date: calculatedDate,
        renewalDate: calculatedDateRenewalDate,
      };
      axios
        .put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loans/${currentOtherLoan?._id}`,
          payload
        )
        .then((response) => {
          console.log(response);
          mutate();
          refetchOtherLoanInterest();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  const handleChargeIn = (data) => {
    try {
      let paymentDetail = {
        paymentMode: data.paymentMode,
      };
      if (data.paymentMode === 'Cash') {
        paymentDetail = {
          ...paymentDetail,
          cashAmount: data.charge,
        };
      } else {
        paymentDetail = {
          ...paymentDetail,
          account: data.account,
          bankAmount: data.charge,
        };
      }

      const payload = {
        chargeType: 'OTHER INTEREST CHARGE',
        date: new Date(data.to),
        branch: currentOtherLoan.loan.customer.branch._id,
        status: 'Payment Out',
        paymentDetail: paymentDetail,
        category: currentOtherLoan.otherNumber,
      };
      const res = axios.post(`${import.meta.env.VITE_BASE_URL}/${user?.company}/charge`, payload);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!configs.chargeType.includes('OTHER INTEREST CHARGE')) {
      return enqueueSnackbar('OTHER INTEREST CHARGE is not including in charge type', {
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
        ...data.account,
        bankAmount: data.bankAmount,
      };
    }

    const payload = {
      to: new Date(data.to),
      from: new Date(data.from),
      days: data.days,
      amountPaid: data.amountPaid,
      interestAmount: data.interestAmount,
      payAfterAdjust: data.payAfterAdjusted,
      charge: data.charge,
      remark: data.remark,
      paymentDetail,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/${user._id}/other-loans/${currentOtherLoan?._id}/interest`;
      const response = await axios.post(url, payload);
      if (data.charge > 0 && configs.chargeType.includes('OTHER INTEREST CHARGE')) {
        handleChargeIn(data);
      }
      reset();
      mutate();
      refetchOtherLoanInterest();
      enqueueSnackbar(response?.data.message);
      if (response?.data) {
        updateRenewalDate();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to pay interest', { variant: 'error' });
    }
  });

  const handleCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentOtherLoanAmount = parseFloat(watch('payAfterAdjusted')) || '';

    if (newCashAmount > currentOtherLoanAmount) {
      setValue('cashAmount', currentOtherLoanAmount);
      enqueueSnackbar('Cash amount cannot be Pay after adjusted than the loan amount.', {
        variant: 'warning',
      });
    } else {
      setValue('cashAmount', newCashAmount);
    }
    if (watch('paymentMode') === 'Both') {
      const calculatedBankAmount = currentOtherLoanAmount - newCashAmount;
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
        `${import.meta.env.VITE_BASE_URL}/${user._id}/other-loans/${currentOtherLoan._id}/interest/${id}`
      );
      setDeleteId(null);
      confirm.onFalse();
      updateRenewalDate(id);
      refetchOtherLoanInterest();
      mutate();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to pay interest', { variant: 'error' });
    }
  };

  const handleCharge = () => {
    const charge = watch('payAfterAdjusted') - watch('interestAmount');
    setValue('charge', watch('payAfterAdjusted') && charge >= 0 ? charge.toFixed(2) : 0);
  };

  return (
    <Box sx={{ py: 0 }}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box
          rowGap={1.5}
          columnGap={1.5}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(7, 1fr)',
          }}
        >
          <RhfDatePicker name="from" control={control} label="From Date" req={'red'} />
          <RhfDatePicker name="to" control={control} label="To Date" req={'red'} />
          <RHFTextField name="days" label="Days" req={'red'} InputProps={{ readOnly: true }} />
          <RHFTextField name="interest" label="Interest" req={'red'} />
          <RHFTextField
            name="interestAmount"
            label="Interest Amount"
            req={'red'}
            disabled
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                e.preventDefault();
              }
            }}
          />
          <RHFTextField
            name="amountPaid"
            label="Total Pay Amount"
            req={'red'}
            disabled
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                e.preventDefault();
              }
            }}
          />
          <RHFTextField name="payAfterAdjusted" label="Pay After Adjusted" req={'red'} />
          <RHFTextField name="charge" label="Charge" req={'red'} onChange={handleCharge()} />
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
          Payment Details
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ width: '90%' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              }}
              sx={{ mt: 1 }}
            >
              <RHFAutocomplete
                name="paymentMode"
                label="Payment Mode"
                req="red"
                options={['Cash', 'Bank', 'Both']}
                getOptionLabel={(option) => option}
                onChange={(event, value) => {
                  setValue('paymentMode', value);
                  handleLoanAmountChange({ target: { value: watch('payAfterAdjusted') } });
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              {watch('paymentMode') === 'Cash' || watch('paymentMode') === 'Both' ? (
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
              ) : null}
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
            </Box>
          </Box>
          {currentOtherLoan.status !== 'Closed' && (
            <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
              <Button
                color="inherit"
                sx={{ height: '36px' }}
                variant="outlined"
                onClick={() => reset()}
              >
                Reset
              </Button>
              {getResponsibilityValue('create_other_interest', configs, user) && (
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Submit
                </LoadingButton>
              )}
            </Box>
          )}
        </Box>
      </FormProvider>
      <Box>
        <Box
          sx={{
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '5px',
              transition: 'opacity 0.3s ease',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              visibility: 'visible',
              display: 'block',
            },
            '&::-webkit-scrollbar-thumb': {
              visibility: 'hidden',
              backgroundColor: '#B4BCC3',
              borderRadius: '4px',
            },
          }}
        >
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 500,
              overflow: 'auto',
              borderRadius: 2,
              mt: 2,
            }}
          >
            <Table stickyHeader sx={{ minWidth: 1500 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                onSort={table.onSort}
                sx={{
                  backgroundColor: '#2f3944',
                  zIndex: 1000,
                }}
              />
              <TableBody>
                {otherLoanInterest.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.from)}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.to)}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.days > 0 ? row.days : 0}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.interestAmount}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.charge}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.payAfterAdjust}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.paymentDetail.cashAmount || 0}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.paymentDetail.bankAmount || 0}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.paymentDetail.bankName || '-'}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.createdAt)}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>
                      {getResponsibilityValue('delete_other_interest', configs, user) ? <IconButton
                        color='error'
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
                        <Iconify icon='eva:trash-2-outline' />
                      </IconButton> : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow
                  sx={{ backgroundColor: '#F4F6F8', bottom: 0, position: 'sticky', zIndex: 1000 }}
                >
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    TOTAL
                  </TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {day}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {interestAmount.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {charge.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {payAmt}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {cashAmt}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {bankAmt}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
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
    </Box>
  );
}

export default InterestPayDetailsForm;
