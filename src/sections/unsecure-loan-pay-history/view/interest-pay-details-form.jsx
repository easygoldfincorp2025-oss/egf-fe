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
import { Dialog, DialogActions, IconButton } from '@mui/material';
import { useGetPenalty } from '../../../api/penalty';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useGetBranch } from '../../../api/branch';
import Button from '@mui/material/Button';
import Iconify from '../../../components/iconify';
import moment from 'moment';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import InterestPdf from '../PDF/interest-pdf';
import { useBoolean } from '../../../hooks/use-boolean';
import { ConfirmDialog } from '../../../components/custom-dialog';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import { useGetAllUnsecureSecureInterest } from '../../../api/unsecure-interest-pay.js';

const TABLE_HEAD = [
  { id: 'from', label: 'From Date' },
  { id: 'to', label: 'To Date' },
  { id: 'loanAmount', label: 'Loan Amt' },
  { id: 'interestLoanAmount', label: 'Int Loan Amt' },
  { id: 'interestRate', label: 'Int. + con. Rate' },
  { id: 'int+concharge', label: 'Int. amt' },
  { id: 'concharge', label: 'con. charge ' },
  { id: 'penaltyAmount', label: 'Penalty Amt' },
  { id: 'totalpay', label: 'Total pay' },
  { id: 'uchakAmt', label: 'Uchak Amt' },
  { id: 'oldcr/dr', label: 'Old cr/dr' },
  { id: 'payAfterAdjust', label: 'Pay After Adjust' },
  { id: 'days', label: 'Days' },
  { id: 'entryDate', label: 'Entry Date' },
  // { id: 'cashamt', label: 'Cash amt' },
  // { id: 'bankamt', label: 'Bank amt' },
  // { id: 'bank', label: 'Bank' },
  { id: 'totalPay', label: 'Total Pay Amt' },
  { id: 'pdf', label: 'PDF' },
  { id: 'entryBy', label: 'Entry By' },
  { id: 'action', label: 'Action' },
];

