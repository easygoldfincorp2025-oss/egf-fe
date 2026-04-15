import axios from 'axios';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Table, Dialog, TableRow, TableBody, TableCell, Typography, DialogActions } from '@mui/material';

import Noc from '../PDF/noc.jsx';
import Iconify from '../../../components/iconify';
import { useGetBranch } from '../../../api/branch';
import { useGetConfigs } from '../../../api/config';
import { useAuthContext } from '../../../auth/hooks';
import { fDate } from '../../../utils/format-time.js';
import { useBoolean } from '../../../hooks/use-boolean';
import { useGetCloseLoan } from '../../../api/loan-close';
import { TableHeadCustom } from '../../../components/table';
import { useGetAllInterest } from '../../../api/interest-pay.js';
import { getResponsibilityValue } from '../../../permission/permission';
import { ConfirmDialog } from '../../../components/custom-dialog/index.js';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import FormProvider, { RHFTextField, RHFAutocomplete } from '../../../components/hook-form';

const TABLE_HEAD = [
  { id: 'totalLoanAmt', label: 'Total loan amt' },
  { id: 'paidLoanAmt', label: 'Paid loan amt' },
  { id: 'pendingLoanAmt', label: 'Pending loan Amt' },
  { id: 'payDate', label: 'Pay Date' },
  { id: 'closinDate', label: 'Closing Date' },
  { id: 'closinCharge', label: 'Closing charge' },
  { id: 'chargeCashAmount', label: 'Charge cash amt' },
  { id: 'chargeBankAmount', label: 'Charge bank amt' },
  { id: 'chargeBank', label: 'Charge bank' },
  { id: 'netAmt', label: 'Net amt' },
  { id: 'cashAmt', label: 'Cash Amt' },
  { id: 'bankAmt', label: 'Bank Amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'entryBy', label: 'Entry By' },
  { id: 'PDF', label: 'PDF' },
];

function LoanCloseForm({ currentLoan, mutate }) {
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const { loanInterest, refetchLoanInterest } = useGetAllInterest(currentLoan._id);
  const [paymentMode, setPaymentMode] = useState('');
  const [closingChargeValue, setClosingChargeValue] = useState(0);
  const [chargePaymentModeValue, setChargePaymentModeValue] = useState('');
  const { loanClose, refetchLoanClose } = useGetCloseLoan(currentLoan._id);
  const view = useBoolean();
  const confirm = useBoolean();
  const [data, setData] = useState(null);
  const { configs } = useGetConfigs();
  const totalDays = loanInterest.reduce((prev, next) => prev + (Number(next?.days) || 0), 0);

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

  const chargePaymentSchema = {
    ...(closingChargeValue > 0 && {
      chargePaymentMode: Yup.string().required('Charge Payment Mode is required'),
      ...(chargePaymentModeValue === 'Cash' && {
        chargeCashAmount: Yup.string()
          .required('Charge Cash Amount is required')
          .test(
            'is-positive',
            'Charge Cash Amount must be a positive number',
            (value) => parseFloat(value) >= 0
          ),
      }),
      ...(chargePaymentModeValue === 'Bank' && {
        chargeBankAmount: Yup.string()
          .required('Charge Bank Amount is required')
          .test(
            'is-positive',
            'Charge Bank Amount must be a positive number',
            (value) => parseFloat(value) >= 0
          ),
        chargeAccount: Yup.object().required('Charge Account is required'),
      }),
      ...(chargePaymentModeValue === 'Both' && {
        chargeCashAmount: Yup.string()
          .required('Charge Cash Amount is required')
          .test(
            'is-positive',
            'Charge Cash Amount must be a positive number',
            (value) => parseFloat(value) >= 0
          ),
        chargeBankAmount: Yup.string()
          .required('Charge Bank Amount is required')
          .test(
            'is-positive',
            'Charge Bank Amount must be a positive number',
            (value) => parseFloat(value) >= 0
          ),
        chargeAccount: Yup.object().required('Charge Account is required'),
      }),
    }),
  };

  const NewLoanCloseSchema = Yup.object().shape({
    expectPaymentMode: Yup.string().required('Expected Payment Mode is required'),
    totalLoanAmount: Yup.number()
      .min(1, 'Total Loan Amount must be greater than 0')
      .required('Total Loan Amount is required')
      .typeError('Total Loan Amount must be a number'),
    date: Yup.date().nullable().required('Pay date is required'),
    pendingLoanAmount: Yup.number()
      .min(0, 'Pending Loan Amount must be 0 or greater')
      .required('Pending Loan Amount is required')
      .typeError('Pending Loan Amount must be a number'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    netAmount: Yup.string().required('Net Amount is required'),
    ...paymentSchema,
    ...chargePaymentSchema,
  });

  const defaultValues = {
    date: new Date(),
    totalLoanAmount: currentLoan?.loanAmount || '',
    netAmount: '',
    paidLoanAmount: currentLoan?.loanAmount - currentLoan?.interestLoanAmount || '0',
    pendingLoanAmount: currentLoan?.interestLoanAmount || '',
    closingCharge: '0',
    closeRemarks: '',
    paymentMode: '',
    expectPaymentMode: null,
    cashAmount: '',
    account: null,
    bankAmount: null,
    chargePaymentMode: '',
    chargeCashAmount: '',
    chargeAccount: null,
    chargeBankAmount: null,
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
    setValue('netAmount', Number(watch('pendingLoanAmount')));
    const chargeValue = Number(watch('closingCharge')) || 0;
    setClosingChargeValue(chargeValue);
    if (chargeValue === 0) {
      setValue('chargePaymentMode', '');
      setValue('chargeCashAmount', '');
      setValue('chargeBankAmount', '');
      setValue('chargeAccount', null);
    }
  }, [watch('closingCharge'), watch('pendingLoanAmount')]);

  useEffect(() => {
    setChargePaymentModeValue(watch('chargePaymentMode') || '');
  }, [watch('chargePaymentMode')]);

  useEffect(() => {
    const closingCharge = Number(watch('closingCharge')) || 0;
    const chargePaymentMode = watch('chargePaymentMode');

    if (chargePaymentMode === 'Cash') {
      setValue('chargeCashAmount', closingCharge);
      setValue('chargeBankAmount', '');
    } else if (chargePaymentMode === 'Bank') {
      setValue('chargeBankAmount', closingCharge);
      setValue('chargeCashAmount', '');
    } else if (chargePaymentMode === 'Both') {
      const halfAmount = closingCharge / 2;
      setValue('chargeCashAmount', halfAmount);
      setValue('chargeBankAmount', halfAmount);
    }
  }, [watch('chargePaymentMode'), watch('closingCharge')]);

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

  const handleChargeCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || 0;
    const closingCharge = parseFloat(watch('closingCharge')) || 0;
    const chargePaymentMode = watch('chargePaymentMode');

    if (chargePaymentMode === 'Both') {
      if (newCashAmount > closingCharge) {
        setValue('chargeCashAmount', closingCharge);
        setValue('chargeBankAmount', 0);
        enqueueSnackbar('Cash amount cannot be greater than closing charge', {
          variant: 'warning',
        });
      } else {
        setValue('chargeCashAmount', newCashAmount);
        setValue('chargeBankAmount', closingCharge - newCashAmount);
      }
    } else {
      setValue('chargeCashAmount', newCashAmount);
    }
  };

  const handleChargeBankAmountChange = (event) => {
    const newBankAmount = parseFloat(event.target.value) || 0;
    const closingCharge = parseFloat(watch('closingCharge')) || 0;
    const chargePaymentMode = watch('chargePaymentMode');

    if (chargePaymentMode === 'Both') {
      if (newBankAmount > closingCharge) {
        setValue('chargeBankAmount', closingCharge);
        setValue('chargeCashAmount', 0);
        enqueueSnackbar('Bank amount cannot be greater than closing charge', {
          variant: 'warning',
        });
      } else {
        setValue('chargeBankAmount', newBankAmount);
        setValue('chargeCashAmount', closingCharge - newBankAmount);
      }
    } else {
      setValue('chargeBankAmount', newBankAmount);
    }
  };

  const handlePaymentCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('netAmount')) || '';

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

  const sendPdfToWhatsApp = async (item,date,charge) => {
    try {
      const blob = await pdf(<Noc nocData={currentLoan} closingDate={date} charge={charge} configs={configs} />).toBlob();
      const file = new File([blob], `Noc.pdf`, { type: 'application/pdf' });
      const payload = {
        firstName: item ? item.loan.customer.firstName : data.loan.customer.firstName,
        middleName: item ? item.loan.customer.middleName : data.loan.customer.middleName,
        lastName: item ? item.loan.customer.lastName : data.loan.customer.lastName,
        contact: item ? item.loan.customer.contact : data.loan.customer.contact,
        loanNumber: item ? item.loan.loanNo : data.loan.loanNo,
        loanAmount: item ? item.loan.loanAmount : data.loan.loanAmount,
        date: item ? item.createdAt : data.createdAt,
        closingCharge: item ? item.closingCharge : data.closingCharge,
        amountPaid: item ? item.netAmount : data.netAmount,
        companyName: item ? item.loan.company.name : data.loan.company.name,
        companyEmail: item ? item.loan.company.email : data.loan.company.email,
        companyContact: item ? item.loan.company.contact : data.loan.company.contact,
        branchContact: item ? item.loan.customer.branch.contact : data.loan.customer.branch.contact,
        company: user.company,
        file,
        type: 'loan_close',
      };
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      axios
        .post(`${import.meta.env.VITE_HOST_API}/api/whatsapp-notification`, formData)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleChargeIn = async (data) => {
    try {
      let chargePaymentDetail = {
        paymentMode: data.chargePaymentMode,
      };

      if (data.chargePaymentMode === 'Cash') {
        chargePaymentDetail = {
          ...chargePaymentDetail,
          cashAmount: data.chargeCashAmount,
        };
      } else if (data.chargePaymentMode === 'Bank') {
        chargePaymentDetail = {
          ...chargePaymentDetail,
          account: data.chargeAccount,
          bankAmount: data.chargeBankAmount,
        };
      } else if (data.chargePaymentMode === 'Both') {
        chargePaymentDetail = {
          ...chargePaymentDetail,
          cashAmount: data.chargeCashAmount,
          bankAmount: data.chargeBankAmount,
          account: data.chargeAccount,
        };
      }
      const payload = {
        chargeType: 'CLOSING CHARGE',
        date: new Date(),
        branch: currentLoan.customer.branch._id,
        status: 'Payment In',
        paymentDetail: chargePaymentDetail,
        category: currentLoan.loanNo,
        loanId: currentLoan._id,
      };

      await axios.post(`${import.meta.env.VITE_BASE_URL}/${user?.company}/charge`, payload);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const loanToDate = loanInterest[0]?.to;
    const selectedDate = watch('date');

    const date1 = loanToDate ? new Date(loanToDate).toISOString().split('T')[0] : null;
    const date2 = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : null;

    if (!date1 || !date2 || date1 < date2) {
      return enqueueSnackbar('Please pay interest till today before close the loan.', {
        variant: 'info',
      });
    }
    if (!configs.chargeType.includes('CLOSING CHARGE')) {
      return enqueueSnackbar('CLOSING CHARGE is not including in charge type', {
        variant: 'error',
      });
    }

    let paymentDetail = {
      paymentMode: data.paymentMode,
      expectPaymentMode: data.expectPaymentMode,
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
    let chargePaymentDetail = {
      chargePaymentMode: data.chargePaymentMode,
    };

    if (data.chargePaymentMode === 'Cash') {
      chargePaymentDetail = {
        ...chargePaymentDetail,
        chargeCashAmount: data.chargeCashAmount,
      };
    } else if (data.chargePaymentMode === 'Bank') {
      chargePaymentDetail = {
        ...chargePaymentDetail,
        ...data.chargeAccount,
        chargeBankAmount: data.chargeBankAmount,
      };
    } else if (data.chargePaymentMode === 'Both') {
      chargePaymentDetail = {
        ...chargePaymentDetail,
        chargeCashAmount: data.chargeCashAmount,
        chargeBankAmount: data.chargeBankAmount,
        ...data.chargeAccount,
      };
    }

    const payload = {
      entryBy: `${user.firstName  } ${  user.middleName  } ${  user.lastName}`,
      totalLoanAmount: data.totalLoanAmount,
      netAmount: data.netAmount,
      closingCharge: data.closingCharge,
      date: data.date,
      remark: data.remark,
      paymentDetail,
      chargePaymentDetail,
      closedBy: user._id,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/loan-close`;
      const config = {
        method: 'post',
        url,
        data: payload,
      };
      const response = await axios(config);
      const responseData = response?.data?.data;
      sendPdfToWhatsApp(responseData,data.date,data.closingCharge);
      if (data.closingCharge > 0 && configs.chargeType.includes('CLOSING CHARGE')) {
        handleChargeIn(data);
      }
      reset();
      confirm.onFalse();
      refetchLoanClose();
      mutate();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to close Loan', { variant: 'error' });
    }
  });

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={(e) => {
          e.preventDefault();
          if (totalDays <= currentLoan.scheme.minLoanTime) {
            confirm.onTrue();
          } else {
            onSubmit();
          }
        }}
      >
        <Box sx={{ display: 'flex', gap: 4, pl: 0.5, mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: '700' }}>
            Cash Amount : {currentLoan.cashAmount || 0}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: '700' }}>
            Bank Amount : {currentLoan.bankAmount || 0}
          </Typography>
        </Box>
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
              req="red"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
            <RHFTextField
              name="paidLoanAmount"
              label="Paid Loan Amount"
              InputProps={{ readOnly: true }}
            />
            <RHFTextField
              name="pendingLoanAmount"
              label="Pending Loan Amount"
              req="red"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
            <RHFTextField
              name="closingCharge"
              label="Closing Charge"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
            <RHFTextField
              name="netAmount"
              label="Net Amount"
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
              InputProps={{ readOnly: true }}
            />
            <RHFTextField name="closeRemarks" label="Close Remarks" />
            <RhfDatePicker name="date" control={control} label="Pay Date" req="red" />
            <RHFAutocomplete
              name="expectPaymentMode"
              label="Expected Payment Mode"
              req="red"
              options={['Cash', 'Bank', 'Both']}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
            />
          </Box>
        </Grid>
        <Grid pb={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle1" my={1}>
              Payment Details
            </Typography>
            <Box
              width="100%"
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
                  handleLoanAmountChange({ target: { value: watch('netAmount') } });
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
                      req="red"
                      inputProps={{ min: 0 }}
                      onChange={(e) => {
                        field.onChange(e);
                        handlePaymentCashAmountChange(e);
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
                        req="red"
                        disabled={watch('paymentMode') !== 'Bank'}
                        inputProps={{ min: 0 }}
                      />
                    )}
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>{' '}
        <Grid pb={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle1" my={1}>
              Charge Payment Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box
                width="100%"
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(5, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="chargePaymentMode"
                  label="Payment Mode"
                  options={['Cash', 'Bank', 'Both']}
                  getOptionLabel={(option) => option}
                  onChange={(event, value) => {
                    setValue('chargePaymentMode', value);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                {(watch('chargePaymentMode') === 'Cash' ||
                  watch('chargePaymentMode') === 'Both') && (
                  <Controller
                    name="chargeCashAmount"
                    control={control}
                    render={({ field }) => (
                      <RHFTextField
                        {...field}
                        label="Cash Amount"
                        inputProps={{ min: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleChargeCashAmountChange(e);
                        }}
                      />
                    )}
                  />
                )}
                {(watch('chargePaymentMode') === 'Bank' ||
                  watch('chargePaymentMode') === 'Both') && (
                  <>
                    <RHFAutocomplete
                      name="chargeAccount"
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
                          {`${option.bankName}(${option.accountHolderName})`}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    <Controller
                      name="chargeBankAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Bank Amount"
                          disabled={watch('chargePaymentMode') !== 'Bank'}
                          inputProps={{ min: 0 }}
                          onChange={(e) => {
                            field.onChange(e);
                            handleChargeBankAmountChange(e);
                          }}
                        />
                      )}
                    />
                  </>
                )}
              </Box>
              {currentLoan.status !== 'Closed' && (
                <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                  <Button color="inherit" variant="outlined" onClick={() => reset()}>
                    Reset
                  </Button>
                  {getResponsibilityValue('create_loan_close', configs, user) && (
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
      <Table sx={{ borderRadius: '8px', overflow: 'hidden', mt: 2.5 }} hover>
        <TableHeadCustom headLabel={TABLE_HEAD} />
        <TableBody>
          {loanClose.map((row, index) => (
            <TableRow key={index}>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.totalLoanAmount}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.netAmount}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.totalLoanAmount - (row.netAmount)}
              </TableCell>
              <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.date)}</TableCell>
              <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.createdAt)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.closingCharge}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.chargePaymentDetail?.chargeCashAmount || 0}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.chargePaymentDetail?.chargeBankAmount || 0}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.chargePaymentDetail?.bankName || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>{row?.netAmount}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.cashAmount || 0}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.bankAmount || 0}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5, px: 2 }}>
                {row.paymentDetail.bankName || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.entryBy || '-'}
              </TableCell>
              {getResponsibilityValue('print_loan_pay_history_detail', configs, user) ? (
                <TableCell sx={{ whiteSpace: 'nowrap', cursor: 'pointer', py: 0.5, px: 2 }}>
                  <Typography
                      onClick={() => {
                        view.onTrue();
                        setData(row);
                      }}
                      sx={{
                        cursor: 'pointer',
                        color: 'inherit',
                        pointerEvents: 'auto',
                      }}
                    >
                      <Iconify icon="basil:document-solid" />
                    </Typography>
                </TableCell>
              ) : (
                <TableCell>-</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Confirmation"
        content={`You are trying to close the loan before (${currentLoan.scheme.minLoanTime}) days. Are you want to continue?`}
        action={
          <Button variant="contained" color="info" onClick={onSubmit}>
            OK
          </Button>
        }
      />
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
            <Button color="inherit" variant="contained" onClick={() => sendPdfToWhatsApp()}>
              Share
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <Noc nocData={currentLoan} configs={configs} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

export default LoanCloseForm;
