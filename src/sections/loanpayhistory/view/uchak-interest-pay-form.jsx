import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
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
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useGetBranch } from '../../../api/branch';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import { useGetAllUchakPay } from '../../../api/uchak';
import { TableHeadCustom } from '../../../components/table';
import { fDate } from '../../../utils/format-time';
import Iconify from '../../../components/iconify';
import { ConfirmDialog } from '../../../components/custom-dialog';
import { useBoolean } from '../../../hooks/use-boolean';
import { useGetAllInterest } from '../../../api/interest-pay';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { useGetConfigs } from '../../../api/config';
import UchakInterstPayDetailPdf from '../PDF/uchak-interst-pay-detail-pdf';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';

const TABLE_HEAD = [
  { id: 'uchakPayDate', label: 'Uchak Pay Date' },
  {
    id: 'uchakIntAmt',
    label: 'Uchak Int Amt',
  },
  {
    id: 'entryDate',
    label: 'Entry Date',
  },
  { id: 'remark', label: 'Remarks' },
  { id: 'entryBy', label: 'Entry By' },
  { id: 'cashAmt', label: 'Cash amt' },
  { id: 'bankAmt', label: 'Bank amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'action', label: 'Action' },
  { id: 'PDF', label: 'PDF' },
];

function UchakInterestPayForm({ currentLoan, mutate }) {
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const { uchak, refetchUchak } = useGetAllUchakPay(currentLoan._id);
  const { loanInterest } = useGetAllInterest(currentLoan._id);
  const [paymentMode, setPaymentMode] = useState('');
  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState('');
  const view = useBoolean();
  const [data, setData] = useState(null);
  const { configs } = useGetConfigs();
  const uchakAmt = uchak.reduce((prev, next) => prev + (Number(next?.amountPaid) || 0), 0);

  const cashAmt = uchak.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = uchak.reduce(
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

  const NewUchakSchema = Yup.object().shape({
    uchakPayDate: Yup.date().nullable().required('Uchak Pay date is required'),
    uchakInterestAmount: Yup.number()
      .min(1, 'Uchak Interest Pay Amount must be greater than 0')
      .required('Uchak Interest Pay Amount is required')
      .typeError('Uchak Interest Pay Amount must be a number'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    ...paymentSchema,
  });

  const defaultValues = {
    uchakPayDate: new Date(),
    uchakInterestAmount: null,
    remark: '',
    paymentMode: '',
    cashAmount: '',
    bankAmount: null,
    account: null,
  };

  const methods = useForm({
    resolver: yupResolver(NewUchakSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  const sendPdfToWhatsApp = async (item) => {
    try {
      const blob = await pdf(
        <UchakInterstPayDetailPdf data={item ? item : data} configs={configs} />
      ).toBlob();
      const file = new File([blob], `Uchak-Interest-Paydetail.pdf`, { type: 'application/pdf' });
      const payload = {
        firstName: item ? item.loan.customer.firstName : data.loan.customer.firstName,
        middleName: item ? item.loan.customer.middleName : data.loan.customer.middleName,
        lastName: item ? item.loan.customer.lastName : data.loan.customer.lastName,
        loanNumber: item ? item.loan.loanNo : data.loan.loanNo,
        contact: item ? item.loan.customer.contact : data.loan.customer.contact,
        amountPaid: item ? item.amountPaid : data.amountPaid,
        companyName: item ? item.loan.company.name : data.loan.company.name,
        companyEmail: item ? item.loan.company.email : data.loan.company.email,
        companyContact: item ? item.loan.company.contact : data.loan.company.contact,
        branchContact: item ? item.loan.customer.branch.contact : data.loan.customer.branch.contact,
        company: user.company,
        file,
        type: 'uchak_interest',
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
      entryBy: user.firstName + ' ' + user.middleName + ' ' + user.lastName,
      remark: data.remark,
      date: data.uchakPayDate,
      amountPaid: data.uchakInterestAmount,
      paymentDetail: paymentDetail,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/uchak-interest-payment`;
      const config = {
        method: 'post',
        url,
        data: payload,
      };

      const response = await axios(config);
      const responseData = response?.data?.data;
      sendPdfToWhatsApp(responseData);
      reset();
      refetchUchak();
      mutate();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to uchak interest pay', { variant: 'error' });
    }
  });

  const handleCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('uchakInterestAmount')) || '';

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

  const handleDeleteUchak = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/uchak-interest-payment/${id}`
      );
      mutate();
      setDeleteId(null);
      refetchUchak();
      confirm.onFalse();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to pay uchak interest', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container rowSpacing={3} columnSpacing={2}>
          <Grid item xs={4}>
            <RhfDatePicker
              name="uchakPayDate"
              control={control}
              label="Uchak Pay date"
              req={'red'}
            />
          </Grid>
          <Grid item xs={4}>
            <RHFTextField
              name="uchakInterestAmount"
              label="Uchak Interest Amount"
              req={'red'}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                  e.preventDefault();
                }
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <RHFTextField name="remark" label="Remark" />
          </Grid>
        </Grid>
        <Grid item pb={2}>
          <Typography variant="subtitle1" my={1}>
            Payment Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                  handleLoanAmountChange({ target: { value: watch('uchakInterestAmount') } });
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              {(watch('paymentMode') === 'Cash' || watch('paymentMode') === 'Both') && (
                <>
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
                </>
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
              <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                <Button color="inherit" variant="outlined" onClick={() => reset()}>
                  Reset
                </Button>
                {getResponsibilityValue('create_uchak_interest', configs, user) && (
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Submit
                  </LoadingButton>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </FormProvider>
      <Table sx={{ borderRadius: '8px', overflow: 'hidden', mt: 3 }}>
        <TableHeadCustom headLabel={TABLE_HEAD} />
        <TableBody>
          {uchak &&
            uchak.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{fDate(row.date)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{row.amountPaid}</TableCell>
                <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.createdAt)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>{row.remark}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                  {row.entryBy || '-'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                  {row.paymentDetail.cashAmount || 0}
                </TableCell>{' '}
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                  {row.paymentDetail.bankAmount || 0}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                  {row.paymentDetail.bankName || '-'}
                </TableCell>
                {getResponsibilityValue('delete_uchak_interest', configs, user) ? (
                  <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                    {
                      <IconButton
                        color="error"
                        onClick={() => {
                          if (
                            new Date(loanInterest[0]?.entryDate) > new Date(row.date) ||
                            loanInterest.length === 0
                          ) {
                            confirm.onTrue();
                            setDeleteId(row?._id);
                          }
                        }}
                        sx={{
                          cursor:
                            new Date(loanInterest[0]?.entryDate) < new Date(row.date) ||
                            loanInterest.length === 0
                              ? 'pointer'
                              : 'default',
                          opacity:
                            new Date(loanInterest[0]?.entryDate) < new Date(row.date) ||
                            loanInterest.length === 0
                              ? 1
                              : 0.5,
                          pointerEvents:
                            new Date(loanInterest[0]?.entryDate) < new Date(row.date) ||
                            loanInterest.length === 0
                              ? 'auto'
                              : 'none',
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
                  <TableCell sx={{ whiteSpace: 'nowrap', cursor: 'pointer', py: 0, px: 2 }}>
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
              {uchakAmt}
            </TableCell>
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
          </TableRow>
        </TableBody>
      </Table>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => handleDeleteUchak(deleteId)}>
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
              <UchakInterstPayDetailPdf data={data} configs={configs} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

export default UchakInterestPayForm;