function InterestPayDetailsForm({ currentLoan, mutate, configs }) {
  const { penalty } = useGetPenalty();
  const [paymentMode, setPaymentMode] = useState('');
  const [data, setData] = useState(null);
  const view = useBoolean();
  const { branch } = useGetBranch();
  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState('');
  const { loanInterest, refetchLoanInterest } = useGetAllUnsecureSecureInterest(currentLoan._id);
  const table = useTable();
  const { user } = useAuthContext();
  const penaltyAmt = loanInterest.reduce((prev, next) => prev + (Number(next?.penalty) || 0), 0);

  const payAfterAdjustAmt = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.adjustedPay) || 0),
    0
  );


  const uchakAmt = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.uchakInterestAmount) || 0),
    0
  );

  const totalPayAmt = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.amountPaid) || 0),
    0
  );

  const cashAmt = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.bankAmount) || 0),
    0
  );

  const intAmt = loanInterest.reduce((prev, next) => prev + (Number(next?.interestAmount) || 0), 0);
  const oldCrDr = loanInterest.reduce((prev, next) => prev + (Number(next?.old_cr_dr) || 0), 0);
  const totalPay = loanInterest.reduce((prev, next) => prev + (Number(next?.totalPay) || 0), 0);
  const conCharge = loanInterest.reduce(
    (prev, next) => prev + (Number(next?.consultingCharge) || 0),
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
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),
          }
        : {
            cashAmount: Yup.number()
              .typeError('Cash Amount must be a valid number')
              .required('Cash Amount is required')
              .min(0, 'Cash Amount must be a positive number'),

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
    amountPaid: Yup.string()
      .required('Total is required')
      .test('is-positive', 'Amount must be a positive number', (value) => parseFloat(value) >= 0),
    interestAmount: Yup.string().required('Interest is required'),
    consultingCharge: Yup.string().required('Consult Charge is required'),
    penalty: Yup.string().required('Penalty is required'),
    uchakAmount: Yup.string().required('Uchak Amount is required'),
    cr_dr: Yup.string().required('New CR/DR is required'),
    totalPay: Yup.string().required('Total Pay is required'),
    payAfterAdjusted1: Yup.string().required('Pay After Adjusted 1 is required'),
    oldCrDr: Yup.string().required('Old CR/DR is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    ...paymentSchema,
  });

  const defaultValues = {
    from:
      currentLoan?.issueDate && loanInterest?.length === 0
        ? new Date(currentLoan.issueDate)
        : new Date(loanInterest[0]?.to).setDate(new Date(loanInterest[0]?.to).getDate() + 1),
    to: new Date(currentLoan.nextInstallmentDate),
    days: '',
    amountPaid: '',
    interestAmount: currentLoan?.scheme.interestRate || '',
    consultingCharge: '',
    penalty: '',
    uchakAmount: currentLoan?.uchakInterestAmount || 0,
    cr_dr: '',
    totalPay: '',
    payAfterAdjusted1: '',
    oldCrDr: loanInterest[0]?.cr_dr || 0,
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
  const from = watch('from');
  const to = watch('to');

  function calculatePenalty(interestLoanAmount, interestRate, differenceInDays) {
    const penalty = (((interestLoanAmount * interestRate) / 100) * (12 * differenceInDays)) / 365;
    return penalty.toFixed(2);
  }

  useEffect(() => {
    if (loanInterest && currentLoan) {
      reset(defaultValues);
    }
  }, [loanInterest, currentLoan, setValue]);

  useEffect(() => {
    const endDate = new Date(to).setHours(0, 0, 0, 0);
    const differenceInDays =
      moment(to).startOf('day').diff(moment(from).startOf('day'), 'days', true) + 1;
    const nextInstallmentDate = moment(currentLoan.nextInstallmentDate);
    const differenceInDays2 = moment(to)
      .startOf('day')
      .diff(nextInstallmentDate.startOf('day'), 'days', true);
    setValue('days', differenceInDays.toString());
    let penaltyPer = 0;
    penalty.forEach((penaltyItem) => {
      if (
        differenceInDays2 >= penaltyItem.afterDueDateFromDate &&
        differenceInDays2 <= penaltyItem.afterDueDateToDate &&
        penaltyItem.isActive === true &&
        nextInstallmentDate < endDate
      ) {
        penaltyPer = calculatePenalty(
          currentLoan.interestLoanAmount,
          penaltyItem.penaltyInterest,
          differenceInDays
        );
      }
    });
    setValue(
      'interestAmount',
      (
        (((currentLoan?.interestLoanAmount *
          1.25/
          100) *
          (12 * differenceInDays)) /
        365
      ).toFixed(2)
    ));
    setValue(
      'consultingCharge',
    0
    );
    setValue('penalty', penaltyPer);
    setValue(
      'totalPay',
      (
        Number(watch('interestAmount') || 0) +
        Number(watch('penalty') || 0) +
        Number(watch('consultingCharge') || 0)
      ).toFixed(2)
    );

    setValue(
      'payAfterAdjusted1',
      (Number(watch('totalPay')) - Number(watch('uchakAmount')) + Number(watch('oldCrDr'))).toFixed(
        2
      )
    );
    setValue(
      'cr_dr',
      (Number(watch('payAfterAdjusted1')) - Number(watch('amountPaid'))).toFixed(2)
    );
  }, [from, to, setValue, penalty, watch('amountPaid'), watch('oldCrDr')]);

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

  const sendPdfToWhatsApp = async (data) => {
    try {
      const blob = await pdf(<InterestPdf data={data} configs={configs} />).toBlob();
      const file = new File([blob], `interestPayment.pdf`, { type: 'application/pdf' });
      const payload = {
        firstName: data.loan.customer.firstName,
        middleName: data.loan.customer.middleName,
        lastName: data.loan.customer.lastName,
        contact: data.loan.customer.contact,
        loanNumber: data.loan.loanNo,
        interestAmount: data.amountPaid,
        nextInstallmentDate: data.loan.nextInstallmentDate,
        companyName: data.loan.company.name,
        companyEmail: data.loan.company.email,
        companyContact: data.loan.company.contact,
        branchContact: data.loan.customer.branch.contact,
        company: user.company,
        file,
        type: 'interest_payment',
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
    const amountPaid = parseFloat(data.amountPaid) || 0;
    const payAfterAdjusted = parseFloat(data.payAfterAdjusted1) || 0;

    if (amountPaid < payAfterAdjusted - 50) {
      enqueueSnackbar(`Amount Paid must be at least ${payAfterAdjusted - 50}.`, {
        variant: 'error',
      });
      return;
    }

    let paymentDetail = {
      paymentMode: data.paymentMode,
    };

    if (data.paymentMode === 'Cash') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: parseFloat(data.cashAmount) || 0,
      };
    } else if (data.paymentMode === 'Bank') {
      paymentDetail = {
        ...paymentDetail,
        account: data.account,
        bankAmount: parseFloat(data.bankAmount) || 0,
      };
    } else if (data.paymentMode === 'Both') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: parseFloat(data.cashAmount) || 0,
        account: data.account,
        bankAmount: parseFloat(data.bankAmount) || 0,
      };
    }

    const payload = {
      entryBy: user.firstName + ' ' + user.middleName + ' ' + user.lastName,
      to: new Date(data.to),
      adjustedPay: parseFloat(data.payAfterAdjusted1) || 0,
      days: parseInt(data.days, 10) || 0,
      uchakInterestAmount: parseFloat(data.uchakAmount) || 0,
      interestAmount: parseFloat(data.interestAmount) || 0,
      consultingCharge: parseFloat(data.consultingCharge) || 0,
      old_cr_dr: parseFloat(data.oldCrDr) || 0,
      from: loanInterest?.length === 0 ? new Date(watch('from')) : new Date(Number(data.from)),
      amountPaid,
      penalty: parseFloat(data.penalty) || 0,
      cr_dr: parseFloat(data.cr_dr) || 0,
      paymentDetail,
      interestLoanAmount: currentLoan.interestLoanAmount,
    };

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/interest-payment`;
      const config = {
        method: 'post',
        url,
        data: payload,
      };
      const response = await axios(config);
      sendPdfToWhatsApp(response?.data?.data);
      mutate();
      refetchLoanInterest();
      enqueueSnackbar(response?.data.message);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to pay interest', { variant: 'error' });
    }
  });

  useEffect(() => {
    const totalAmountPaid = parseFloat(watch('amountPaid')) || 0;
    const paymentMode = watch('paymentMode');
    const cashAmount = parseFloat(watch('cashAmount')) || 0;

    if (paymentMode === 'Cash') {
      setValue('cashAmount', totalAmountPaid);
      setValue('bankAmount', 0);
    } else if (paymentMode === 'Bank') {
      setValue('bankAmount', totalAmountPaid);
      setValue('cashAmount', 0);
    } else if (paymentMode === 'Both') {
      const updatedBankAmount = totalAmountPaid - cashAmount;
      setValue('bankAmount', updatedBankAmount >= 0 ? updatedBankAmount.toFixed(2) : 0);
    }
  }, [watch('amountPaid'), watch('paymentMode'), watch('cashAmount')]);

  const handleDeleteInterest = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/loans/${currentLoan._id}/interest-payment/${id}`
      );
      setDeleteId(null);
      confirm.onFalse();
      refetchLoanInterest();
      mutate();
      enqueueSnackbar(response?.data.message, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to pay interest', { variant: 'error' });
    }
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
            md: 'repeat(6, 1fr)',
          }}
        >
          <RhfDatePicker
            name="from"
            control={control}
            label="From Date"
            req={'red'}
            disabled={true}
          />
          <RhfDatePicker name="to" control={control} label="To Date" req={'red'} />
          <RHFTextField name="days" label="Days" req={'red'} InputProps={{ readOnly: true }} />
          <RHFTextField
            name="interestAmount"
            label="Interest"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="consultingCharge"
            label="Consult Charge"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="penalty"
            label="Penalty"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="totalPay"
            label="Total Pay"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="uchakAmount"
            label="Uchak Amount"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="oldCrDr"
            label="Old CR/DR"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="payAfterAdjusted1"
            label="Pay After Adjusted 1"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="cr_dr"
            label="New CR/DR"
            req={'red'}
            InputProps={{ readOnly: true }}
          />
          <RHFTextField
            name="amountPaid"
            label="Total Pay Amount"
            req={'red'}
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                e.preventDefault();
              }
            }}
          />
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
                md: 'repeat(6, 1fr)',
              }}
              sx={{ mt: 1 }}
            >
              <RHFAutocomplete
                name="paymentMode"
                label="Payment Mode"
                options={['Cash', 'Bank', 'Both']}
                onChange={(event, value) => {
                  setValue('paymentMode', value);
                  const totalAmountPaid = parseFloat(watch('amountPaid')) || 0;

                  if (value === 'Cash') {
                    setValue('cashAmount', totalAmountPaid);
                    setValue('bankAmount', 0);
                  } else if (value === 'Bank') {
                    setValue('bankAmount', totalAmountPaid);
                    setValue('cashAmount', 0);
                  } else if (value === 'Both') {
                    const splitCash = totalAmountPaid * 0.5;
                    setValue('cashAmount', splitCash.toFixed(2));
                    setValue('bankAmount', (totalAmountPaid - splitCash).toFixed(2));
                  }
                }}
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
                        {`${option.bankName}(${option.accountHolderName})`}
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
          {currentLoan.status !== 'Closed' && (
            <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
              <Button
                color="inherit"
                sx={{ height: '36px' }}
                variant="outlined"
                onClick={() => reset()}
              >
                Reset
              </Button>
              {getResponsibilityValue('create_interest', configs, user) && (
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
          <Table sx={{ borderRadius: '16px', mt: 2.5, minWidth: '1600px' }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              onSort={table.onSort}
            />
            <TableBody>
              {loanInterest.map((row, index) => (
                <>
                  <TableRow key={index} hover>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.from)}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.to)}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.loan.loanAmount}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>
                      {row.interestLoanAmount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0,
                        px: 2,
                      }}
                    >
                      1.25
                    </TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>
                      {(row?.interestAmount).toFixed(2) || 0}
                    </TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>
                      {Number(row?.consultingCharge).toFixed(2)}
                    </TableCell>

                    <TableCell sx={{ py: 0, px: 2 }}>{row.penalty}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>
                      {(row.interestAmount + row.penalty + row.consultingCharge).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.uchakInterestAmount || 0}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.old_cr_dr}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.adjustedPay}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{row.days}</TableCell>
                    <TableCell sx={{ py: 0, px: 2 }}>{fDate(row.createdAt)}</TableCell>
                    {/* <TableCell sx={{ py: 0, px: 2 }}>{row?.paymentDetail?.cashAmount?.toFixed(2) || 0}</TableCell> */}
                    {/* <TableCell sx={{ py: 0, px: 2 }}>{row?.paymentDetail?.bankAmount?.toFixed(2) || 0}</TableCell> */}
                    {/* <TableCell sx={{ py: 0, px: 2 }}> */}
                    {/*   {row?.paymentDetail?.account?.bankName && */}
                    {/*   row?.paymentDetail?.account?.accountHolderName */}
                    {/*     ? `${row.paymentDetail.account.bankName} (${row.paymentDetail.account.accountHolderName})` */}
                    {/*     : '-'} */}
                    {/* </TableCell> */}
                    <TableCell sx={{ py: 0, px: 2 }}>{row.amountPaid.toFixed(2)}</TableCell>
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
                    <TableCell sx={{ whiteSpace: 'nowrap', py: 0, px: 2 }}>
                      {row.entryBy || '-'}
                    </TableCell>
                    {getResponsibilityValue('delete_interest', configs, user) ? (
                      <TableCell sx={{ py: 0, px: 2 }}>
                        {
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
                        }
                      </TableCell>
                    ) : (
                      <TableCell>-</TableCell>
                    )}
                  </TableRow>
                </>
              ))}{' '}
              <TableRow sx={{ backgroundColor: '#F4F6F8' }}>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  TOTAL
                </TableCell>
                <TableCell />
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell
                  sx={{
                    fontWeight: '600',
                    color: '#637381',
                    py: 1,
                    px: 2,
                  }}
                >
                  {intAmt.toFixed(0)}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: '600',
                    color: '#637381',
                    py: 1,
                    px: 2,
                  }}
                >
                  {conCharge.toFixed(0)}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: '600',
                    color: '#637381',
                    py: 1,
                    px: 2,
                  }}
                >
                  {penaltyAmt.toFixed(0)}
                </TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  {(intAmt + penaltyAmt + conCharge).toFixed(2)}{' '}
                </TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  {uchakAmt.toFixed(0)}
                </TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  {oldCrDr.toFixed(0)}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: '600',
                    color: '#637381',
                    py: 1,
                    px: 2,
                  }}
                >
                  {payAfterAdjustAmt.toFixed(0)}
                </TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                {/* <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}> */}
                {/*   {cashAmt.toFixed(0)} */}
                {/* </TableCell> */}
                {/* <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}> */}
                {/*   {bankAmt.toFixed(0)} */}
                {/* </TableCell>{' '} */}
                {/* <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell> */}
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  {totalPayAmt.toFixed(0)}
                </TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
              <InterestPdf data={data} configs={configs} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

export default InterestPayDetailsForm;
