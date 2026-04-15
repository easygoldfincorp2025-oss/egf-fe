import * as Yup from 'yup';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { Alert } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetScheme } from '../../api/scheme';
import Button from '@mui/material/Button';
import { useGetCustomer } from '../../api/customer';
import { ACCOUNT_TYPE_OPTIONS } from '../../_mock';
import { useGetCarat } from '../../api/carat';
import { useRouter } from '../../routes/hooks';
import { useGetBranch } from '../../api/branch';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import 'react-image-crop/dist/ReactCrop.css';
import { useGetConfigs } from '../../api/config';
import { useGetLoanissue } from '../../api/loanissue.js';
import Image from '../../components/image/index.js';
import Lightbox, { useLightBox } from '../../components/lightbox/index.js';
import { useGetOtherLoanissue } from '../../api/other-loan-issue.js';
import { paths } from '../../routes/paths.js';

//----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'type', label: 'Type' },
  { id: 'carat', label: 'Carat' },
  { id: 'Pcs', label: 'Pcs' },
  { id: 'totalWt', label: 'Total wt' },
  { id: 'lossWt', label: 'Loss Wt' },
  { id: 'grossWt', label: 'Gross Wt' },
  { id: 'netWt', label: 'Net Wt' },
  { id: 'grossAmt', label: 'Gross Amt' },
  { id: 'netAmt', label: 'Net Amt' },
  { id: 'actions', label: 'Actions' },
];

