import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useFieldArray, useForm } from 'react-hook-form';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import countrystatecity from '../../_mock/map/csc.json';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFAutocomplete,
  RHFCode,
  RHFRadioGroup,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import {
  Button,
  CardActions,
  Dialog,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useAuthContext } from '../../auth/hooks';
import { useGetBranch } from '../../api/branch';
import { useGetConfigs } from '../../api/config';
import { ACCOUNT_TYPE_OPTIONS } from '../../_mock';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import DialogTitle from '@mui/material/DialogTitle';
import Webcam from 'react-webcam';
import DialogActions from '@mui/material/DialogActions';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import Iconify from '../../components/iconify';
import Lightbox, { useLightBox } from '../../components/lightbox/index.js';
import CardContent from '@mui/material/CardContent';
import { TableHeadCustom, useTable } from '../../components/table/index.js';

//---------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  {
    value: 'In Active',
    label: 'In Active',
  },
  { value: 'Blocked', label: 'Blocked' },
];

const INQUIRY_REFERENCE_BY = [
  { value: 'Google', label: 'Google' },
  {
    value: 'Just Dial',
    label: 'Just Dial',
  },
  { value: 'Social Media', label: 'Social Media' },
  {
    value: 'Board Banner',
    label: 'Board Banner',
  },
  { value: 'Brochure', label: 'Brochure' },
  { value: 'Other', label: 'Other' },
];

const TABLE_HEAD = [
  { id: 'AccountHolder', label: 'Account holder' },
  { id: 'Accountnumber', label: 'Account number' },
  { id: 'accountType', label: 'Acoountv type' },
  {
    id: 'IFSCcode',
    label: 'IFSC code',
  },
  { id: 'bankName', label: 'Bank name' },
  { id: 'branchName', label: 'Branch name' },

  { id: 'actions', label: 'Actions' },
];

