import * as Yup from 'yup';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
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
import {
  Alert,
  CardActions,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetScheme } from '../../api/scheme';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Iconify from '../../components/iconify';
import { useGetCustomer } from '../../api/customer';
import { ACCOUNT_TYPE_OPTIONS } from '../../_mock';
import { useGetAllProperty } from '../../api/property';
import { useGetCarat } from '../../api/carat';
import { useRouter } from '../../routes/hooks';
import { paths } from '../../routes/paths';
import { useGetBranch } from '../../api/branch';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import { TableHeadCustom, useTable } from '../../components/table';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useGetConfigs } from '../../api/config';

//----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'type', label: 'Type' },
  { id: 'carat', label: 'Carat' },
  {
    id: 'Pcs',
    label: 'Pcs',
  },
  { id: 'totalWt', label: 'Total wt' },
  { id: 'lossWt', label: 'Loss Wt' },
  {
    id: 'grossWt',
    label: 'Gross Wt',
  },
  { id: 'netWt', label: 'Net Wt' },
  { id: 'grossAmt', label: 'Gross Amt' },
  {
    id: 'netAmt',
    label: 'Net Amt',
  },
  { id: 'actions', label: 'Actions' },
];

export default function LoanissueNewEditForm({ currentLoanIssue }) {
  const router = useRouter();
  const table = useTable();
  const [customerId, setCustomerID] = useState();
  const [customerData, setCustomerData] = useState();
  const [schemeId, setSchemeID] = useState();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const { customer } = useGetCustomer();
  const { scheme } = useGetScheme();
  const { property } = useGetAllProperty();
  const { configs, mutate } = useGetConfigs();
  const { carat } = useGetCarat();
  const { enqueueSnackbar } = useSnackbar();
  const [multiSchema, setMultiSchema] = useState([]);
  const [isFieldsEnabled, setIsFieldsEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const uuid = uuidv4();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const [croppedImage, setCroppedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectBankAccount, setSelectBankAccount] = useState(!currentLoanIssue?.customerBankDetail);
  const [addBankAccount, setAddBankAccount] = useState(!!currentLoanIssue?.customerBankDetail);
  const [approvalChargeValue, setApprovalChargeValue] = useState(0);
  const [chargePaymentModeValue, setChargePaymentModeValue] = useState('');
  const [paymentMode, setPaymentMode] = useState('');

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
          };

  const chargePaymentSchema = {
    ...(approvalChargeValue > 0 && {
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

  const NewLoanissueSchema = Yup.object().shape({
    customer: Yup.object().required('Customer is required'),
    scheme: Yup.object().required('Scheme is required'),
    issueDate: Yup.date().required('Issue Date is required'),
    jewellerName: Yup.string().required('Jeweller Name is required'),
    loanAmount: Yup.string().required('Loan Amount is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    approvalCharge: Yup.string().required('Approval Charge To Amount is required'),
    loanType: Yup.mixed().required('Loan Type is required'),
    propertyDetails: Yup.array().of(
      Yup.object().shape({
        type: Yup.string().required('Type is required'),
        carat: Yup.string().required('Carat is required'),
        pcs: Yup.string().required('Pieces are required'),
        grossWeight: Yup.string().required('Gross Weight is required'),
        netWeight: Yup.string().required('Net Weight is required'),
        grossAmount: Yup.string().required('Gross Amount is required'),
        netAmount: Yup.string().required('Net Amount is required'),
      })
    ),
    selectBankAccount: Yup.boolean(),
    addBankAccount: Yup.boolean(),
    ...(selectBankAccount && {
      account: Yup.mixed().required('Account is required'),
    }),
    ...(addBankAccount && {
      accountNumber: Yup.string().required('Account Number is required'),
      accountType: Yup.string().required('Account Type is required'),
      accountHolderName: Yup.string().required('Account Holder Name is required'),
      IFSC: Yup.string().required('IFSC Code is required'),
      bankName: Yup.string().required('Bank Name is required'),
      branchName: Yup.string().required('Branch Name is required'),
    }),
    ...chargePaymentSchema,
    ...paymentSchema,
  });

  const defaultValues = useMemo(() => {
    const baseValues = {
      customer_url: '',
      customerCode: '',
      selectBankAccount: true,
      customerName: null,
      customerAddress: null,
      contact: '',
      contactOtp: '',
      interestRate: '',
      periodTime: '',
      renewalTime: '',
      loanCloseTime: '',
      property_image: currentLoanIssue?.propertyImage || null,
      customer: currentLoanIssue
        ? {
            id: currentLoanIssue?.customer?._id,
            name:
              currentLoanIssue?.customer?.firstName + ' ' + currentLoanIssue?.customer?.lastName,
            branch: currentLoanIssue?.customer?.branch._id,
          }
        : null,
      scheme: currentLoanIssue ? currentLoanIssue?.scheme : null,
      loanNo: currentLoanIssue?.loanNo || '',
      issueDate: currentLoanIssue ? new Date(currentLoanIssue?.issueDate) : new Date(),
      consultingCharge: currentLoanIssue?.consultingCharge || '',
      approvalCharge: currentLoanIssue?.approvalCharge || 0,
      chargePaymentMode: currentLoanIssue?.chargePaymentDetail?.paymentMode || null,
      chargeAccount: currentLoanIssue?.chargePaymentDetail?.account || '',
      chargeCashAmount: currentLoanIssue?.chargePaymentDetail?.cashAmount || '',
      chargeBankAmount: currentLoanIssue?.chargePaymentDetail?.bankAmount || '',
      nextInstallmentDate: currentLoanIssue
        ? new Date(currentLoanIssue?.nextInstallmentDate)
        : null,
      jewellerName: currentLoanIssue?.jewellerName || '',
      loanType: currentLoanIssue?.loanType
        ? configs?.loanTypes?.find((e) => e?.loanType === currentLoanIssue?.loanType)
        : null,
      loanAmount: currentLoanIssue?.loanAmount || '',
      paymentMode: currentLoanIssue?.paymentMode || '',
      cashAmount: currentLoanIssue?.cashAmount || 0,
      bankAmount: currentLoanIssue?.bankAmount || 0,
      accountNumber: currentLoanIssue?.customerBankDetail?.accountNumber || '',
      accountType: currentLoanIssue?.customerBankDetail?.accountType || '',
      accountHolderName: currentLoanIssue?.customerBankDetail?.accountHolderName || '',
      IFSC: currentLoanIssue?.customerBankDetail?.IFSC || '',
      bankName: currentLoanIssue?.customerBankDetail?.bankName || '',
      branchName: currentLoanIssue?.customerBankDetail?.branchName || null,
      account: currentLoanIssue?.customerBankDetail || '',
      propertyDetails: currentLoanIssue?.propertyDetails || [
        {
          type: '',
          carat: '',
          pcs: '',
          totalWeight: '',
          lossWeight: '',
          grossWeight: '',
          netWeight: '',
          grossAmount: '',
          netAmount: '',
          id: uuid,
        },
      ],
    };
    return baseValues;
  }, [currentLoanIssue]);

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'propertyDetails',
  });

  useEffect(() => {
    setPaymentMode(watch('paymentMode'));
  }, [watch('paymentMode')]);

  useEffect(() => {
    const loanAmount = Number(getValues('loanAmount')) || 0;
    const selectedLoanType = getValues('loanType');

    if (!selectedLoanType || !loanAmount) return;

    const fixedAmount = Number(selectedLoanType?.fixApprovalCharge?.amount || 0);
    const variableAmount = Number(selectedLoanType?.variableApprovalCharge?.amount || 0);
    const percentage = Number(selectedLoanType?.variableApprovalCharge?.percentage || 0);

    const calculatedCharge = percentage > 0 ? (loanAmount * percentage) / 100 : fixedAmount;

    const finalCharge = loanAmount > variableAmount ? calculatedCharge : fixedAmount;

    setValue('approvalCharge', finalCharge.toFixed(2));
    setApprovalChargeValue(finalCharge.toFixed(2));
  }, [watch('loanAmount'), watch('loanType')]);

  useEffect(() => {
    const hasBankDetail = !!currentLoanIssue?.customerBankDetail;
    setValue('selectBankAccount', !hasBankDetail);
    setValue('addBankAccount', !hasBankDetail);
  }, [currentLoanIssue, setValue]);

  const handleAdd = () => {
    append({
      type: '',
      carat: '',
      pcs: '',
      totalWeight: '',
      lossWeight: '',
      grossWeight: '',
      netWeight: '',
      grossAmount: '',
      netAmount: '',
      id: uuid,
    });
  };

  const handleReset = (index) => {
    methods.setValue(`propertyDetails[${index}]`, {
      type: '',
      carat: '',
      pcs: '',
      totalWeight: '',
      lossWeight: '',
      grossWeight: '',
      netWeight: '',
      grossAmount: '',
      netAmount: '',
    });
  };

  const videoConstraints = {
    width: 640,
    height: 360,
    facingMode: 'user',
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setValue('property_image', imageSrc);
        setOpen2(false);
        setOpen(true);
      }
    }
  }, [webcamRef, setCapturedImage, setValue, setOpen2, user, currentLoanIssue]);

  const handleRemove = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const mainbranchid = branch?.find((e) => e?._id === customerData?.branch?._id);

    if (!data.property_image) {
      enqueueSnackbar('Please select property image.', {
        variant: 'error',
      });
      return;
    }

    const propertyDetails = watch('propertyDetails');
    const payload = new FormData();

    payload.append('series', mainbranchid?.series);
    payload.append('company', user.company);
    payload.append('customer', data.customer.id);
    payload.append('branch', customerData.branch._id);
    payload.append('scheme', data?.scheme?._id);
    payload.append('loanNo', data.loanNo);
    payload.append('issueDate', data.issueDate);
    payload.append('nextInstallmentDate', data.nextInstallmentDate);
    payload.append('consultingCharge', data.consultingCharge);
    payload.append('approvalCharge', data.approvalCharge);
    payload.append('jewellerName', data.jewellerName);
    payload.append('loanType', data.loanType.loanType);
    payload.append('savant', configs.savant);

    propertyDetails.forEach((field, index) => {
      payload.append(`propertyDetails[${index}][type]`, field.type);
      payload.append(`propertyDetails[${index}][carat]`, field.carat);
      payload.append(`propertyDetails[${index}][pcs]`, field.pcs);
      payload.append(`propertyDetails[${index}][totalWeight]`, field.totalWeight);
      payload.append(`propertyDetails[${index}][lossWeight]`, field.lossWeight);
      payload.append(`propertyDetails[${index}][grossWeight]`, field.grossWeight);
      payload.append(`propertyDetails[${index}][netWeight]`, field.netWeight);
      payload.append(`propertyDetails[${index}][grossAmount]`, field.grossAmount);
      payload.append(`propertyDetails[${index}][netAmount]`, field.netAmount);
      payload.append(`propertyDetails[${index}][id]`, field.id);
    });

    if (croppedImage) {
      const croppedFile = file;
      payload.append('property-image', croppedFile, 'property-image.jpg');
    } else if (capturedImage) {
      const base64Data = capturedImage.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new Uint8Array(binaryData.length);

      for (let i = 0; i < binaryData.length; i++) {
        arrayBuffer[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      payload.append('property-image', blob, 'property-image.jpg');
    } else {
      payload.append('property-image', data.property_image);
    }

    payload.append('loanAmount', parseFloat(data.loanAmount));
    payload.append('interestLoanAmount', parseFloat(data.loanAmount));
    payload.append('paymentMode', data.paymentMode);
    payload.append('cashAmount', data.cashAmount);
    payload.append('bankAmount', parseFloat(data.bankAmount));
    payload.append('issuedBy', user._id);
    if (['Bank', 'Both'].includes(watch('paymentMode'))) {
      const customerBankDetails = {
        accountNumber: data?.accountNumber ?? data?.account?.accountNumber ?? '',
        accountType: data?.accountType ?? data?.account?.accountType ?? '',
        accountHolderName: data?.accountHolderName ?? data?.account?.accountHolderName ?? '',
        IFSC: data?.IFSC ?? data?.account?.IFSC ?? '',
        bankName: data?.bankName ?? data?.account?.bankName ?? '',
        branchName: data?.branchName ?? data?.account?.branchName ?? '',
      };

      Object.entries(customerBankDetails).forEach(([key, value]) => {
        payload.append(`customerBankDetail[${key}]`, value);
      });
    }

    const mode = data.chargePaymentMode;
    payload.append('chargePaymentDetail[paymentMode]', mode);

    if (mode === 'Cash') {
      payload.append('chargePaymentDetail[cashAmount]', data.chargeCashAmount);
    } else if (mode === 'Bank') {
      payload.append('chargePaymentDetail[bankAmount]', data.chargeBankAmount);

      payload.append(
        'chargePaymentDetail[account][accountNumber]',
        data?.chargeAccount?.accountNumber
      );
      payload.append('chargePaymentDetail[account][accountType]', data?.chargeAccount?.accountType);
      payload.append(
        'chargePaymentDetail[account][accountHolderName]',
        data?.chargeAccount?.accountHolderName
      );
      payload.append('chargePaymentDetail[account][bankName]', data?.chargeAccount?.bankName);
      payload.append('chargePaymentDetail[account][IFSC]', data?.chargeAccount?.IFSC);
      payload.append('chargePaymentDetail[account][branchName]', data?.chargeAccount?.branchName);
      payload.append('chargePaymentDetail[account][_id]', data?.chargeAccount?._id);
    } else if (mode === 'Both') {
      payload.append('chargePaymentDetail[cashAmount]', data.chargeCashAmount);
      payload.append('chargePaymentDetail[bankAmount]', data.chargeBankAmount);

      payload.append(
        'chargePaymentDetail[account][accountNumber]',
        data?.chargeAccount?.accountNumber
      );
      payload.append('chargePaymentDetail[account][accountType]', data?.chargeAccount?.accountType);
      payload.append(
        'chargePaymentDetail[account][accountHolderName]',
        data?.chargeAccount?.accountHolderName
      );
      payload.append('chargePaymentDetail[account][bankName]', data?.chargeAccount?.bankName);
      payload.append('chargePaymentDetail[account][IFSC]', data?.chargeAccount?.IFSC);
      payload.append('chargePaymentDetail[account][branchName]', data?.chargeAccount?.branchName);
      payload.append('chargePaymentDetail[account][_id]', data?.chargeAccount?._id);
    }

    try {
      const url = currentLoanIssue
        ? `${import.meta.env.VITE_BASE_URL}/${user?.company}/loans/${currentLoanIssue?._id}`
        : `${import.meta.env.VITE_BASE_URL}/${user?.company}/issue-loan`;

      const response = currentLoanIssue
        ? await axios.put(url, payload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        : await axios.post(url, payload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

      enqueueSnackbar('Loan processed successfully!', {
        variant: 'success',
      });

      router.push(paths.dashboard.loanissue.root);
      setCapturedImage(null);
      reset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(currentLoanIssue ? 'Failed to update loan.' : error.response.data.message, {
        variant: 'error',
      });
    }
  });

  const handleCustomerSelect = (selectedCustomer) => {
    if (selectedCustomer) {
      setIsFieldsEnabled(true);
    } else {
      setIsFieldsEnabled(false);
    }
  };

  useEffect(() => {
    const customer = watch('customer');
    const scheme = watch('scheme');
    if (customer) {
      handleCustomerSelect(customer);
      setCustomerID(customer);
    } else {
      setCustomerID(null);
    }
    if (scheme) {
      setSchemeID(scheme);
    } else {
      setSchemeID(null);
    }
  }, [watch('customer'), watch('scheme'), currentLoanIssue]);

  useEffect(() => {
    const findedCus = customer?.find((item) => item?._id === customerId?.id);
    setCustomerData(findedCus);
    if (findedCus) {
      setValue('customerCode', findedCus?.customerCode);
      setValue('selectBankAccount', true);
      setValue(
        'customerName',
        `${findedCus?.firstName} ${findedCus?.middleName} ${findedCus?.lastName} `
      );
      setValue(
        'customerAddress',
        `${findedCus?.permanentAddress?.street} ${findedCus?.permanentAddress?.landmark} ${findedCus.permanentAddress?.city}`
      );
      setValue('contact', findedCus?.contact);
      setValue('contactOtp', findedCus?.otpContact);
      setValue('customer_url', findedCus?.avatar_url);
      if (!currentLoanIssue) {
        setValue('accountNumber', findedCus?.bankDetails?.accountNumber);
        setValue('accountType', findedCus?.bankDetails?.accountType);
        setValue('accountHolderName', findedCus?.bankDetails?.accountHolderName);
        setValue('IFSC', findedCus?.bankDetails?.IFSC);
        setValue('bankName', findedCus?.bankDetails?.bankName);
        setValue('branchName', findedCus?.bankDetails?.branchName);
      }
    } else {
      setValue('customerCode', '');
      setValue('customerName', '');
      setValue('customerAddress', '');
      setValue('contact', '');
      setValue('contactOtp', '');
      setValue('customer_url', '');
      if (!currentLoanIssue) {
        setValue('accountNumber', '');
        setValue('accountType', '');
        setValue('accountHolderName', '');
        setValue('IFSC', '');
        setValue('bankName', '');
        setValue('branchName', '');
      }
    }
  }, [customerId, customer, setValue]);

  useEffect(() => {
    if (scheme && scheme.length > 0 && schemeId) {
      if (schemeId) {
        setValue('periodTime', schemeId?.interestPeriod);
        setValue('renewalTime', schemeId?.renewalTime);
        setValue('loanCloseTime', schemeId?.minLoanTime);
      } else {
        setValue('periodTime', '');
        setValue('renewalTime', '');
        setValue('loanCloseTime', '');
      }
      if (schemeId && schemeId?.interestRate) {
        const interestRate = parseFloat(schemeId?.interestRate);
        if (interestRate <= 1) {
          methods.setValue('consultingCharge', 0);
          methods.setValue('interestRate', interestRate);
        } else {
          methods.setValue('consultingCharge', (interestRate - '1').toFixed(2));
          methods.setValue('interestRate', '1');
        }
      } else {
        methods.setValue('consultingCharge', '');
      }
    }
  }, [schemeId, scheme, setValue, reset, getValues, watch('scheme')]);

  const calculateTotal = (field) => {
    const propertyDetails = useWatch({
      name: 'propertyDetails',
      control: methods.control,
    });

    if (!propertyDetails || propertyDetails.length === 0) return;
    0;

    return propertyDetails
      .reduce((total, item) => {
        const value = parseFloat(item?.[field]) || 0;
        return total + value;
      }, 0)
      .toFixed(field === 'pcs' ? 0 : 2);
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

  const handleCharge = (event) => {
    const newCashAmount = parseFloat(event.target.value) || 0;
    const currentChargeAmount = parseFloat(watch('approvalCharge')) || 0;
    const paymentMode = watch('chargePaymentMode');

    setValue('chargeCashAmount', newCashAmount);

    if (paymentMode === 'Both') {
      const calculatedBankAmount = currentChargeAmount - newCashAmount;
      setValue('chargeBankAmount', calculatedBankAmount >= 0 ? calculatedBankAmount : '');
    }

    if (paymentMode === 'Bank') {
      setValue('chargeBankAmount', currentChargeAmount);
    }

    if (paymentMode === 'Cash') {
      setValue('chargeBankAmount', '');
    }
  };

  const handleAmountChange = () => {
    const newCashAmount =
      watch('propertyDetails').reduce((prev, next) => prev + (Number(next?.netAmount) || 0), 0) ||
      '';
    const currentLoanAmount = parseFloat(watch('loanAmount')) || '';
    if (currentLoanAmount > newCashAmount) {
      setValue('loanAmount', newCashAmount);
      enqueueSnackbar('Loan amount cannot be greater than the net amount.', { variant: 'warning' });
    } else {
      setValue('loanAmount', currentLoanAmount);
    }
  };

  const saveCustomerBankDetails = async () => {
    const payload = {
      bankDetails: [
        ...customerData.bankDetails,
        {
          branchName: watch('branchName'),
          accountHolderName: watch('accountHolderName'),
          accountNumber: watch('accountNumber'),
          accountType: watch('accountType'),
          IFSC: watch('IFSC'),
          bankName: watch('bankName'),
        },
      ],
    };
    const mainbranchid = branch?.find((e) => e?._id === customerData?.branch?._id);
    let parsedBranch = storedBranch;

    if (storedBranch !== 'all') {
      try {
        parsedBranch = JSON.parse(storedBranch);
      } catch (error) {
        console.error('Error parsing storedBranch:', error);
      }
    }

    const branchQuery =
      parsedBranch && parsedBranch === 'all'
        ? `&branch=${mainbranchid?._id}`
        : `&branch=${parsedBranch}`;

    try {
      const url = `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer/${customerData?._id}?${branchQuery}`;
      const response = await axios.put(url, JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      enqueueSnackbar(response.message, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error, { variant: 'error' });
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

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setFile(file);
        resetCrop();
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetCrop = () => {
    setCrop({ unit: '%', width: 50, aspect: 1 });
    setCompletedCrop(null);
  };

  const rotateImage = (angle) => {
    setRotation((prevRotation) => prevRotation + angle);
  };

  const showCroppedImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = document.getElementById('cropped-image');

      if (!image) {
        console.error('Image element not found!');
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const angleRadians = (rotation * Math.PI) / 180;

      if (!completedCrop || !completedCrop.width || !completedCrop.height) {
        const rotatedCanvasWidth =
          Math.abs(image.naturalWidth * Math.cos(angleRadians)) +
          Math.abs(image.naturalHeight * Math.sin(angleRadians));
        const rotatedCanvasHeight =
          Math.abs(image.naturalWidth * Math.sin(angleRadians)) +
          Math.abs(image.naturalHeight * Math.cos(angleRadians));
        canvas.width = rotatedCanvasWidth;
        canvas.height = rotatedCanvasHeight;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angleRadians);
        ctx.drawImage(
          image,
          -image.naturalWidth / 2,
          -image.naturalHeight / 2,
          image.naturalWidth,
          image.naturalHeight
        );
        ctx.restore();
      } else {
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;
        const rotatedCanvasWidth =
          Math.abs(cropWidth * Math.cos(angleRadians)) +
          Math.abs(cropHeight * Math.sin(angleRadians));
        const rotatedCanvasHeight =
          Math.abs(cropWidth * Math.sin(angleRadians)) +
          Math.abs(cropHeight * Math.cos(angleRadians));
        canvas.width = rotatedCanvasWidth;
        canvas.height = rotatedCanvasHeight;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angleRadians);
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          -cropWidth / 2,
          -cropHeight / 2,
          cropWidth,
          cropHeight
        );
        ctx.restore();
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        const fileName = !completedCrop ? 'rotated-image.jpg' : 'cropped-rotated-image.jpg';
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const fileURL = URL.createObjectURL(file);

        setCroppedImage(fileURL);
        setFile(file);
        setValue('property_image', file);
        setImageSrc(null);
        setOpen(false);
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setOpen(false);
  };

  const validateField = (fieldName, index, value) => {
    const updatedErrors = { ...errors };
    const schemedata = watch('scheme');

    if (!schemedata) {
      enqueueSnackbar('Please select a scheme before adding properties.', { variant: 'warning' });
      return;
    }

    const totalWeight = parseFloat(getValues(`propertyDetails[${index}].totalWeight`)) || 0;
    const lossWeight = parseFloat(getValues(`propertyDetails[${index}].lossWeight`)) || 0;

    const caratValue =
      carat?.find(
        (item) => item?.name == parseFloat(getValues(`propertyDetails[${index}].carat`))
      ) || {};

    const typeValue = property?.find((item) => item?.propertyType === value) || {};
    const grossWeight = totalWeight - lossWeight;
    const netWeight = grossWeight * (caratValue?.caratPercentage / 100 || 1);

    switch (fieldName) {
      case 'totalWeight':
        if (!value) {
          updatedErrors[`propertyDetails[${index}].totalWeight`] = 'Total weight cannot be empty.';
        } else if (!/^-?\d*\.?\d*$/.test(value)) {
          updatedErrors[`propertyDetails[${index}].totalWeight`] = 'Please enter a valid number.';
        } else if (lossWeight > parseFloat(value)) {
          updatedErrors[`propertyDetails[${index}].totalWeight`] =
            'Loss weight cannot exceed total weight.';
        } else {
          delete updatedErrors[`propertyDetails[${index}].totalWeight`];
          setValue(`propertyDetails[${index}].grossWeight`, grossWeight.toFixed(2));
          setValue(`propertyDetails[${index}].netWeight`, netWeight.toFixed(2));
          setValue(
            `propertyDetails[${index}].grossAmount`,
            (grossWeight * schemedata?.ratePerGram).toFixed(2)
          );
          setValue(
            `propertyDetails[${index}].netAmount`,
            (netWeight * schemedata?.ratePerGram).toFixed(2)
          );
        }
        break;
      case 'lossWeight':
        if (!value) {
          updatedErrors[`propertyDetails[${index}].lossWeight`] = 'Loss weight cannot be empty.';
        } else if (!/^-?\d*\.?\d*$/.test(value)) {
          updatedErrors[`propertyDetails[${index}].lossWeight`] = 'Please enter a valid number.';
        } else if (parseFloat(value) > totalWeight) {
          updatedErrors[`propertyDetails[${index}].lossWeight`] =
            'Loss weight cannot exceed total weight.';
        } else {
          delete updatedErrors[`propertyDetails[${index}].lossWeight`];
          setValue(`propertyDetails[${index}].grossWeight`, grossWeight.toFixed(2));
          setValue(`propertyDetails[${index}].netWeight`, netWeight.toFixed(2));
          setValue(
            `propertyDetails[${index}].grossAmount`,
            (grossWeight * schemedata?.ratePerGram).toFixed(2)
          );
          setValue(
            `propertyDetails[${index}].netAmount`,
            (netWeight * schemedata?.ratePerGram).toFixed(2)
          );
        }
        break;
      case 'type':
        if (!value) {
          updatedErrors[`propertyDetails[${index}].type`] = 'Type is required.';
        } else {
          delete updatedErrors[`propertyDetails[${index}].type`];
          if (typeValue) {
            const { quantity, isQtyEdit } = typeValue;
            setValue(`propertyDetails[${index}].pcs`, quantity || 0);
            setValue(`propertyDetails[${index}].isPcsEditable`, isQtyEdit);
            if (!isQtyEdit && (!quantity || quantity <= 0)) {
              updatedErrors[`propertyDetails[${index}].pcs`] =
                'Invalid quantity for selected type.';
            }
          } else {
            updatedErrors[`propertyDetails[${index}].type`] = 'Invalid type selected.';
          }
        }
        break;
      case 'carat':
        if (!value) {
          updatedErrors[`propertyDetails[${index}].carat`] = 'Carat is required.';
        } else {
          delete updatedErrors[`propertyDetails[${index}].carat`];
          setValue(`propertyDetails[${index}].netWeight`, netWeight.toFixed(2));
          setValue(
            `propertyDetails[${index}].grossAmount`,
            (grossWeight * schemedata?.ratePerGram).toFixed(2)
          );
          setValue(
            `propertyDetails[${index}].netAmount`,
            (netWeight * schemedata?.ratePerGram).toFixed(2)
          );
        }
        break;
      case 'pcs':
        if (!value || parseInt(value) <= 0) {
          updatedErrors[`propertyDetails[${index}].pcs`] = 'Pcs must be a positive number.';
        } else {
          delete updatedErrors[`propertyDetails[${index}].pcs`];
          const grossAmount = (grossWeight * schemedata?.ratePerGram).toFixed(2);
          setValue(`propertyDetails[${index}].grossAmount`, grossAmount);
          const netAmount = (netWeight * schemedata?.ratePerGram).toFixed(2);
          setValue(`propertyDetails[${index}].netAmount`, netAmount);
        }
        break;
      default:
        break;
    }
    setErrors(updatedErrors);
  };

  const sx = {
    label: {
      mt: -1.4,
      fontSize: '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: {
      height: 0,
    },
  };

  useEffect(() => {
    const approvalCharge = Number(watch('approvalCharge')) || 0;
    setApprovalChargeValue(approvalCharge);
    if (approvalCharge === 0) {
      setValue('chargePaymentMode', '');
      setValue('chargeCashAmount', '');
      setValue('chargeBankAmount', '');
      setValue('chargeAccount', null);
    }
  }, [watch('approvalCharge')]);

  useEffect(() => {
    setChargePaymentModeValue(watch('chargePaymentMode') || '');
  }, [watch('chargePaymentMode')]);

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
                      Please select a customer to proceed with the loan issuance.
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
                    name="customer"
                    label="Select Customer"
                    req={'red'}
                    fullWidth
                    options={customer
                      ?.filter((e) => e.status === 'Active')
                      ?.map((item) => ({
                        id: item._id,
                        name: item.firstName + ' ' + item.middleName + ' ' + item.lastName,
                      }))}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                  <Box display="flex" justifyContent="end">
                    <Link
                      to={paths.dashboard.customer.new}
                      onClick={handleAdd}
                      style={{
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      + Add Customer
                    </Link>
                  </Box>
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
          <Grid xs={12} md={10}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                Loan Scheme Details
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
                  disabled={currentLoanIssue ? true : false}
                />
                <RHFAutocomplete
                  name="scheme"
                  label="Scheme"
                  req="red"
                  disabled={!isFieldsEnabled}
                  fullWidth
                  options={scheme?.filter((item) => item.isActive)}
                  getOptionLabel={(option) => option?.name || ''}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.name}
                    </li>
                  )}
                  onChange={(e, selectedScheme) => {
                    setValue('scheme', selectedScheme);
                    const schemedata = selectedScheme;
                    if (schemedata?.ratePerGram) {
                      fields.forEach((_, index) => {
                        const totalWeight =
                          parseFloat(getValues(`propertyDetails[${index}].totalWeight`)) || 0;
                        const lossWeight =
                          parseFloat(getValues(`propertyDetails[${index}].lossWeight`)) || 0;
                        const caratValue =
                          carat?.find(
                            (item) =>
                              item?.name ==
                              parseFloat(getValues(`propertyDetails[${index}].carat`))
                          ) || {};
                        const caratPercentage = caratValue?.caratPercentage || 100;
                        const grossWeight = totalWeight - lossWeight;
                        const netWeight = grossWeight * (caratPercentage / 100);
                        const grossAmount = grossWeight * schemedata?.ratePerGram;
                        const netAmount = netWeight * schemedata?.ratePerGram;
                        if (!isNaN(grossWeight))
                          setValue(`propertyDetails[${index}].grossWeight`, grossWeight.toFixed(2));
                        if (!isNaN(netWeight))
                          setValue(`propertyDetails[${index}].netWeight`, netWeight.toFixed(2));
                        if (!isNaN(grossAmount))
                          setValue(`propertyDetails[${index}].grossAmount`, grossAmount.toFixed(2));
                        if (!isNaN(netAmount))
                          setValue(`propertyDetails[${index}].netAmount`, netAmount.toFixed(2));
                      });
                    }
                  }}
                />
                <RHFTextField
                  name="interestRate"
                  label="InstrestRate"
                  InputProps={{ readOnly: true }}
                />
                <Controller
                  name="consultingCharge"
                  control={control}
                  render={({ field }) => (
                    <RHFTextField
                      {...field}
                      disabled={true}
                      label="Consulting Charge"
                      req={'red'}
                    />
                  )}
                />
                <RHFTextField
                  name="approvalCharge"
                  label="Approval Charge"
                  disabled={true}
                  req={'red'}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    onInput: (e) => {
                      e.target.value = e.target.value
                        .replace(/ [^0-9.]/g, '')
                        .replace(/(\..*?)\..*/g, '$1');
                    },
                  }}
                />
                <RHFAutocomplete
                  req={'red'}
                  name="chargePaymentMode"
                  label="Charge Payment Mode"
                  disabled={!isFieldsEnabled}
                  options={['Cash', 'Bank']}
                  getOptionLabel={(option) => option}
                  onChange={(event, value) => {
                    setValue('chargePaymentMode', value);
                    handleCharge({ target: { value: watch('approvalCharge') || 0 } });
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
                        req={'red'}
                        {...field}
                        label="Cash Amount"
                        inputProps={{ min: 0 }}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCharge(e);
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
                          {`${option.bankName} (${option.accountHolderName})`}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option._id === value._id}
                    />
                    <Controller
                      name="chargeBankAmount"
                      control={control}
                      render={({ field }) => (
                        <RHFTextField
                          req={'red'}
                          {...field}
                          label="Bank Amount"
                          disabled={watch('chargePaymentMode') === 'Bank' ? false : true}
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </>
                )}
                <RHFTextField
                  name="periodTime"
                  label="INT. Period Time"
                  InputProps={{ readOnly: true }}
                />
                <RHFTextField
                  name="renewalTime"
                  label="Renewal Time"
                  InputProps={{ readOnly: true }}
                />
                <RHFTextField
                  name="loanCloseTime"
                  label="Minimun Loan Close Time"
                  InputProps={{ readOnly: true }}
                />
                {currentLoanIssue && (
                  <RHFTextField
                    name="loanAmount"
                    label="Loan AMT."
                    req={'red'}
                    disabled={!isFieldsEnabled}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                )}
                {currentLoanIssue && (
                  <RhfDatePicker
                    name="nextInstallmentDate"
                    control={control}
                    label="Next Installment Date"
                    req={'red'}
                    readOnly={true}
                  />
                )}
                <RHFTextField
                  name="jewellerName"
                  label="JewellerName"
                  req={'red'}
                  disabled={!isFieldsEnabled}
                />
                <RHFAutocomplete
                  disabled={!isFieldsEnabled}
                  name="loanType"
                  label="Loan Type"
                  req="red"
                  fullWidth
                  options={configs?.loanTypes || []}
                  getOptionLabel={(option) => option?.loanType || ''}
                  isOptionEqualToValue={(option, value) => option?.loanType === value?.loanType}
                  onChange={(event, value) => {
                    setValue('loanType', value || null);
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      {option.loanType}
                    </li>
                  )}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="subtitle1" component={'span'} sx={{ fontWeight: 600 }}>
                Property Image
              </Typography>
            </Box>
            <Card>
              <CardContent sx={{ height: '156px', p: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: 'inline-block',
                      fontWeight: 600,
                    }}
                  ></Typography>
                </Box>
                <Box mt={0.2}>
                  <RHFUploadAvatar
                    radius={true}
                    name="property_image"
                    camera={true}
                    setOpen2={setOpen2}
                    setOpen={setOpen}
                    setImageSrc={setImageSrc}
                    setFile={setFile}
                    file={
                      croppedImage || capturedImage || imageSrc || currentLoanIssue?.propertyImage
                    }
                    maxSize={3145728}
                    accept="image/*"
                    onDrop={handleDropSingleFile}
                  />
                </Box>
                <Dialog open={Boolean(open)} onClose={handleCancel}>
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={(newCrop) => setCompletedCrop(newCrop)}
                    aspect={1}
                  >
                    <img
                      id="cropped-image"
                      src={imageSrc || capturedImage}
                      alt="Crop preview"
                      onLoad={resetCrop}
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  </ReactCrop>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem',
                    }}
                  >
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton onClick={() => rotateImage(-90)} style={{ marginRight: '10px' }}>
                        <Iconify icon="material-symbols:rotate-90-degrees-cw-rounded" />
                      </IconButton>
                      <IconButton onClick={() => rotateImage(90)}>
                        <Iconify icon="material-symbols:rotate-90-degrees-ccw-rounded" />
                      </IconButton>
                    </Box>
                    <Button variant="contained" color="primary" onClick={showCroppedImage}>
                      Save Image
                    </Button>
                  </Box>
                </Dialog>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: '600',
                  }}
                >
                  Property Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      onSort={table.onSort}
                    />
                    <TableBody>
                      {fields.map((row, index) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:hover': { backgroundColor: 'inherit' },
                            height: '10px',
                          }}
                        >
                          <TableCell
                            sx={{
                              width: '200px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFAutocomplete
                              sx={sx}
                              name={`propertyDetails[${index}].type`}
                              label="Type"
                              disabled={!isFieldsEnabled}
                              options={property
                                ?.filter((e) => e.isActive === true)
                                ?.map((item) => ({
                                  label: item.propertyType,
                                  value: item.propertyType,
                                }))}
                              onChange={(e, value) => {
                                setValue(`propertyDetails[${index}].type`, value?.value || '');
                                validateField('type', index, value?.value);
                              }}
                              helperText={errors[`propertyDetails[${index}].type`] || ''}
                              error={!!errors[`propertyDetails[${index}].type`]}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '40px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFAutocomplete
                              sx={{
                                label: {
                                  mt: -1.4,
                                  fontSize: '14px',
                                },
                                '& .MuiInputLabel-shrink': {
                                  mt: 0,
                                },
                                input: { height: 0 },
                              }}
                              name={`propertyDetails[${index}].carat`}
                              label="Carat"
                              disabled={!isFieldsEnabled}
                              options={carat
                                ?.filter((e) => e.isActive === true)
                                ?.map((e) => e?.name)}
                              onChange={(e, value) => {
                                setValue(`propertyDetails[${index}].carat`, value);
                                validateField('carat', index, value);
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '80px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].pcs`}
                              label="PCS"
                              type="number"
                              disabled={
                                !watch(`propertyDetails[${index}].isPcsEditable`) &&
                                !isFieldsEnabled
                              }
                              helperText={errors[`propertyDetails[${index}].pcs`] || ''}
                              error={!!errors[`propertyDetails[${index}].pcs`]}
                              onChange={(e) => {
                                setValue(`propertyDetails[${index}].pcs`, e.target.value);
                                validateField('pcs', index, e.target.value);
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '100px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].totalWeight`}
                              label="Total Weight"
                              type="number"
                              disabled={!isFieldsEnabled}
                              helperText={errors[`propertyDetails[${index}].totalWeight`] || ''}
                              error={!!errors[`propertyDetails[${index}].totalWeight`]}
                              onChange={(e) => {
                                setValue(`propertyDetails[${index}].totalWeight`, e.target.value);
                                validateField('totalWeight', index, e.target.value);
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '100px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].lossWeight`}
                              label="Loss Weight"
                              disabled={!isFieldsEnabled}
                              type="number"
                              helperText={errors[`propertyDetails[${index}].lossWeight`] || ''}
                              error={!!errors[`propertyDetails[${index}].lossWeight`]}
                              onChange={(e) => {
                                const value = e.target.value;
                                setValue(`propertyDetails[${index}].lossWeight`, value);
                                validateField('lossWeight', index, value);
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '120px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].grossWeight`}
                              label="GW"
                              disabled={true}
                              value={getValues(`propertyDetails[${index}].grossWeight`) || ''}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '120px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].netWeight`}
                              label="NW"
                              disabled={true}
                              value={getValues(`propertyDetails[${index}].netWeight`) || ''}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '120px',
                              padding: '06px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].grossAmount`}
                              label="GA"
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '120px',
                              padding: '0px 8px',
                            }}
                          >
                            <RHFTextField
                              sx={sx}
                              name={`propertyDetails[${index}].netAmount`}
                              label="NA"
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              width: '100px',
                              padding: '0px 8px',
                            }}
                          >
                            <IconButton
                              onClick={() => handleReset(index)}
                              disabled={!isFieldsEnabled}
                            >
                              <Iconify icon="ic:baseline-refresh" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleRemove(index)}
                              disabled={!isFieldsEnabled || fields.length === 1}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.mode === 'light' ? '#e0f7fa' : '#2f3944',
                        }}
                      >
                        <TableCell
                          colSpan={2}
                          sx={{
                            padding: '8px',
                          }}
                        >
                          <strong>Total:</strong>
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>{calculateTotal('pcs')}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>
                          {calculateTotal('totalWeight')}
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>
                          {calculateTotal('lossWeight')}
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>
                          {calculateTotal('grossWeight')}
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>{calculateTotal('netWeight')}</TableCell>
                        <TableCell sx={{ padding: '8px' }}>
                          {calculateTotal('grossAmount')}
                        </TableCell>
                        <TableCell sx={{ padding: '8px' }}>{calculateTotal('netAmount')}</TableCell>
                        <TableCell sx={{ padding: '8px' }}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
              <CardActions
                sx={{
                  margin: '0px 16px 10px 16px',
                  justifyContent: 'flex-end',
                  p: 0,
                }}
              >
                <Button
                  size="small"
                  disabled={!isFieldsEnabled}
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleAdd}
                >
                  Add Property
                </Button>
              </CardActions>
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
                      disabled={!isFieldsEnabled}
                      type="number"
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
                    if (value === 'Cash') {
                      setAddBankAccount(false);
                      setSelectBankAccount(false);
                    } else {
                      setSelectBankAccount(true);
                    }
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
                        type="number"
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
                        type="number"
                        inputProps={{ min: 0 }}
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
                          type="number"
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
                          type="number"
                          inputProps={{ min: 0 }}
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
                  <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: '600' }}>
                    Account Details
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pb: 1.5,
                    }}
                  >
                    {!Object?.values(currentLoanIssue?.customerBankDetail || {})?.some(Boolean) && (
                      <Box>
                        {customerData?.bankDetails?.length > 0 && (
                          <Button
                            variant="contained"
                            disabled={!isFieldsEnabled}
                            onClick={() => {
                              setSelectBankAccount(true);
                              setAddBankAccount(false);
                              setValue('selectBankAccount', true);
                              setValue('addBankAccount', false);
                            }}
                            sx={{ fontWeight: 'bold', textDecoration: 'none', mx: 1 }}
                          >
                            Select Account
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          disabled={!isFieldsEnabled}
                          onClick={() => {
                            setAddBankAccount(true);
                            setSelectBankAccount(false);
                            setValue('selectBankAccount', false);
                            setValue('addBankAccount', true);
                          }}
                          sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                        >
                          Add Beneficiary
                        </Button>
                      </Box>
                    )}
                    {!currentLoanIssue && addBankAccount && (
                      <Box>
                        <Button
                          variant={'outlined'}
                          disabled={!isFieldsEnabled}
                          onClick={() => saveCustomerBankDetails()}
                          style={{
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          Add beneficiary
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(6, 1fr)',
                    }}
                  >
                    {selectBankAccount && (
                      <RHFAutocomplete
                        name="account"
                        label="Account"
                        req="red"
                        fullWidth
                        options={customerData?.bankDetails || []}
                        getOptionLabel={(option) => option.bankName || ''}
                        renderOption={(props, option) => (
                          <li {...props} key={option._id || option.bankName}>
                            {option.bankName}
                          </li>
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                    )}
                    {addBankAccount && (
                      <>
                        <RHFTextField
                          name="accountNumber"
                          label="Account No."
                          req={'red'}
                          disabled={!isFieldsEnabled}
                          type="number"
                          inputProps={{ min: 0 }}
                        />
                        <RHFAutocomplete
                          name="accountType"
                          label="Account Type"
                          req={'red'}
                          disabled={!isFieldsEnabled}
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
                          disabled={!isFieldsEnabled}
                          req={'red'}
                        />
                        <RHFTextField
                          name="IFSC"
                          label="IFSC Code"
                          inputProps={{ maxLength: 11, pattern: '[A-Za-z0-9]*' }}
                          onInput={(e) => {
                            e.target.value = e.target.value
                              .replace(/[^A-Za-z0-9]/g, '')
                              .toUpperCase();
                          }}
                          onBlur={(e) => checkIFSC(e.target.value)}
                        />
                        <RHFTextField
                          name="bankName"
                          label="Bank Name"
                          req={'red'}
                          disabled={!isFieldsEnabled}
                        />
                        <RHFTextField
                          name="branchName"
                          label="Branch Name"
                          req={'red'}
                          disabled={!isFieldsEnabled}
                        />
                      </>
                    )}
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
            {!currentLoanIssue ? 'Submit' : 'Save'}
          </LoadingButton>
        </Box>
      </FormProvider>
      <Dialog
        fullWidth
        maxWidth={false}
        open={open2}
        onClose={() => setOpen2(false)}
        PaperProps={{
          sx: { maxWidth: 720 },
        }}
      >
        <DialogTitle>Camera</DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={'90%'}
            height={'100%'}
            videoConstraints={videoConstraints}
          />
        </Box>
        <DialogActions>
          <Button variant="outlined" onClick={capture}>
            Capture Photo
          </Button>
          <Button variant="contained" onClick={() => setOpen2(false)}>
            Close Camera
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

LoanissueNewEditForm.propTypes = { currentLoanIssue: PropTypes.object };