export default function OtherLoanissueNewEditForm({ currentOtherLoanIssue }) {
  const { otherLoanissue } = useGetOtherLoanissue();
  const router = useRouter();
  const [loanId, setLoanID] = useState();
  const [customerData, setCustomerData] = useState();
  const [schemeId, setSchemeID] = useState();
  const [capturedImage, setCapturedImage] = useState(null);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const { customer } = useGetCustomer();
  const { Loanissue } = useGetLoanissue();
  const { scheme } = useGetScheme();
  const { configs, mutate } = useGetConfigs();
  const { carat } = useGetCarat();
  const { enqueueSnackbar } = useSnackbar();
  const [multiSchema, setMultiSchema] = useState([]);
  const [isFieldsEnabled, setIsFieldsEnabled] = useState(false);
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const lightbox = useLightBox(file);
  const [propertImg, setPropertImg] = useState(null);

  useEffect(() => {
    setMultiSchema(scheme);
  }, [scheme]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
    }
  }, [imageSrc]);

  const NewLoanissueSchema = Yup.object().shape({
    loan: Yup.object().required('Loan is required'),
    otherName: Yup.string().required('Other Name is required'),
    otherNumber: Yup.string().required('Other Number is Number').max(10),
    amount: Yup.string().required('Amount is required'),
    percentage: Yup.string().required('Percent is required'),
    date: Yup.date().required('Date is required'),
    grossWt: Yup.string().required('groos wt'),
    netWt: Yup.string().required('NetWas wt'),
    month: Yup.string().required('Month is required'),
    renewalDate: Yup.date().required('Renewaldate is required'),
    otherCharge: Yup.string().required('OtherCharge is required'),
    code: Yup.string().required('Code is required'),
    closingCharge: Yup.string().required('ClosingCharge is required'),
    interestAmount: Yup.string().required('Interest Amount is required'),
    totalOrnament: Yup.string().required('Total Ornament is required'),
    ornamentDetail: Yup.string().required('Ornament Detail is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    cashAmount: Yup.string().when('paymentMode', {
      is: (val) => val === 'Cash' || val === 'Both',
      then: (schema) => schema.required('Cash Amount is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    bankAmount: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Bank Amount is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    account: Yup.object().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Account is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    accountNumber: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Account Number is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    accountType: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Account Type is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    accountHolderName: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Account Holder Name is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    IFSC: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) =>
        schema
          .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code')
          .required('IFSC Code is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    bankName: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Bank Name is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    branchName: Yup.string().when('paymentMode', {
      is: (val) => val === 'Bank' || val === 'Both',
      then: (schema) => schema.required('Branch Name is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const defaultValues = useMemo(() => {
    const baseValues = {
      customer_url: '',
      customerCode: '',
      customerName: null,
      customerAddress: null,
      contact: '',
      contactOtp: '',
      interestRate: '',
      periodTime: '',
      renewalTime: '',
      loanCloseTime: '',
      totalOrnament: currentOtherLoanIssue?.totalOrnament || null,
      ornamentDetail: currentOtherLoanIssue?.ornamentDetail || null,
      property_image: currentOtherLoanIssue?.loan?.propertyImage || null,
      loan: currentOtherLoanIssue
        ? {
            id: currentOtherLoanIssue?.loan?._id,
            loanNo: currentOtherLoanIssue?.loan?.loanNo,
          }
        : null,
      scheme: currentOtherLoanIssue ? currentOtherLoanIssue?.loan?.scheme : null,
      loanNo: currentOtherLoanIssue?.loanNo || '',
      otherLoanNumber: currentOtherLoanIssue?.otherLoanNumber || '',
      issueDate: currentOtherLoanIssue
        ? new Date(currentOtherLoanIssue?.loan?.issueDate)
        : new Date(),
      consultingCharge: currentOtherLoanIssue?.loan?.consultingCharge || '',
      approvalCharge: currentOtherLoanIssue?.loan?.approvalCharge || 0,
      nextInstallmentDate: currentOtherLoanIssue
        ? new Date(currentOtherLoanIssue?.loan?.nextInstallmentDate)
        : null,
      jewellerName: currentOtherLoanIssue?.loan?.jewellerName || '',
      loanType: currentOtherLoanIssue?.loan?.loanType || '',
      loanAmount: '',
      loanTotalWt: '',
      loanNetWt: '',
      code: currentOtherLoanIssue?.code || '',
      totalLoanAmount: currentOtherLoanIssue?.loan?.loanAmount || '',
      partLoanAmount: currentOtherLoanIssue?.loan?.partLoanAmount || '',
      intLoanAmount: currentOtherLoanIssue?.loan?.intLoanAmount || '',
      intRate: currentOtherLoanIssue?.loan?.intRate || '',
      paymentMode: currentOtherLoanIssue?.paymentMode || '',
      account: currentOtherLoanIssue?.bankDetails?.account || null,
      cashAmount: currentOtherLoanIssue?.cashAmount || '',
      bankAmount: currentOtherLoanIssue?.bankAmount || 0,
      accountNumber: currentOtherLoanIssue?.bankDetails?.accountNumber || '',
      accountType: currentOtherLoanIssue?.bankDetails?.accountType || '',
      accountHolderName: currentOtherLoanIssue?.bankDetails?.accountHolderName || '',
      IFSC: currentOtherLoanIssue?.bankDetails?.IFSC || '',
      bankName: currentOtherLoanIssue?.bankDetails?.bankName || '',
      branchName: currentOtherLoanIssue?.bankDetails?.branchName || null,
      otherName: currentOtherLoanIssue?.otherName || '',
      otherNumber: currentOtherLoanIssue?.otherNumber || '',
      amount: currentOtherLoanIssue?.amount || 0,
      percentage: currentOtherLoanIssue?.percentage || 0,
      date: currentOtherLoanIssue?.date ? new Date(currentOtherLoanIssue.date) : new Date(),
      grossWt: currentOtherLoanIssue?.grossWt || 0,
      netWt: currentOtherLoanIssue?.netWt || 0,
      rate: currentOtherLoanIssue?.rate || 0,
      month: currentOtherLoanIssue?.month || '',
      renewalDate: currentOtherLoanIssue?.renewalDate
        ? new Date(currentOtherLoanIssue.renewalDate)
        : '',
      closeDate: currentOtherLoanIssue?.closeDate || '',
      otherCharge: currentOtherLoanIssue?.otherCharge || 0,
      closingCharge: currentOtherLoanIssue?.closingCharge || 0,
      interestAmount: currentOtherLoanIssue?.interestAmount || 0,
      remark: currentOtherLoanIssue?.remark || '',
    };
    return baseValues;
  }, [currentOtherLoanIssue]);

  const cutoffDate = new Date("2025-08-01");

  const methods = useForm({
    resolver: yupResolver(NewLoanissueSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = methods;

  useEffect(() => {
    const loan = watch('loan');
    if (loan) {
      const otherLoan = otherLoanissue.filter((item) => item.loan._id === loan?.id);
      otherLoan.length > 0 &&
        !currentOtherLoanIssue &&
        enqueueSnackbar(`${otherLoan?.length} loans already exists for the selected loan`, {
          variant: 'warning',
        });
    }
  }, [watch('loan')]);

  useEffect(() => {
    const otherNo = watch('otherNumber');
    if (otherNo) {
      const otherNumber = otherLoanissue.filter((item) => item.otherNumber === otherNo);
      otherNumber.length > 0 &&
        !currentOtherLoanIssue &&
        enqueueSnackbar(
          `${otherNumber?.length} loans already exists for the selected other number`,
          {
            variant: 'warning',
          }
        );
    }
  }, [watch('otherNumber')]);

  useEffect(() => {
    setValue('loanAmount', watch('amount'));
  }, [watch('amount'), watch('loanAmount')]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyDetails',
  });

  useEffect(() => {
    const rate = (watch('amount') / watch('netWt')).toFixed(2);
    setValue('rate', rate);
  }, [watch('amount'), watch('netWt')]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      loan: data.loan.id,
      otherName: data.otherName,
      otherNumber: data.otherNumber,
      amount: data.amount,
      percentage: data.percentage,
      date: data.date,
      grossWt: data.grossWt,
      netWt: data.netWt,
      ornamentDetail: data.ornamentDetail,
      totalOrnament: data.totalOrnament,
      rate: data.rate,
      month: data.month,
      renewalDate: data.renewalDate,
      otherCharge: data.otherCharge,
      remark: data.remark,
      paymentMode: data.paymentMode,
      cashAmount: data.cashAmount,
      code: data.code,
      bankAmount: data.bankAmount,
      bankDetails: {
        account: data.account,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        accountHolderName: data.accountHolderName,
        IFSC: data.IFSC,
        bankName: data.bankName,
        branchName: data.branchName,
      },
    };

    try {
      const url = currentOtherLoanIssue
        ? `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loans/${currentOtherLoanIssue?._id}`
        : `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loan-issue`;

      const loanResponse = currentOtherLoanIssue
        ? await axios.put(url, payload)
        : await axios.post(url, payload);

      if (!currentOtherLoanIssue) {
        const selectedLoan = Loanissue.find((e) => data.loan.id === e._id);

        const chargePayload = {
          chargeType: 'APPROVAL CHARGE',
          date: data.date,
          branch: selectedLoan?.customer?.branch?._id,
          status: 'Payment Out',
          paymentDetail: {
            paymentMode: data.paymentMode,
            cashAmount: data.paymentMode === 'Cash' ? data.otherCharge : 0,
            bankAmount: data.paymentMode === 'Bank' ? data.otherCharge : 0,
            bankDetails: {
              account: data.account,
              accountNumber: data.accountNumber,
              accountType: data.accountType,
              accountHolderName: data.accountHolderName,
              IFSC: data.IFSC,
              bankName: data.bankName,
              branchName: data.branchName,
            },
          },
          category: data.loan.loanNo,
          otherLoanId: loanResponse.data?.data?._id || null,
        };

        await axios.post(`${import.meta.env.VITE_BASE_URL}/${user?.company}/charge`, chargePayload);
      }

      enqueueSnackbar(
        currentOtherLoanIssue
          ? 'Loan updated successfully!'
          : 'Loan and charge processed successfully!',
        { variant: 'success' }
      );

      router.push(paths.dashboard.other_loanissue.root);
      setCapturedImage(null);
      reset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        currentOtherLoanIssue
          ? 'Failed to update loan.'
          : error.response?.data?.message || 'Something went wrong.',
        { variant: 'error' }
      );
    }
  });

  useEffect(() => {
    const month = watch('month');

    if (!month) {
      return;
    }

    const monthsToAdd =
      month === 'MONTHLY' ? 1 : month === 'YEARLY' ? 12 : parseInt(month.split(' ')[0], 10) || 0;

    const calculatedDate = new Date(watch('date'));
    calculatedDate.setMonth(calculatedDate.getMonth() + monthsToAdd);

    setValue('renewalDate', calculatedDate);
  }, [watch('month'), watch('date')]);

  const handleCustomerSelect = (selectedCustomer) => {
    if (selectedCustomer) {
      setIsFieldsEnabled(true);
    } else {
      setIsFieldsEnabled(false);
    }
  };

  useEffect(() => {
    const loan = watch('loan');
    const scheme = watch('scheme');
    if (customer) {
      handleCustomerSelect(loan);
      setLoanID(loan);
    } else {
      setLoanID(null);
    }
    if (scheme) {
      setSchemeID(scheme);
    } else {
      setSchemeID(null);
    }
  }, [watch('loan'), watch('scheme'), currentOtherLoanIssue]);

  useEffect(() => {
    const findLoan = Loanissue?.find((item) => item?._id === loanId?.id);
    setPropertImg(findLoan?.propertyImage);
    setCustomerData(findLoan?.customer);
    if (findLoan) {
      setValue('loanNo', findLoan?.loanNo);
      setValue('customerCode', findLoan?.customer?.customerCode);
      setValue(
        'customerName',
        `${findLoan?.customer?.firstName} ${findLoan?.customer?.middleName} ${findLoan?.customer?.lastName} `
      );
      setValue(
        'customerAddress',
        `${findLoan?.customer?.temporaryAddress?.street} ${findLoan?.customer?.temporaryAddress?.landmark} ${findLoan?.customer.temporaryAddress?.city}`
      );
      setValue('contact', findLoan?.customer?.contact);
      setValue('contactOtp', findLoan?.customer?.otpContact);
      setValue('customer_url', findLoan?.customer?.avatar_url);
      setValue('scheme', findLoan?.scheme);
      if (scheme) {
        setValue('periodTime', findLoan?.scheme?.interestPeriod);
        setValue('renewalTime', findLoan?.scheme?.renewalTime);
        setValue('loanCloseTime', findLoan?.scheme?.minLoanTime);
        setValue(
          'intRate',
          new Date(findLoan.issueDate) < cutoffDate ? (findLoan?.scheme?.interestRate <= 1.5 ? findLoan?.scheme?.interestRate : 1.5
        ) : (findLoan?.scheme?.interestRate <= 1 ? findLoan?.scheme?.interestRate : 1
        )) ;
      }
      setValue('consultingCharge', findLoan?.consultingCharge);
      setValue('issueDate', new Date(findLoan?.issueDate));
      setValue('loanType', findLoan?.loanType);
      setValue('approvalCharge', findLoan?.approvalCharge);
      setValue('jewellerName', findLoan?.jewellerName);
      setValue('totalLoanAmount', findLoan?.loanAmount);
      setValue('partLoanAmount', findLoan?.loanAmount - findLoan?.interestLoanAmount);
      setValue('intLoanAmount', findLoan?.interestLoanAmount);
      if (findLoan.propertyDetails) {
        const totalWt = findLoan.propertyDetails.reduce(
          (prev, next) => prev + (Number(next?.totalWeight) || 0),
          0
        );
        const netWt = findLoan.propertyDetails.reduce(
          (prev, next) => prev + (Number(next?.netWeight) || 0),
          0
        );
        setValue('loanTotalWt', totalWt.toFixed(2));
        setValue('loanNetWt', netWt);
      }
    } else {
      setValue('customerCode', '');
      setValue('customerName', '');
      setValue('customerAddress', '');
      setValue('contact', '');
      setValue('contactOtp', '');
      setValue('customer_url', '');
      if (!currentOtherLoanIssue) {
        setValue('accountNumber', '');
        setValue('accountType', '');
        setValue('accountHolderName', '');
        setValue('IFSC', '');
        setValue('bankName', '');
        setValue('branchName', '');
      }
    }
  }, [loanId, Loanissue, setValue]);

  useEffect(() => {
    const accountDetails = watch('account');
    setValue('accountNumber', accountDetails?.accountNumber);
    setValue('accountType', accountDetails?.accountType);
    setValue('accountHolderName', accountDetails?.accountHolderName);
    setValue('IFSC', accountDetails?.IFSC);
    setValue('bankName', accountDetails?.bankName);
    setValue('branchName', accountDetails?.branchName);
  }, [watch('account')]);

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

  const handleCashAmountChange = (event) => {
    const newCashAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('loanAmount')) || '';
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

  const handleBankAmountChange = (event) => {
    const newBankAmount = parseFloat(event.target.value) || '';
    const currentLoanAmount = parseFloat(watch('loanAmount')) || '';
    if (newBankAmount > currentLoanAmount) {
      setValue('bankAmount', currentLoanAmount);
      enqueueSnackbar('Bank amount cannot be greater than the loan amount.', {
        variant: 'warning',
      });
    } else {
      setValue('bankAmount', newBankAmount);
    }
    if (watch('paymentMode') === 'Both') {
      const calculatedBankAmount = currentLoanAmount - newBankAmount;
      setValue('bankAmount', calculatedBankAmount >= 0 ? calculatedBankAmount : '');
    }
  };

  const handleAmountChange = () => {
    const newCashAmount = watch('loanAmount') || '';
    const currentLoanAmount = parseFloat(watch('loanAmount')) || '';
    if (currentLoanAmount > newCashAmount) {
      setValue('loanAmount', newCashAmount);
      enqueueSnackbar('Loan amount cannot be greater than the net amount.', { variant: 'warning' });
    } else {
      setValue('loanAmount', currentLoanAmount);
    }
  };

  const checkIFSC = async (ifscCode) => {
    if (ifscCode.length === 11) {
      try {
        const response = await axios.get(`https://ifsc.razorpay.com/${ifscCode}`);
        if (response.data) {
          setValue('branchName', response?.data?.BRANCH || '', { shouldValidate: true });
          enqueueSnackbar('IFSC code is valid and branch details fetched.', { variant: 'success' });
        }
      } catch (error) {
        setValue('branchName', '', { shouldValidate: true });
        enqueueSnackbar('Invalid IFSC code. Please check and enter a valid IFSC code.', {
          variant: 'error',
        });
      }
    } else {
      enqueueSnackbar('IFSC code must be exactly 11 characters.', { variant: 'warning' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box>
              <RHFUploadAvatar disabled={true} name="customer_url" maxSize={3145728} />
            </Box>
          </Grid>
          <Grid xs={12} md={8}>
            <Box>
              <Card sx={{ p: 2 }}>
                {!isFieldsEnabled && (
                  <Box sx={{ mb: 1.5 }}>
                    <Alert severity="warning">
                      Please select a loan to proceed with the other loan issuance.
                    </Alert>
                  </Box>
                )}
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <RHFAutocomplete
                    name="loan"
                    label="Select Loan"
                    req={'red'}
                    fullWidth
                    options={Loanissue?.filter((e) => e.status !== 'Closed')?.map((item) => ({
                      id: item._id,
                      loanNo: item.loanNo,
                    }))}
                    getOptionLabel={(option) => option.loanNo}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.loanNo}
                      </li>
                    )}
                  />
                </Box>
              </Card>
            </Box>
          </Grid>
          <Grid xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: '600',
                }}
              >
                Customer Details
              </Typography>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(5, 1fr)',
                }}
              >
                <RHFTextField
                  name="customerCode"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  label={'Customer Code'}
                />
                <RHFTextField
                  name="customerName"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  label={'Customer Name'}
                />
                <RHFTextField
                  name="customerAddress"
                  InputProps={{ readOnly: true }}
                  label={'Customer Address'}
                  InputLabelProps={{ shrink: true }}
                />
                <RHFTextField
                  name="contact"
                  InputProps={{ readOnly: true }}
                  label={'Mobile No.'}
                  InputLabelProps={{ shrink: true }}
                />
                <RHFTextField
                  name="contactOtp"
                  InputProps={{ readOnly: true }}
                  label={'OTP Mobile No.'}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Card>
          </Grid>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Loan Details
              </Typography>
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
                <RHFTextField
                  name="loanNo"
                  label="Loan No."
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RhfDatePicker
                  name="issueDate"
                  control={control}
                  label="Issue Date"
                  req={'red'}
                  disabled
                />
                <RHFTextField
                  name="loanTotalWt"
                  label="Total Wt"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />{' '}
                <RHFTextField
                  name="loanNetWt"
                  label="Net Wt"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />{' '}
                <RHFTextField
                  name="totalLoanAmount"
                  label="Total Loan Amount"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFTextField
                  name="partLoanAmount"
                  label="Part Loan Amount"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFTextField
                  name="intLoanAmount"
                  label="Int. Loan Amount"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFTextField
                  name="intRate"
                  label="Int. Rate"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFTextField
                  name="consultingCharge"
                  label="Consulting Charge"
                  req={'red'}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFTextField name="approvalCharge" label="Approval Charge" disabled req={'red'} />
                {isFieldsEnabled && (
                  <Box pb={0}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 0,
                        pb: 0,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Property Image
                        </Typography>
                      </Box>
                      <Box>
                        <Image
                          key={propertImg}
                          src={propertImg}
                          alt={propertImg}
                          ratio="1/1"
                          onClick={() => lightbox.onOpen(propertImg)}
                          sx={{
                            cursor: 'zoom-in',
                            height: '36px',
                            width: '36px',
                            borderRadius: '20%',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Other Loan Details
              </Typography>
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
                {currentOtherLoanIssue && (
                  <RHFTextField
                    name="otherLoanNumber"
                    label="Other Loan No."
                    req={'red'}
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                )}
                <RHFTextField name="code" label="Code" req={'red'} />
                <RHFAutocomplete
                  disabled={!isFieldsEnabled}
                  name="otherName"
                  label="Other Name"
                  req="red"
                  fullWidth
                  options={
                    configs?.otherNames?.length > 0 ? configs.otherNames.map((item) => item) : []
                  }
                  getOptionLabel={(option) => option || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RHFTextField
                  name="otherNumber"
                  label="Other Number"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFTextField
                  name="amount"
                  label="Amount"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                  onKeyPress={(e) => {
                    if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                      e.preventDefault();
                    }
                  }}
                />
                <RHFAutocomplete
                  disabled={!isFieldsEnabled}
                  name="percentage"
                  label="percentage"
                  req="red"
                  fullWidth
                  options={
                    configs?.percentage?.length > 0 ? configs.percentage.map((item) => item) : []
                  }
                  getOptionLabel={(option) => option || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RhfDatePicker
                  name="date"
                  control={control}
                  label="Date"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFTextField
                  name="grossWt"
                  label="Gross Wt"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                  onKeyPress={(e) => {
                    if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                      e.preventDefault();
                    }
                  }}
                />
                <RHFTextField name="netWt" label="Net Wt" req={'red'} disabled={!isFieldsEnabled} />
                <RHFTextField name="rate" label="Rate" req={'red'} disabled />
                <RHFAutocomplete
                  name="month"
                  label="Month"
                  req={'red'}
                  fullWidth
                  disabled={!isFieldsEnabled}
                  options={configs?.months?.length > 0 ? configs.months.map((item) => item) : []}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RhfDatePicker
                  name="renewalDate"
                  control={control}
                  label="Renewal Date"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFTextField
                  name="otherCharge"
                  label="Other Charge"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFTextField
                  name="ornamentDetail"
                  label="Ornament Detail"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFTextField
                  name="totalOrnament"
                  label="Total Ornament"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                  onKeyPress={(e) => {
                    if (!/[0-9.]/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
                      e.preventDefault();
                    }
                  }}
                />
                <RHFTextField
                  name="remark"
                  label="Remark"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: '600',
                }}
              >
                Payment Details
              </Typography>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
              >
                <Controller
                  name="loanAmount"
                  control={control}
                  render={({ field }) => (
                    <RHFTextField
                      {...field}
                      label="Loan Amount"
                      req={'red'}
                      value={watch('amount')}
                      disabled={!isFieldsEnabled}
                      inputProps={{ min: 0 }}
                      onChange={(e) => {
                        field.onChange(e);
                        handleLoanAmountChange(e);
                        handleAmountChange();
                      }}
                    />
                  )}
                />
                <RHFAutocomplete
                  name="paymentMode"
                  label="Payment Mode"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                  fullWidth
                  options={['Cash', 'Bank', 'Both']}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                  onChange={(event, value) => {
                    setValue('paymentMode', value);
                    handleLoanAmountChange({
                      target: {
                        value: getValues('loanAmount'),
                      },
                    });
                  }}
                />
                {watch('paymentMode') === 'Cash' && (
                  <Controller
                    name="cashAmount"
                    control={control}
                    render={({ field }) => (
                      <RHFTextField
                        {...field}
                        label="Cash Amount"
                        req={'red'}
                        disabled={!isFieldsEnabled}
                        inputProps={{ min: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCashAmountChange(e);
                        }}
                      />
                    )}
                  />
                )}
                {watch('paymentMode') === 'Bank' && (
                  <Controller
                    name="bankAmount"
                    control={control}
                    render={({ field }) => (
                      <RHFTextField
                        {...field}
                        label="Bank Amount"
                        req={'red'}
                        disabled={!isFieldsEnabled}
                        inputProps={{ min: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleBankAmountChange(e);
                        }}
                      />
                    )}
                  />
                )}
                {watch('paymentMode') === 'Both' && (
                  <>
                    <Controller
                      name="cashAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Cash Amount"
                          req={'red'}
                          disabled={!isFieldsEnabled}
                          inputProps={{ min: 0 }}
                          onChange={(e) => {
                            field.onChange(e);
                            handleCashAmountChange(e);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="bankAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          {...field}
                          label="Bank Amount"
                          req={'red'}
                          disabled
                          inputProps={{ min: 0 }}
                          onChange={(e) => {
                            field.onChange(e);
                            handleBankAmountChange(e);
                          }}
                        />
                      )}
                    />
                  </>
                )}
              </Box>
            </Card>
          </Grid>
          {['Bank', 'Both'].includes(watch('paymentMode')) && (
            <>
              <Grid item xs={12} md={12}>
                <Card sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 0.5,
                        fontWeight: '600',
                      }}
                    >
                      Account Details
                    </Typography>
                  </Box>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(7, 1fr)',
                    }}
                  >
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
                      getOptionLabel={(option) => option.bankName || ''}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id || option.bankName}>
                          {`${option.bankName}(${option.accountHolderName})`}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    <RHFTextField
                      name="accountNumber"
                      label="Account No."
                      req={'red'}
                      disabled
                      led
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                    <RHFAutocomplete
                      name="accountType"
                      label="Account Type"
                      req={'red'}
                      disabled
                      led
                      fullWidth
                      options={ACCOUNT_TYPE_OPTIONS?.map((item) => item)}
                      getOptionLabel={(option) => option}
                      renderOption={(props, option) => (
                        <li {...props} key={option}>
                          {option}
                        </li>
                      )}
                    />
                    <RHFTextField
                      name="accountHolderName"
                      label="Account Holder Name"
                      disabled
                      led
                      req={'red'}
                    />
                    <RHFTextField
                      name="IFSC"
                      label="IFSC Code"
                      disabled
                      inputProps={{ maxLength: 11, pattern: '[A-Za-z0-9]*' }}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                      }}
                      onBlur={(e) => checkIFSC(e.target.value)}
                    />
                    <RHFTextField name="bankName" label="Bank Name" req={'red'} disabled />
                    <RHFTextField name="branchName" label="Branch Name" req={'red'} disabled />
                  </Box>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
        <Box
          xs={12}
          md={8}
          sx={{
            display: 'flex',
            justifyContent: 'end',
            mt: 3,
          }}
        >
          <Button
            color="inherit"
            sx={{
              margin: '0px 10px',
              height: '36px',
            }}
            disabled={!isFieldsEnabled}
            variant="outlined"
            onClick={() => reset()}
          >
            Reset
          </Button>
          <LoadingButton
            disabled={!isFieldsEnabled}
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {!currentOtherLoanIssue ? 'Submit' : 'Save'}
          </LoadingButton>
        </Box>
      </FormProvider>
      <Lightbox image={propertImg} open={lightbox.open} close={lightbox.onClose} />
    </>
  );
}
OtherLoanissueNewEditForm.propTypes = { currentOtherLoanIssue: PropTypes.object };
