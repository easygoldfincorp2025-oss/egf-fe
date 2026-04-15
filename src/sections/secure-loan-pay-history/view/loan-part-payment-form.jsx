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
import { fDate } from '../../../utils/format-time';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useGetBranch } from '../../../api/branch';
import Button from '@mui/material/Button';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import Iconify from '../../../components/iconify';
import { ConfirmDialog } from '../../../components/custom-dialog';
import { usePopover } from '../../../components/custom-popover';
import { useBoolean } from '../../../hooks/use-boolean';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { useGetConfigs } from '../../../api/config';
import LoanPartPaymentDetailsPdf from '../PDF/loan-part-payment-details-pdf';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import { useGetAllSecurePartPayment } from '../../../api/secure-part-payment.js';
import { useGetAllSecureInterest } from '../../../api/secure-interest-pay.js';

const TABLE_HEAD = [
  { id: 'loanAmount', label: 'Loan Amount' },
  { id: 'intLoanAmount', label: 'INT Loan Amt' },
  { id: 'payAmount', label: 'Pay Amount' },
  { id: 'pendingLoanAmount', label: 'Pending Loan Amount' },
  { id: 'payDate', label: 'Pay Date' },
  { id: 'entryDate', label: 'Entry Date' },
  { id: 'remarks', label: 'Remarks' },
  { id: 'cashAmt', label: 'Cash Amt' },
  { id: 'bankAmt', label: 'Bank Amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'entryBy', label: 'Entry By' },
  { id: 'action', label: 'Action' },
  { id: 'PDF', label: 'PDF' },
];

function LoanPartPaymentForm({ currentLoan, mutate }) {
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const { partPayment, refetchPartPayment } = useGetAllSecurePartPayment(currentLoan._id);
  const { loanInterest, refetchLoanInterest } = useGetAllSecureInterest(currentLoan._id);
  const confirm = useBoolean();
  const popover = usePopover();
  const [deleteId, setDeleteId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const view = useBoolean();
  const [data, setData] = useState(null);
  const { configs } = useGetConfigs();
  const payAmt = partPayment.reduce((prev, next) => prev + (Number(next?.amountPaid) || 0), 0);

  const intAmt = partPayment.reduce(
    (prev, next) => prev + (Number(next?.interestLoanAmount) || 0),
    0
  );

  const cashAmt = partPayment.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = partPayment.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.bankAmount) || 0),
    0
  );

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

  const NewPartPaymentSchema = Yup.object().shape({
    date: Yup.date().nullable().required('Uchak Pay date is required'),
    expectPaymentMode: Yup.string().required('Expected Payment Mode is required'),
    amountPaid: Yup.number()
      .min(1, 'Uchak Interest Pay Amount must be greater than 0')
      .required('Uchak Interest Pay Amount is required')
      .typeError('Uchak Interest Pay Amount must be a number'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    ...paymentSchema,
  });

  const defaultValues = {
    date: new Date(),
    amountPaid: '',
    remark: '',
    paymentMode: '',
    cashAmount: '',
    account: null,
    bankAmount: null,
    expectPaymentMode: null,
  };

  const methods = useForm({
    resolver: yupResolver(NewPartPaymentSchema),
    defaultValues,
  });

  const {
    control,
    watch,
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const sendPdfToWhatsApp = async (item) => {
    try {
      const blob = await pdf(
        <LoanPartPaymentDetailsPdf data={item ? item : data} configs={configs} />
      ).toBlob();
      const file = new File([blob], `LoanPartPaymentDetailsPdf.pdf`, { type: 'application/pdf' });
      const payload = {
        firstName: item ? item.loan.customer.firstName : data.loan.customer.firstName,
        middleName: item ? item.loan.customer.middleName : data.loan.customer.middleName,
        lastName: item ? item.loan.customer.lastName : data.loan.customer.lastName,
        loanNumber: item ? item.loan.loanNo : data.loan.loanNo,
        contact: item ? item.loan.customer.contact : data.loan.customer.contact,
        amountPaid: item ? item.amountPaid : data.amountPaid,
        createdAt: item ? item.createdAt : data.createdAt,
        interestLoanAmount: item ? item.loan.interestLoanAmount : data.loan.interestLoanAmount,
        nextInstallmentDate: item ? item.loan.nextInstallmentDate : data.loan.nextInstallmentDate,
        companyName: item ? item.loan.company.name : data.loan.company.name,
        companyEmail: item ? item.loan.company.email : data.loan.company.email,
        companyContact: item ? item.loan.company.contact : data.loan.company.contact,
        branchContact: item ? item.loan.customer.branch.contact : data.loan.customer.branch.contact,
        company: user.company,
        file,
        type: 'part_payment',
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

  const onSubmit = handleSubmit(async (data) => {
    const loanToDate = loanInterest[0]?.to;
    const selectedDate = watch('date');

    const date1 = loanToDate ? new Date(loanToDate).toISOString().split('T')[0] : null;
    const date2 = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : null;

    if (!date1 || !date2 || date1 < date2) {
      return enqueueSnackbar('Please pay interest up to today after making a  loan part payment.', {
        variant: 'info',
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
    const payload = {
      entryBy: user.firstName + ' ' + user.middleName + ' ' + user.lastName,
      remark: data.remark,
      date: data.date,
      interestLoanAmount: currentLoan.interestLoanAmount,
      amountPaid: data.amountPaid,
      paymentDetail: paymentDetail,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/part-payment`;

      const config = {
        method: 'post',
        url,
        data: payload,
      };

      const response = await axios(config);
      const responseData = response?.data?.data;
      sendPdfToWhatsApp(responseData);
      refetchPartPayment();
      mutate();
      reset();
      enqueueSnackbar(response?.data.message);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
      setValue('paymentMode', watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  const handleDeletePartPayment = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/part-payment/${id}`
      );
      refetchPartPayment();
      mutate();
      confirm.onFalse();
      enqueueSnackbar(response?.data.message);
    } catch (err) {
      enqueueSnackbar('Failed to pay interest');
    }
  };

  const handleCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('amountPaid')) || '';

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

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', gap: 4, mb: 1.5 }}>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: '700' }}>
            Cash Amount : {currentLoan.cashAmount || 0}
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ fontWeight: '700' }}>
            Bank Amount : {currentLoan.bankAmount || 0}
          </Typography>
        </Box>
        <Grid container rowSpacing={3} columnSpacing={2}>
          <Grid item xs={3}>
            <RhfDatePicker name="date" control={control} label="Pay date" req={'red'} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <RHFTextField
              name="amountPaid"
              label="Pay Amount"
              req="red"
              fullWidth
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <RHFTextField name="remark" label="Remark" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
        </Grid>
        <Grid spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
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
                  md: 'repeat(5, 1fr)',
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
                    handleLoanAmountChange({ target: { value: watch('amountPaid') } });
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
              </Box>
              {currentLoan.status !== 'Closed' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    color="inherit"
                    sx={{ margin: '0px 10px', height: '36px' }}
                    variant="outlined"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                  {getResponsibilityValue('create_loan_part_payment', configs, user) && (
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
          {partPayment.map((row, index) => (
            <TableRow key={index} hover>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.loan.loanAmount}
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  py: 0,
                  px: 2,
                }}
              >
                {row.interestLoanAmount}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{row.amountPaid}</TableCell>
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                  py: 0,
                  px: 2,
                }}
              >
                {(Number(row.interestLoanAmount) - Number(row.amountPaid)).toFixed(2)}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{fDate(row.date)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {fDate(row.createdAt)}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{row.remark}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.paymentDetail.cashAmount || 0}
              </TableCell>{' '}
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.paymentDetail.bankAmount || 0}
              </TableCell>{' '}
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.paymentDetail.bankName || '-'}
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                {row.entryBy || '-'}
              </TableCell>
              {getResponsibilityValue('delete_loan_part_payment', configs, user) ? (
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                  {
                    <IconButton
                      color="error"
                      onClick={() => {
                        confirm.onTrue();
                        popover.onClose();
                        setDeleteId(row?._id);
                      }}
                    >
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  }
                </TableCell>
              ) : (
                <TableCell>-</TableCell>
              )}
              {getResponsibilityValue('print_loan_pay_history_detail', configs, user) ? (
                <TableCell sx={{ whiteSpace: 'nowrap', cursor: 'pointer', py: 0, px: 1 }}>
                  {
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
                  }
                </TableCell>
              ) : (
                <TableCell>-</TableCell>
              )}
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>TOTAL</TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
              {intAmt}
            </TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
              {payAmt}
            </TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
              {cashAmt}
            </TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
              {bankAmt}
            </TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
            <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeletePartPayment(deleteId)}
          >
            Delete
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
              <LoanPartPaymentDetailsPdf data={data} configs={configs} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

export default LoanPartPaymentForm;