export default function CustomerNewEditForm({ currentCustomer, mutate2 }) {
  const [otpPopupOpen, setOtpPopupOpen] = useState(false);
  const [isAadhar, setIsAadhar] = useState(false);
  const [aadharImage, setAadharImage] = useState('');
  const lightbox = useLightBox(aadharImage || '');
  const router = useRouter();
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const [open, setOpen] = useState(false);
  const { configs, mutate } = useGetConfigs();
  const webcamRef = useRef(null);
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [open2, setOpen2] = useState(false);
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const [croppedImage, setCroppedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50 });
  const [rotation, setRotation] = useState(0);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [referenceBy, setReferenceBy] = useState('');
  const condition = INQUIRY_REFERENCE_BY.find((item) => item?.label == currentCustomer?.referenceBy)
    ? currentCustomer.referenceBy
    : 'Other';
  const [disabledField, setDisabledField] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [referanceByOther, setReferaceByOther] = useState('');
  const table = useTable();
  const [editRowIndex, setEditRowIndex] = useState(null);

  const handleEdit = (index) => {
    setEditRowIndex(index);
  };

  const handleSave = () => {
    setEditRowIndex(null);
  };

  const handleClosePopup = () => {
    if (user?.role.toLowerCase() === 'employee') {
      enqueueSnackbar('Cannot proceed without Aadhaar card verification.', { variant: 'error' });
    }
    setOpenPopup(false);
  };

  const handleClose = () => {
    setOpenPopup(false);
  };

  useEffect(() => {
    if (!currentCustomer) {
      setOpenPopup(true);
    }
  }, []);

  const NewCustomerSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    middleName: Yup.string().required('Middle Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    contact: Yup.string().required('Contact number is required').max(10),
    dob: Yup.date()
      .required('Date of Birth is required')
      .nullable()
      .typeError('Date of Birth is required'),
    businessType: Yup.string().required('Business Type is required'),
    panCard: Yup.string().required('PAN Card number is required').max(10).min(10),
    aadharCard: Yup.string()
      .required('Aadhar Card number is required')
      .matches(
        /^\d{12}$/,
        'Aadhar Card must be exactly 12 digitsand should not contain alphabetic characters'
      ),
    nomineeName: Yup.string().required('Nominee Name is required'),
    nomineeRelation: Yup.string().when([], {
      is: () => config?.nomineeRelation, // check your config
      then: (schema) => schema.required('Nominee relation is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    nomineeDOB: Yup.mixed().optional().nullable(),
    otpContact: Yup.string().required('OTP Contact number isrequired').max(10).min(10),
    PerStreet: Yup.string().required('Address Line 1 isrequired'),
    PerLandmark: Yup.string().required('Landmark 1 is required'),
    PerArea: Yup.string().required('Area is required'),
    PerState: Yup.string().required('State is required'),
    PerCity: Yup.string().required('City is required'),
    PerZipcode: Yup.string().required('Pincode is required'),
    tempStreet: Yup.string().required('Street is required'),
    tempLandmark: Yup.string().required('Landmark is required'),
    tempArea: Yup.string().required('Area is required'),
    tempState: Yup.string().required('State is required'),
    tempCity: Yup.string().required('City is required'),
    tempZipcode: Yup.string().required('Pincode is required'),
    profile_pic: Yup.mixed().required('A profile picture is required'),
    referenceBy: Yup.string().required('Other detail is required'),
    branchId: Yup.object().when([], {
      is: () => user?.role === 'Admin' && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      isAadharVerified: currentCustomer?.isAadharVerified || false,
      branchId: currentCustomer
        ? {
            label: currentCustomer?.branch?.name,
            value: currentCustomer?.branch?._id,
          }
        : null,
      status: currentCustomer?.status || 'Active',
      profile_pic: currentCustomer?.avatar_url || null,
      firstName: currentCustomer?.firstName || '',
      middleName: currentCustomer?.middleName || '',
      lastName: currentCustomer?.lastName || '',
      contact: currentCustomer?.contact || '',
      email: currentCustomer?.email || '',
      dob: new Date(currentCustomer?.dob) || '',
      panCard: (currentCustomer?.panCard || '').toUpperCase(),
      aadharCard: currentCustomer?.aadharCard || '',
      otpContact: currentCustomer?.otpContact || '',
      business: currentCustomer?.business || '',
      customerCode: currentCustomer?.customerCode || '',
      drivingLicense: currentCustomer?.drivingLicense || '',
      referenceBy: currentCustomer ? condition : '',
      otherReferenceBy: currentCustomer ? currentCustomer?.referenceBy : '',
      joiningDate: currentCustomer ? new Date(currentCustomer?.joiningDate) : new Date(),
      businessType: currentCustomer?.businessType || '',
      PerStreet: currentCustomer?.permanentAddress?.street || '',
      PerLandmark: currentCustomer?.permanentAddress?.landmark || '',
      PerCountry: currentCustomer?.permanentAddress?.country || '',
      PerArea: currentCustomer?.permanentAddress?.area || '',
      PerState: currentCustomer?.permanentAddress?.state || '',
      PerCity: currentCustomer?.permanentAddress?.city || '',
      PerZipcode: currentCustomer?.permanentAddress?.zipcode || '',
      tempStreet: currentCustomer?.temporaryAddress?.street || '',
      tempLandmark: currentCustomer?.temporaryAddress?.landmark || '',
      tempCountry: currentCustomer?.temporaryAddress?.country || '',
      tempArea: currentCustomer?.temporaryAddress?.area || '',
      tempState: currentCustomer?.temporaryAddress?.state || '',
      tempCity: currentCustomer?.temporaryAddress?.city || '',
      tempZipcode: currentCustomer?.temporaryAddress?.zipcode || '',
      bankDetails: currentCustomer?.bankDetails || [
        {
          accountHolderName: '',
          accountNumber: '',
          accountType: '',
          IFSC: '',
          bankName: '',
          branchName: '',
        },
      ],
      nomineeName: currentCustomer?.nominee?.name || '',
      nomineeDOB: (currentCustomer?.nominee?.dob) ? new Date(currentCustomer?.nominee?.dob) : "",
      nomineeRelation: currentCustomer?.nominee?.relation || '',
    }),
    [currentCustomer, branch]
  );

  const methods = useForm({
    resolver: yupResolver(NewCustomerSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankDetails',
  });

  const handleAdd = () => {
    append({
      accountHolderName: '',
      accountNumber: '',
      accountType: '',
      IFSC: '',
      bankName: '',
      branchName: '',
      isNew: true,
    });
  };

  const handleReset = (index) => {
    methods.setValue(`bankDetails[${index}]`, {
      accountHolderName: '',
      accountNumber: '',
      accountType: '',
      IFSC: '',
      bankName: '',
      branchName: '',
    });
  };

  const handleRemove = (index) => {
    if (fields?.length > 1) {
      remove(index);
    }
  };

  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    const referance = watch('referenceBy');
    if (referance) {
      setReferaceByOther(referance);
    }
  }, [watch('referenceBy')]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
    }
  }, [imageSrc]);

  useEffect(() => {
    if (currentCustomer) {
      reset(defaultValues);
    }
  }, [currentCustomer, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data?.referenceBy === 'Other' && data.otherReferenceBy === '') {
        enqueueSnackbar('ReferanceBy is required', { variant: 'error' });
        return;
      }
      const cleanedBankDetails = Array.isArray(data.bankDetails)
        ? data.bankDetails.filter((obj) => Object.values(obj).some((value) => value !== ''))
        : [];

      const payload = {
        status: data.status,
        isAadharVerified: data.isAadharVerified,
        firstName: data.firstName.toUpperCase(),
        middleName: data.middleName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        contact: data.contact,
        email: data.email,
        dob: data.dob,
        joiningDate: data.joiningDate,
        drivingLicense: data.drivingLicense,
        panCard: data.panCard,
        aadharCard: data.aadharCard,
        otpContact: data.otpContact,
        businessType: data.businessType,
        business: data.business,
        referenceBy: watch('referenceBy') !== 'Other' ? data?.referenceBy : data?.otherReferenceBy,
        permanentAddress: {
          street: data.PerStreet.toUpperCase(),
          landmark: data.PerLandmark.toUpperCase(),
          area: data.PerArea,
          state: data.PerState,
          city: data.PerCity,
          zipcode: data.PerZipcode,
        },
        temporaryAddress: {
          street: data.tempStreet.toUpperCase(),
          landmark: data.tempLandmark.toUpperCase(),
          area: data.tempArea,
          state: data.tempState,
          city: data.tempCity,
          zipcode: data.tempZipcode,
        },
        bankDetails: cleanedBankDetails,
        nominee: {
          name: data.nomineeName,
          relation: data.nomineeRelation,
          dob: data.nomineeDOB
        }
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (
          typeof value === 'object' &&
          key !== 'bankDetails' &&
          key !== 'joiningDate' &&
          key !== 'dob'
        ) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${subKey}]`, subValue);
          });
        } else if (key === 'bankDetails' && Array.isArray(value)) {
          value.forEach((bank, index) => {
            Object.entries(bank).forEach(([field, fieldValue]) => {
              formData.append(`bankDetails[${index}][${field}]`, fieldValue);
            });
          });
        } else {
          formData.append(key, value);
        }
      });

      if (croppedImage) {
        const croppedFile = file;
        formData.append('profile-pic', croppedFile, 'customer-image.jpg');
      } else if (capturedImage) {
        const base64Data = capturedImage.split(',')[1];
        const binaryData = atob(base64Data);
        const arrayBuffer = new Uint8Array(binaryData?.length);

        for (let i = 0; i < binaryData?.length; i++) {
          arrayBuffer[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        formData.append('profile-pic', blob, 'customer-image.jpg');
      } else {
        formData.append('profile-pic', data.profile_pic);
      }

      const mainbranchid = branch?.find((e) => e?._id === data?.branchId?.value) || branch?.[0];
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
          ? `branch=${mainbranchid?._id}`
          : `branch=${parsedBranch}`;
      const url = `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer?${branchQuery}`;
      await (currentCustomer
        ? axios.put(
            `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer/${currentCustomer?._id}?${branchQuery}`,
            payload
          )
        : axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));

      enqueueSnackbar(currentCustomer ? 'Update success!' : 'Create success!');
      reset();
      mutate();
      router.push(paths.dashboard.customer.root);
    } catch (error) {
      enqueueSnackbar(
        currentCustomer ? 'Failed To update customer' : error.response?.data?.message,
        {
          variant: 'error',
        }
      );
      console.error(error);
    }
  });

  const videoConstraints = {
    width: 640,
    height: 360,
    facingMode: 'user',
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

  const handleCancel = () => {
    setImageSrc(null);
    setCapturedImage(null);
    setOpen(false);
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
      const cropX = completedCrop?.x * scaleX || 0;
      const cropY = completedCrop?.y * scaleY || 0;
      const cropWidth = completedCrop?.width * scaleX || image.naturalWidth;
      const cropHeight = completedCrop?.height * scaleY || image.naturalHeight;
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

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }

        const fileName = completedCrop ? 'cropped-rotated-image.jpg' : 'rotated-image.jpg';
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const fileURL = URL.createObjectURL(file);

        setCroppedImage(fileURL);
        setFile(file);
        setValue('profile_pic', file);

        if (currentCustomer) {
          const formData = new FormData();
          formData.append('profile-pic', file);

          try {
            const response = await axios.put(
              `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer/${currentCustomer?._id}/profile`,
              formData
            );
            console.log('Profile updated successfully:', response.data);
          } catch (err) {
            console.error('Error uploading rotated image:', err);
          }
        }
        setImageSrc(null);
        setOpen(false);
      }, 'image/jpeg');
    } catch (e) {
      console.error('Error cropping and uploading image:', e);
    }
  };

  const checkZipcode = async (zipcode, type = 'permanent') => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${zipcode}`);
      const data = response.data[0];
      if (data.Status === 'Success') {
        if (type === 'permanent') {
          setValue('PerCountry', data.PostOffice[0]?.Country, { shouldValidate: true });
          setValue('PerState', data.PostOffice[0]?.Circle, { shouldValidate: true });
          setValue('PerCity', data.PostOffice[0]?.District, { shouldValidate: true });
        }
        if (type === 'temporary') {
          setValue('tempCountry', data.PostOffice[0]?.Country, { shouldValidate: true });
          setValue('tempState', data.PostOffice[0]?.Circle, { shouldValidate: true });
          setValue('tempCity', data.PostOffice[0]?.District, { shouldValidate: true });
        }
      } else {
        if (type === 'temporary') {
          setValue('tempCountry', '', { shouldValidate: true });
          setValue('tempState', '', { shouldValidate: true });
          setValue('tempCity', '', { shouldValidate: true });
        }
        enqueueSnackbar('Invalid Zipcode. Please enter a valid Indian Zipcode.', {
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching country and state:', error);
      if (type === 'temporary') {
        setValue('tempCountry', '', { shouldValidate: true });
        setValue('tempState', '', { shouldValidate: true });
      }
      enqueueSnackbar('Failed to fetch country and state details.', { variant: 'error' });
    }
  };

  const checkIFSC = async (ifscCode, index) => {
    if (ifscCode?.length === 11) {
      try {
        const response = await axios.get(`https://ifsc.razorpay.com/${ifscCode}`);
        if (response.data) {
          console.log(response);
          setValue(`bankDetails[${index}].branchName`, response?.data?.BRANCH || '', {
            shouldValidate: true,
          });
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

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setValue('profile_pic', imageSrc);
        setOpen2(false);
        setOpen(true);
      }
    }
  }, [webcamRef, setCapturedImage, setValue, setOpen2, user, currentCustomer]);

  const handleSubmitAction = async () => {
    const userRole = user?.role;
    const aadharNumber = watch('aadharCard');
    const isValidAadhar = /^\d{12}$/.test(aadharNumber);

    if (!isValidAadhar) {
      enqueueSnackbar('Invalid Aadhar number. Please enter a 12-digit number.', {
        variant: 'error',
      });
      return;
    }

    if (!isAadhar) {
      try {
        setOtpPopupOpen(true);
        const response = await axios.post(`${import.meta.env.VITE_HOST_API}/api/verification/send-otp`, {
          aadhaar: aadharNumber,
        });

        if (response.status === 200) {
          enqueueSnackbar('OTP sent successfully for Aadhar verification.', { variant: 'success' });
          setOtpPopupOpen(true);
          setIsAadhar(true);
          sessionStorage.setItem('aadharVerificationResponse', JSON.stringify(response.data.data));
        }
      } catch (error) {
        enqueueSnackbar('Failed to send OTP for Aadhar verification. Please try again.', {
          variant: 'error',
        });

        if (userRole.toLowerCase() === 'employee') {
          enqueueSnackbar('Cannot proceed without Aadhaar card verification.', {
            variant: 'error',
          });
          return;
        }
        console.error('Error in Aadhar verification:', error);
      }
    } else {
      try {
        const otpCode = watch('code');

        if (otpCode?.length !== 6) {
          enqueueSnackbar('Invalid OTP. Please enter a 6-digit code.', { variant: 'warning' });
        }

        const reference = sessionStorage.getItem('aadharVerificationResponse');
        const otpPayload = { otp: otpCode, refId: JSON.parse(reference) };
        const otpResponse = await axios.post(
          `${import.meta.env.VITE_HOST_API}/api/verification/aadhaar-details`,
          otpPayload
        );

        if (otpResponse.status === 200) {
          enqueueSnackbar('Aadhar verification successful.', { variant: 'success' });
          setOtpPopupOpen(false);
          setValue('isAadharVerified', true, { shouldValidate: true });
          const apidata = otpResponse.data.data;
          const fullName = apidata.name;
          const nameParts = fullName.split(' ');

          setAadharImage('data:image/jpeg;base64,' + apidata?.photo_link);
          setValue('firstName', nameParts[1], { shouldValidate: true });
          setValue('middleName', nameParts[2] || '', { shouldValidate: true });
          setValue('lastName', nameParts[0] || '', { shouldValidate: true });
          setValue('dob', apidata?.dob ? new Date(apidata?.dob) : null, { shouldValidate: true });
          setValue('PerStreet', apidata.split_address.house + ' ' + apidata.split_address.street, {
            shouldValidate: true,
          });
          setValue('PerLandmark', apidata.split_address.landmark, { shouldValidate: true });
          setValue('PerZipcode', apidata.split_address.pincode, { shouldValidate: true });
          setValue('PerCountry', apidata.split_address.country, { shouldValidate: true });
          setValue('PerState', apidata.split_address.state, { shouldValidate: true });
          setValue('PerCity', apidata.split_address.dist, { shouldValidate: true });
        }
      } catch (error) {
        enqueueSnackbar('Error in OTP verification. Please try again.', { variant: 'error' });
        if (userRole.toLowerCase() === 'employee') {
          setDisabledField(true);
          enqueueSnackbar('Cannot proceed without Aadhaar card verification.', {
            variant: 'error',
          });
        }
        console.error('Error in OTP verification:', error);
      }
    }
  };

  const PersonalDetails = (
    <>
      <Grid item md={3} xs={12}>
        <Box sx={{ pt: 2 }}>
          <RHFUploadAvatar
            name="profile_pic"
            camera={true}
            setOpen2={setOpen2}
            setOpen={setOpen}
            setImageSrc={setImageSrc}
            setFile={setFile}
            file={croppedImage || imageSrc || capturedImage || currentCustomer?.avatar_url}
            maxSize={3145728}
            accept="image/*"
            onDrop={handleDropSingleFile}
          />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
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
            </div>
          </Dialog>
        </Box>
      </Grid>
      <Grid item xs={12} md={9}>
        <Card>
          {!mdUp && <CardHeader title="Personal Details" />}
          <Stack spacing={3} sx={{ p: 2 }}>
            <Box
              columnGap={1.5}
              rowGap={1.5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(5, 1fr)',
              }}
            >
              {user?.role === 'Admin' && branch && storedBranch === 'all' && (
                <RHFAutocomplete
                  name="branchId"
                  req={'red'}
                  label="Branch"
                  placeholder="Choose a Branch"
                  options={
                    (branch.length &&
                      branch?.map((branchItem) => ({
                        label: branchItem?.name,
                        value: branchItem?._id,
                      }))) ||
                    []
                  }
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              )}
              <RHFTextField
                name="customerCode"
                label="Customer Code"
                InputProps={{
                  disabled: true,
                }}
              />
              <RhfDatePicker
                name="joiningDate"
                control={control}
                label="Joining Date"
                disabled={disabledField}
                req={'red'}
              />
              <RHFTextField
                name="firstName"
                label="First Name"
                disabled={disabledField}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  methods.setValue('firstName', value, { shouldValidate: true });
                }}
                req={'red'}
              />
              <RHFTextField
                disabled={disabledField}
                name="middleName"
                label="Middle Name"
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  methods.setValue('middleName', value, { shouldValidate: true });
                }}
                req={'red'}
              />
              <RHFTextField
                disabled={disabledField}
                name="lastName"
                label="Last Name"
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  methods.setValue('lastName', value, { shouldValidate: true });
                }}
                req={'red'}
              />
              <RHFTextField
                disabled={disabledField}
                name="contact"
                label="Whatsapp No"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                rules={{
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit contact number',
                  },
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                req={'red'}
              />
              <RHFTextField
                disabled={disabledField}
                name="otpContact"
                label="Contact"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
                rules={{
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit OTP',
                  },
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                req={'red'}
              />
              <RHFTextField
                disabled={disabledField}
                name="drivingLicense"
                label="Driving License"
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
                inputProps={{ maxLength: 16 }}
              />
              <RHFTextField
                disabled={disabledField}
                name="panCard"
                label="PAN No."
                req={'red'}
                inputProps={{ minLength: 10, maxLength: 10 }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  methods.setValue('panCard', value, { shouldValidate: true });
                }}
              />
              <RHFTextField
                disabled={disabledField}
                name="aadharCard"
                label="Aadhar Card"
                req="red"
                inputProps={{ maxLength: 12, pattern: '[0-9]*' }}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => handleSubmitAction()}
                      sx={{ padding: 0 }}
                      disabled={isAadhar || watch('isAadharVerified')}
                    >
                      <Iconify
                        icon={
                          watch('isAadharVerified') ? 'ic:round-check-circle' : 'ic:round-verified'
                        }
                        width={20}
                        height={20}
                        sx={{
                          color: watch('isAadharVerified') ? 'green' : 'default',
                        }}
                      />
                    </IconButton>
                  ),
                }}
              />
              <RhfDatePicker
                disabled={disabledField}
                name="dob"
                control={control}
                label="Date of Birth"
                req={'red'}
              />
              <RHFTextField
                name="nomineeName"
                label="Nominee Name"
                disabled={disabledField}
                inputProps={{ style: { textTransform: 'uppercase' } }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  methods.setValue('nomineeName', value, { shouldValidate: true });
                }}
                req={'red'}
              />
              {configs?.nomineeRelation && (
                <RHFAutocomplete
                  req={'red'}
                  name="nomineeRelation"
                  disabled={disabledField}
                  label="Nominee Relation"
                  placeholder="Choose Nominee Relation"
                  options={
                    configs?.nomineeRelation?.length > 0
                      ? configs.nomineeRelation.map((type) => type)
                      : []
                  }
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              )}
              <RhfDatePicker
                disabled={disabledField}
                name="nomineeDOB"
                control={control}
                label="Nominee Date of Birth"
              />
              <RHFTextField disabled={disabledField} name="email" label="Email" />
              {configs?.businessType && (
                <RHFAutocomplete
                  req={'red'}
                  name="businessType"
                  disabled={disabledField}
                  label="Business Type"
                  placeholder="Choose Business Type"
                  options={
                    configs?.businessType?.length > 0
                      ? configs.businessType.map((type) => type)
                      : []
                  }
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              )}
              {currentCustomer && (
                <RHFAutocomplete
                  name="status"
                  disabled={disabledField}
                  req={'red'}
                  label="Status"
                  placeholder="Choose a Status"
                  options={STATUS_OPTIONS.map((item) => item.value)}
                  isOptionEqualToValue={(option, value) => option?.value === value?.value}
                />
              )}
              {aadharImage && (
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Aadhaar Image
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: '40px',
                        width: '40px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        key={aadharImage}
                        src={aadharImage}
                        alt={aadharImage}
                        ratio="1/1"
                        onClick={() => lightbox.onOpen(aadharImage || '')}
                        sx={{ cursor: 'zoom-in', height: '100%', width: '100%' }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const addressDetails = (
    <>
      <Grid xs={12} md={12} pb={0.5}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}
          <Stack spacing={1} sx={{ p: 2, pb: 0, pt: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
              Permanent Address
            </Typography>
            <Box
              columnGap={1.5}
              rowGap={1.5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(6, 1fr)',
              }}
            >
              <RHFTextField
                disabled={disabledField}
                name="PerStreet"
                label="Street"
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                disabled={disabledField}
                name="PerLandmark"
                label="landmark"
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                disabled={disabledField}
                name="PerZipcode"
                label={<span>Zipcode</span>}
                req={'red'}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6,
                }}
                rules={{
                  required: 'Zipcode is required',
                  minLength: {
                    value: 6,
                    message: 'Zipcode must be exactly 6 digits',
                  },
                  maxLength: {
                    value: 6,
                    message: 'Zipcode cannot be more than 6 digits',
                  },
                }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onBlur={(event) => {
                  const zip = event.target.value;
                  if (zip?.length === 6) {
                    checkZipcode(zip, 'permanent');
                  }
                }}
              />
              <RHFAutocomplete
                disabled={disabledField}
                name="PerArea"
                req={'red'}
                label="Area"
                placeholder="Choose a Area"
                options={configs?.area?.length > 0 && configs?.area?.map((Area) => Area)}
                isOptionEqualToValue={(option, value) => option === value}
              />
              <RHFAutocomplete
                disabled={disabledField}
                name="PerCountry"
                req={'red'}
                label="Country"
                placeholder="Choose a country"
                options={countrystatecity?.map((country) => country.name)}
                isOptionEqualToValue={(option, value) => option === value}
                defaultValue="India"
                sx={{ display: 'none' }}
              />
              <RHFAutocomplete
                disabled={disabledField}
                name="PerState"
                req={'red'}
                label="State"
                placeholder="Choose a State"
                options={
                  watch('PerCountry')
                    ? countrystatecity
                        ?.find((country) => country.name === watch('PerCountry'))
                        ?.states?.map((state) => state.name) || []
                    : []
                }
                defaultValue="Gujarat"
                isOptionEqualToValue={(option, value) => option === value}
              />
              <RHFAutocomplete
                disabled={disabledField}
                name="PerCity"
                label="City"
                req={'red'}
                placeholder="Choose a City"
                options={
                  watch('PerState')
                    ? countrystatecity
                        ?.find((country) => country.name === watch('PerCountry'))
                        ?.states?.find((state) => state.name === watch('PerState'))
                        ?.cities?.map((city) => city.name) || []
                    : []
                }
                defaultValue="Surat"
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Box>
          </Stack>
          <Stack spacing={1} sx={{ p: 2, pt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
              Temporary Address
            </Typography>
            <Box
              columnGap={1.5}
              rowGap={1.5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(6, 1fr)',
              }}
            >
              <RHFTextField
                disabled={disabledField}
                name="tempStreet"
                label="Street"
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                disabled={disabledField}
                name="tempLandmark"
                label="landmark"
                req={'red'}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <RHFTextField
                disabled={disabledField}
                req={'red'}
                name="tempZipcode"
                label="Zipcode"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6,
                }}
                rules={{
                  required: 'Zipcode is required',
                  minLength: {
                    value: 6,
                    message: 'Zipcode must be at least 6 digits',
                  },
                  maxLength: {
                    value: 6,
                    message: 'Zipcode cannot be more than 6 digits',
                  },
                }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onBlur={(event) => {
                  const zip = event.target.value;
                  if (zip?.length === 6) {
                    checkZipcode(zip, 'temporary');
                  }
                }}
              />
              {configs && configs?.area?.length > 0 && (
                <RHFAutocomplete
                  disabled={disabledField}
                  name="tempArea"
                  req={'red'}
                  label="Area"
                  placeholder="Choose a Area"
                  options={
                    ((configs?.area && configs?.area?.length > 0) || []) &&
                    configs?.area?.map((Area) => Area)
                  }
                  isOptionEqualToValue={(option, value) => option === value}
                />
              )}
              <RHFAutocomplete
                disabled={disabledField}
                req={'red'}
                name="tempCountry"
                label="Country"
                placeholder="Choose a country"
                options={countrystatecity?.map((country) => country.name)}
                isOptionEqualToValue={(option, value) => option === value}
                defaultValue="India"
                sx={{ display: 'none' }}
              />
              <RHFAutocomplete
                disabled={disabledField}
                req={'red'}
                name="tempState"
                label="State"
                placeholder="Choose a State"
                options={
                  watch('tempCountry')
                    ? countrystatecity
                        ?.find((country) => country.name === watch('tempCountry'))
                        ?.states?.map((state) => state.name) || []
                    : []
                }
                defaultValue="Gujarat"
                isOptionEqualToValue={(option, value) => option === value}
              />
              <RHFAutocomplete
                disabled={disabledField}
                req={'red'}
                name="tempCity"
                label="City"
                placeholder="Choose a City"
                options={
                  watch('tempState')
                    ? countrystatecity
                        ?.find((country) => country.name === watch('tempCountry'))
                        ?.states?.find((state) => state.name === watch('tempState'))
                        ?.cities?.map((city) => city.name) || []
                    : []
                }
                defaultValue="Surat"
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const referenceDetails = (
    <>
      {mdUp && (
        <Box pl={2}>
          <Typography variant="subtitle1">Other Details</Typography>
        </Box>
      )}
      <Grid xs={12} md={12} pt={0.5}>
        <Card>
          <Box
            columnGap={1.5}
            rowGap={1.25}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(1, 1fr)',
            }}
          >
            {!mdUp && <CardHeader title="Properties" />}
            <Stack spacing={0.5} sx={{ p: 2, pb: 0 }}>
              <Typography variant="subtitle2">How did you come to know about us?</Typography>
              <Stack spacing={2}>
                <RHFRadioGroup
                  row
                  disabled={disabledField}
                  spacing={4}
                  sx={{ display: 'flex' }}
                  name="referenceBy"
                  options={INQUIRY_REFERENCE_BY}
                  onChange={(e) => {
                    setReferenceBy(e.target.value);
                    setValue('referenceBy', e.target.value);
                  }}
                />
              </Stack>
            </Stack>
            <Stack
              spacing={2}
              sx={{
                p: watch('referenceBy') === 'Other' ? 2 : 0,
                pt: watch('referenceBy') === 'Other' ? 0 : 0,
              }}
              justifyContent={'end'}
            >
              {watch('referenceBy') === 'Other' && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Write other reference name</Typography>
                  <RHFTextField
                    req={'red'}
                    name="otherReferenceBy"
                    label="Reference By"
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      methods.setValue('otherReferenceBy', value, { shouldValidate: true });
                    }}
                    disabled={disabledField}
                  />
                </Stack>
              )}
            </Stack>
          </Box>
        </Card>
      </Grid>
    </>
  );

  const BankDetails = (
    <>
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
              Bank Account Details
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
                  {fields.map((row, index) => {
                    const isEditing = editRowIndex === index;
                    const isNewRow = row.isNew;
                    const isDisabled = !!currentCustomer && !isEditing && !isNewRow;

                    return (
                      <TableRow
                        key={row.id}
                        sx={{
                          '&:hover': { backgroundColor: 'inherit' },
                          height: '70px',
                        }}
                      >
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFTextField
                            name={`bankDetails[${index}].accountHolderName`}
                            label="Account Holder Name"
                            disabled={isDisabled}
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                              methods.setValue(`bankDetails[${index}].accountHolderName`, e.target.value);
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFTextField
                            name={`bankDetails[${index}].accountNumber`}
                            label="Account Number"
                            type='text'
                            inputProps={{ pattern: '[0-9]*', inputMode: 'numeric' }}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              methods.setValue(`bankDetails[${index}].accountNumber`, value, { shouldValidate: true });
                            }}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFAutocomplete
                            name={`bankDetails[${index}].accountType`}
                            label="Account Type"
                            placeholder="Choose account type"
                            options={ACCOUNT_TYPE_OPTIONS}
                            isOptionEqualToValue={(option, value) => option === value}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFTextField
                            name={`bankDetails[${index}].IFSC`}
                            label="IFSC Code"
                            inputProps={{ maxLength: 11, pattern: '[A-Za-z0-9]*' }}
                            onInput={(e) => {
                              e.target.value = e.target.value
                                .replace(/[^A-Za-z0-9]/g, '')
                                .toUpperCase();
                            }}
                            onBlur={(e) => checkIFSC(e.target.value, index)}
                            disabled={isDisabled}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFTextField
                            name={`bankDetails[${index}].bankName`}
                            label="Bank Name"
                            disabled={isDisabled}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              methods.setValue(`bankDetails[${index}].bankName`, value, { shouldValidate: true });
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 240, padding: '0px 8px' }}>
                          <RHFTextField
                            name={`bankDetails[${index}].branchName`}
                            label="Branch Name"
                            disabled={isDisabled}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              methods.setValue(`bankDetails[${index}].branchName`, value, { shouldValidate: true });
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '150px', padding: '0px 8px' }}>
                          <IconButton onClick={() => handleReset(index)}>
                            <Iconify icon="ic:baseline-refresh" />
                          </IconButton>
                          {!!currentCustomer &&
                            !isNewRow &&
                            (isEditing ? (
                              <IconButton color="primary" onClick={handleSave}>
                                <Iconify icon="mdi:check" />
                              </IconButton>
                            ) : (
                              <IconButton color="primary" onClick={() => handleEdit(index)}>
                                <Iconify icon="eva:edit-fill" />
                              </IconButton>
                            ))}
                          {user.role === 'Admin' && (
                            <IconButton color="error" onClick={() => handleRemove(index)}>
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAdd}
            >
              Add Bank Details
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button
          disabled={disabledField}
          color="inherit"
          sx={{ margin: '0px 10px', height: '36px' }}
          variant="outlined"
          onClick={() => reset()}
        >
          Reset
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          disabled={disabledField}
          sx={{ height: '36px' }}
        >
          {!currentCustomer ? 'Submit' : 'Save'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {PersonalDetails}
          {addressDetails}
          {referenceDetails}
          {BankDetails}
          {renderActions}
        </Grid>
        <Dialog open={otpPopupOpen} onClose={() => setOtpPopupOpen(false)}>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogContent>
            <Box sx={{ m: 2 }}>
              <RHFCode name="code" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubmitAction} variant="outlined">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openPopup} onClose={null}>
          <DialogTitle sx={{ pb: 0 }}>Aadhar Verification</DialogTitle>
          <DialogActions>
            <Box sx={{ width: '500px' }}>
              <RHFTextField
                name="aadharCard"
                label="Aadhar Number"
                inputProps={{ maxLength: 12, pattern: '[0-9]*' }}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 2 }}>
                <Box>
                  <Button onClick={handleClosePopup} variant={'contained'} sx={{ mx: 1 }}>
                    Cancel
                  </Button>
                  <Button
                    variant={'contained'}
                    onClick={() => {
                      handleSubmitAction();
                      handleClose();
                    }}
                  >
                    Confirm
                  </Button>
                </Box>
              </Box>
            </Box>
          </DialogActions>
        </Dialog>
      </FormProvider>
      <Lightbox image={aadharImage || ''} open={lightbox?.open} close={lightbox?.onClose} />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

CustomerNewEditForm.propTypes = {
  currentCustomer: PropTypes.object,
};
