import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import countrystatecity from '../../_mock/map/csc.json';
import FormProvider, { RHFAutocomplete, RHFCode, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Button, Dialog, DialogContent, IconButton } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useGetAllUser } from 'src/api/user';
import { useGetConfigs } from '../../api/config';
import { useGetBranch } from '../../api/branch';
import RhfDatePicker from '../../components/hook-form/rhf-date-picker.jsx';
import ReactCrop from 'react-image-crop';
import DialogTitle from '@mui/material/DialogTitle';
import Webcam from 'react-webcam';
import DialogActions from '@mui/material/DialogActions';
import Iconify from '../../components/iconify';
import Lightbox, { useLightBox } from '../../components/lightbox/index.js';
import * as yup from 'yup';
import { ACCOUNT_TYPE_OPTIONS } from '../../_mock/index.js';

// ----------------------------------------------------------------------

export default function EmployeeNewEditForm({ currentEmployee }) {
  const router = useRouter();
  const allUser = useGetAllUser();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const webcamRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50 });
  const [rotation, setRotation] = useState(0);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [otpPopupOpen, setOtpPopupOpen] = useState(false);
  const [isAadhar, setIsAadhar] = useState(false);
  const [aadharImage, setAadharImage] = useState();
  const [disabledField, setDisabledField] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const lightbox = useLightBox(aadharImage);

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
    if (!currentEmployee) {
      setOpenPopup(true);
    }
  }, []);

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

  const NewEmployeeSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    middleName: Yup.string().required('Middle name is required'),
    lastName: Yup.string().required('Last name is required'),
    drivingLicense: Yup.string(),
    panCard: Yup.string().required('PAN No. is required'),
    voterCard: Yup.string(),
    aadharCard: Yup.string().required('Aadhar Card is required'),
    profile_pic: Yup.mixed().required('A property picture is required'),
    contact: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    fatherContact: Yup.string()
      .required(`Father's Mobile number is required`)
      .matches(/^\d{10}$/, `Mobile number must be exactly 10 digits`),
    dob: Yup.date()
      .required('Date of Birth is required')
      .nullable()
      .typeError('Date of Birth is required'),
    role: Yup.string().required('Role is required'),
    reportingTo: Yup.object().required('Reporting to is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    joiningDate: Yup.date()
      .required('Joining date is required')
      .nullable()
      .typeError('Joining date is required'),
    leaveDate: Yup.string().typeError('Enter a valid date').nullable(),
    permanentStreet: Yup.string().required('Permanent Address is required'),
    permanentLandmark: Yup.string().required('Landmark is required'),
    permanentCountry: Yup.string().required('Country is required'),
    permanentState: Yup.string().required('State is required'),
    permanentCity: Yup.string().required('City is required'),
    permanentZipcode: Yup.string().required('Zipcode is required'),
    tempStreet: Yup.string().required('Permanent Address is required'),
    tempLandmark: Yup.string().required('Landmark is required'),
    tempCountry: Yup.string().required('Country is required'),
    tempState: Yup.string().required('State is required'),
    tempCity: Yup.string().required('City is required'),
    tempZipcode: Yup.string().required('Zipcode is required'),
    accountNumber: yup.string().required('Account Number is required'),
    accountType: yup.string().required('Account Type is required'),
    accountHolderName: yup.string().required('Account Holder Name is required'),
    bankName: yup.string().required('Bank Name is required'),
    IFSC: yup.string().required('IFSC Code is required'),
    branchName: yup.string().required('Branch Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      isAadharVerified: currentEmployee?.isAadharVerified || false,
      branchId: currentEmployee
        ? {
            label: currentEmployee?.user?.branch?.name,
            value: currentEmployee?.user?.branch?._id,
          }
        : null,
      profile_pic: currentEmployee?.user.avatar_url || null,
      firstName: currentEmployee?.user.firstName || '',
      middleName: currentEmployee?.user.middleName || '',
      lastName: currentEmployee?.user.lastName || '',
      drivingLicense: currentEmployee?.drivingLicense || '',
      voterCard: currentEmployee?.voterCard || '',
      panCard: currentEmployee?.panCard || '',
      aadharCard: currentEmployee?.aadharCard || '',
      contact: currentEmployee?.user.contact || '',
      fatherContact: currentEmployee?.user.fatherContact || '',
      dob: new Date(currentEmployee?.dob) || '',
      remark: currentEmployee?.remark || '',
      role: currentEmployee?.user.role || '',
      reportingTo: currentEmployee?.reportingTo || null,
      email: currentEmployee?.user.email || '',
      joiningDate: currentEmployee ? new Date(currentEmployee?.joiningDate) : new Date(),
      leaveDate: new Date(currentEmployee?.leaveDate) || null,
      permanentStreet: currentEmployee?.permanentAddress.street || '',
      permanentLandmark: currentEmployee?.permanentAddress.landmark || '',
      permanentCountry: currentEmployee?.permanentAddress.country || '',
      permanentState: currentEmployee?.permanentAddress.state || '',
      permanentCity: currentEmployee?.permanentAddress.city || '',
      permanentZipcode: currentEmployee?.permanentAddress.zipcode || '',
      tempStreet: currentEmployee?.temporaryAddress.street || '',
      tempLandmark: currentEmployee?.temporaryAddress.landmark || '',
      tempCountry: currentEmployee?.temporaryAddress.country || '',
      tempState: currentEmployee?.temporaryAddress.state || '',
      tempCity: currentEmployee?.temporaryAddress.city || '',
      tempZipcode: currentEmployee?.temporaryAddress.zipcode || '',
      status: currentEmployee?.status || 'Active',
      accountNumber: currentEmployee?.bankDetails?.accountNumber || '',
      accountType: currentEmployee?.bankDetails?.accountType || '',
      accountHolderName: currentEmployee?.bankDetails?.accountHolderName || '',
      bankName: currentEmployee?.bankDetails?.bankName || '',
      IFSC: currentEmployee?.bankDetails?.IFSC || '',
      branchName: currentEmployee?.bankDetails?.branchName || '',
    }),
    [currentEmployee]
  );

  const methods = useForm({
    resolver: yupResolver(NewEmployeeSchema),
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

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const onSubmit = handleSubmit(async (data) => {
    const mainbranchid = branch?.find((e) => e?._id === data?.branchId?.value) || branch?.[0];
    let parsedBranch = storedBranch;

    if (storedBranch !== 'all') {
      try {
        parsedBranch = JSON.parse(storedBranch);
      } catch (error) {
        console.error('Error parsing storedBranch:', error);
      }
    }

    let payload;
    const permanentAddress = {
      street: data.permanentStreet.toUpperCase() || '',
      landmark: data.permanentLandmark.toUpperCase() || '',
      country: data.permanentCountry || '',
      state: data.permanentState || '',
      city: data.permanentCity || '',
      zipcode: data.permanentZipcode || '',
    };

    const temporaryAddress = {
      street: data.tempStreet.toUpperCase() || '',
      landmark: data.tempLandmark.toUpperCase() || '',
      country: data.tempCountry || '',
      state: data.tempState || '',
      city: data.tempCity || '',
      zipcode: data.tempZipcode || '',
    };

    const isAadharVerified = data.isAadharVerified !== undefined ? data.isAadharVerified : false; // Default to false if not set

    if (currentEmployee) {
      payload = {
        ...data,
        reportingTo: data.reportingTo?._id || '',
        permanentAddress,
        temporaryAddress,
        branch: data.branchId || parsedBranch,
        isAadharVerified,
        status: data.status,
        bankDetails: {
          accountNumber: data.accountNumber || '',
          accountType: data.accountType || '',
          accountHolderName: capitalize(data.accountHolderName) || '',
          bankName: capitalize(data.bankName) || '',
          IFSC: capitalize(data.IFSC) || '',
          branchName: capitalize(data.branchName) || '',
        }
      };
    } else {
      const formData = new FormData();
      const fields = [
        'firstName',
        'middleName',
        'lastName',
        'drivingLicense',
        'voterCard',
        'panCard',
        'aadharCard',
        'contact',
        'fatherContact',
        'dob',
        'remark',
        'role',
        'reportingTo',
        'email',
        'joiningDate',
        'leaveDate',
      ];

      fields.forEach((field) => {
        if (field === 'reportingTo') {
          formData.append(field, data[field]?._id || '');
        } else {
          formData.append(field, data[field] || '');
        }
      });

      formData.append('isAadharVerified', isAadharVerified);

      if (croppedImage) {
        const croppedFile = file;
        formData.append('profile-pic', croppedFile, 'employee-image.jpg');
      } else if (capturedImage) {
        const base64Data = capturedImage.split(',')[1];
        const binaryData = atob(base64Data);
        const arrayBuffer = new Uint8Array(binaryData.length);

        for (let i = 0; i < binaryData.length; i++) {
          arrayBuffer[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        formData.append('profile-pic', blob, 'employee-image.jpg');
      } else {
        formData.append('profile-pic', data.profile_pic);
      }

      formData.append('branch', data.branchId || parsedBranch);
      const addressFields = ['street', 'landmark', 'country', 'state', 'city', 'zipcode'];

      addressFields.forEach((field) => {
        formData.append(`permanentAddress[${field}]`, data[`permanent${capitalize(field)}`] || '');
        formData.append(`temporaryAddress[${field}]`, data[`temp${capitalize(field)}`] || '');
      });

      const accountFields = ['accountNumber', 'accountType', 'accountHolderName', 'bankName', 'IFSC', 'branchName'];

      accountFields.forEach((field) => {
        formData.append(`bankDetails[${field}]`, data[`${capitalize(field)}`] || '');
      })

      payload = formData;
    }

    try {
      const branchQuery =
        parsedBranch && parsedBranch === 'all'
          ? `branch=${mainbranchid?._id}`
          : `branch=${parsedBranch}`;

      const url = currentEmployee
        ? `${import.meta.env.VITE_BASE_URL}/${user?.company}/employee/${currentEmployee._id}?${branchQuery}`
        : `${import.meta.env.VITE_BASE_URL}/${user?.company}/employee?${branchQuery}`;

      const config = {
        method: currentEmployee ? 'put' : 'post',
        url,
        data: payload,
      };

      if (!currentEmployee) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }

      const response = await axios(config);
      enqueueSnackbar(response?.data.message);
      router.push(paths.dashboard.employee.list);
      reset();
    } catch (error) {
      enqueueSnackbar(currentEmployee ? 'Failed To update employee' : error.response.data.message, {
        variant: 'error',
      });
      console.error(error);
    }
  });

  const checkZipcode = async (zipcode, type = 'permanent') => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${zipcode}`);
      const data = response.data[0];

      if (data.Status === 'Success') {
        if (type === 'permanent') {
          setValue('permanentCountry', data.PostOffice[0]?.Country, { shouldValidate: true });
          setValue('permanentState', data.PostOffice[0]?.Circle, { shouldValidate: true });
          setValue('permanentCity', data.PostOffice[0]?.District, { shouldValidate: true });
        } else if (type === 'temporary') {
          setValue('tempCountry', data.PostOffice[0]?.Country, { shouldValidate: true });
          setValue('tempState', data.PostOffice[0]?.Circle, { shouldValidate: true });
          setValue('tempCity', data.PostOffice[0]?.District, { shouldValidate: true });
        }
      } else {
        if (type === 'permanent') {
          setValue('permanentCountry', '', { shouldValidate: true });
          setValue('permanentState', '', { shouldValidate: true });
          setValue('permanentCity', '', { shouldValidate: true });
        } else if (type === 'temporary') {
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

      if (type === 'permanent') {
        setValue('PerCountry', '', { shouldValidate: true });
        setValue('PerState', '', { shouldValidate: true });
      } else if (type === 'temporary') {
        setValue('tempCountry', '', { shouldValidate: true });
        setValue('tempState', '', { shouldValidate: true });
      }
      enqueueSnackbar('Failed to fetch country and state details.', { variant: 'error' });
    }
  };

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

        if (currentEmployee) {
          const formData = new FormData();
          formData.append('profile-pic', file);

          try {
            const response = await axios.put(
              `${import.meta.env.VITE_BASE_URL}/${user?.company}/user/${currentEmployee.user._id}/profile`,
              formData
            );
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
  }, [webcamRef, setCapturedImage, setValue, setOpen2, user, currentEmployee]);

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

        if (otpCode.length !== 6) {
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
          setDisabledField(false);
          setValue('isAadharVerified', true, { shouldValidate: true });
          const apidata = otpResponse.data.data;
          const fullName = apidata.name;
          const nameParts = fullName.split(' ');

          setValue('profile_pic', 'data:image/jpeg;base64,' + apidata?.photo_link, {
            shouldValidate: true,
          });
          setAadharImage('data:image/jpeg;base64,' + apidata?.photo_link);
          setValue('firstName', nameParts[0], { shouldValidate: true });
          setValue('middleName', nameParts[1] || '', { shouldValidate: true });
          setValue('lastName', nameParts.slice(2).join(' '), { shouldValidate: true });
          setValue('dob', apidata.dob ? new Date(apidata.dob) : null, { shouldValidate: true });
          setValue(
            'permanentStreet',
            apidata.split_address.house + ' ' + apidata.split_address.street,
            { shouldValidate: true }
          );
          setValue('permanentLandmark', apidata.split_address.landmark, { shouldValidate: true });
          setValue('permanentZipcode', apidata.split_address.pincode, { shouldValidate: true });
          setValue('permanentCountry', apidata.split_address.country, { shouldValidate: true });
          setValue('permanentState', apidata.split_address.state, { shouldValidate: true });
          setValue('permanentCity', apidata.split_address.dist, { shouldValidate: true });
        }
      } catch (error) {
        setOpenPopup(true);
        setOtpPopupOpen(false);
        enqueueSnackbar('Error in OTP verification. Please try again.', { variant: 'error' });
        if (userRole.toLowerCase() === 'employee') {
          enqueueSnackbar('Cannot proceed without Aadhaar card verification.', {
            variant: 'error',
          });
        }
        console.error('Error in OTP verification:', error);
      }
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} p={0}>
            <Box sx={{ pt: 2, px: 3 }}>
              <RHFUploadAvatar
                name="profile_pic"
                camera={true}
                setOpen2={setOpen2}
                setOpen={setOpen}
                setImageSrc={setImageSrc}
                setFile={setFile}
                file={
                  croppedImage || imageSrc || capturedImage || currentEmployee?.user?.avatar_url
                }
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
                <Box
                  sx={{
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
            </Box>
          </Grid>
          <Grid xs={12} md={9}>
            <Card sx={{ p: 2 }}>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(4, 1fr)',
                }}
              >
                {user?.role === 'Admin' && branch && storedBranch === 'all' && (
                  <RHFAutocomplete
                    name="branchId"
                    req={'red'}
                    label="Branch"
                    placeholder="Choose a Branch"
                    options={
                      branch?.map((branchItem) => ({
                        label: branchItem?.name,
                        value: branchItem?._id,
                      })) || []
                    }
                    isOptionEqualToValue={(option, value) => option?.value === value?.value}
                  />
                )}
                <RHFTextField
                  disabled={disabledField}
                  name="firstName"
                  label="First Name"
                  req={'red'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    methods.setValue('firstName', e.target.value);
                  }}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="middleName"
                  label="Middle Name"
                  req={'red'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    methods.setValue('middleName', e.target.value);
                  }}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="lastName"
                  label="Last Name"
                  req={'red'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    methods.setValue('lastName', e.target.value);
                  }}
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
                  label="Pan No."
                  req={'red'}
                  inputProps={{ minLength: 10, maxLength: 10 }}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    methods.setValue('panCard', value, { shouldValidate: true });
                  }}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="voterCard"
                  label="Voter ID"
                  onInput={(e) => {
                    e.target.value = e.target.value.toUpperCase();
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
                            watch('isAadharVerified')
                              ? 'ic:round-check-circle'
                              : 'ic:round-verified'
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
                <RHFTextField
                  disabled={disabledField}
                  name="contact"
                  label="Mobile"
                  req={'red'}
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
                />
                <RHFTextField
                  disabled={disabledField}
                  name="fatherContact"
                  label="Father's Mobile"
                  req={'red'}
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
                />
                <RhfDatePicker
                  disabled={disabledField}
                  name="dob"
                  control={control}
                  label="Date of Birth"
                  req={'red'}
                />
                <RHFTextField disabled={disabledField} name='remark' label='Remark' onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  methods.setValue('remark', e.target.value);
                }} />
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
                          onClick={() => lightbox.onOpen(aadharImage)}
                          sx={{ cursor: 'zoom-in', height: '100%', width: '100%' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Official Info
              </Typography>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(6, 1fr)',
                }}
              >
                {configs.roles && (
                  <RHFAutocomplete
                    disabled={disabledField}
                    name="role"
                    label="Role"
                    req={'red'}
                    fullWidth
                    options={configs?.roles?.map((item) => item)}
                    getOptionLabel={(option) => option}
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        {option}
                      </li>
                    )}
                  />
                )}
                {allUser?.user && (
                  <RHFAutocomplete
                    name="reportingTo"
                    disabled={disabledField}
                    label="Reporting to"
                    req={'red'}
                    fullWidth
                    options={allUser?.user?.map((item) => item)}
                    getOptionLabel={(option) => option.firstName + ' ' + option.lastName}
                    renderOption={(props, option) => (
                      <li {...props} key={option} value={option._id}>
                        {option.firstName + ' ' + option.lastName}
                      </li>
                    )}
                  />
                )}
                <RHFTextField disabled={disabledField} name="email" label="Email" req={'red'} />
                <RhfDatePicker
                  disabled={disabledField}
                  name="joiningDate"
                  control={control}
                  label="Join Date"
                  req={'red'}
                />
                <RhfDatePicker
                  disabled={disabledField}
                  name="leaveDate"
                  control={control}
                  label="Leave Date"
                />
                <RHFAutocomplete
                  name="status"
                  label="Status"
                  fullWidth
                  options={['Active', 'InActive', 'Block']}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Permanent Address
              </Typography>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(6, 1fr)',
                }}
              >
                <RHFTextField
                  disabled={disabledField}
                  name="permanentStreet"
                  label="Address"
                  req={'red'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="permanentLandmark"
                  label="Landmark"
                  req={'red'}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="permanentZipcode"
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
                    if (zip.length === 6) {
                      checkZipcode(zip);
                    }
                  }}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="permanentCountry"
                  label="Country"
                  req={'red'}
                  fullWidth
                  options={countrystatecity.map((country) => country.name)}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="permanentState"
                  label="State"
                  req={'red'}
                  fullWidth
                  options={
                    watch('permanentCountry')
                      ? countrystatecity
                          .find((country) => country.name === watch('permanentCountry'))
                          ?.states.map((state) => state.name) || []
                      : []
                  }
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="permanentCity"
                  label="City"
                  req={'red'}
                  fullWidth
                  options={
                    watch('permanentState')
                      ? countrystatecity
                          .find((country) => country.name === watch('permanentCountry'))
                          ?.states.find((state) => state.name === watch('permanentState'))
                          ?.cities.map((city) => city.name) || []
                      : []
                  }
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ my: 1.5, fontWeight: '600' }}>
                Temporary Address
              </Typography>
              <Box
                rowGap={1.5}
                columnGap={1.5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(6, 1fr)',
                }}
              >
                <RHFTextField
                  disabled={disabledField}
                  name="tempStreet"
                  label="Address"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  req={'red'}
                />
                <RHFTextField
                  disabled={disabledField}
                  name="tempLandmark"
                  label="Landmark"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                  req={'red'}
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
                    if (zip.length === 6) {
                      checkZipcode(zip, 'temporary');
                    }
                  }}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="tempCountry"
                  label="Country"
                  req={'red'}
                  fullWidth
                  options={countrystatecity.map((country) => country.name)}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="tempState"
                  label="State"
                  req={'red'}
                  fullWidth
                  options={
                    watch('tempCountry')
                      ? countrystatecity
                          .find((country) => country.name === watch('tempCountry'))
                          ?.states.map((state) => state.name) || []
                      : []
                  }
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
                <RHFAutocomplete
                  disabled={disabledField}
                  name="tempCity"
                  label="City"
                  req={'red'}
                  fullWidth
                  options={
                    watch('tempState')
                      ? countrystatecity
                          .find((country) => country.name === watch('tempCountry'))
                          ?.states.find((state) => state.name === watch('tempState'))
                          ?.cities.map((city) => city.name) || []
                      : []
                  }
                  getOptionLabel={(option) => option}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {option}
                    </li>
                  )}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                Bank Account Details
              </Typography>
              <Box rowGap={1.5}
                   columnGap={1.5}
                   display="grid"
                   gridTemplateColumns={{
                     xs: 'repeat(1, 1fr)',
                     sm: 'repeat(6, 1fr)',
                   }}>
                <RHFTextField
                  name="accountNumber"
                  label="Account Number"
                  inputProps={{ inputMode: 'numeric' }}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                  rules={{
                    required: 'Account Number is required',
                    pattern: {
                      value: /^[0-9]*$/,
                      message: 'Only numeric values are allowed',
                    },
                  }}
                />
                <RHFAutocomplete
                  name="accountType"
                  label="Account Type"
                  options={ACCOUNT_TYPE_OPTIONS}
                  isOptionEqualToValue={(option, value) => option === value}
                />
                <RHFTextField name="accountHolderName" label="Account Holder Name" />
                <RHFTextField name="bankName" label="Bank Name" />
                <RHFTextField
                  name="IFSC"
                  label="IFSC Code"
                  inputProps={{
                    style: { textTransform: 'uppercase' },
                  }}
                  onBlur={(e) => checkIFSC(e.target.value)}
                />
                <RHFTextField name="branchName" label="Branch Name" disabled/>
              </Box>
            </Card>
          </Grid>
        </Grid>
        <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
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
            disabled={disabledField}
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {!currentEmployee ? 'Submit' : 'Save'}
          </LoadingButton>
        </Box>
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
      <Lightbox image={aadharImage} open={lightbox.open} close={lightbox.onClose} />
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
          <Button variant="outlined" onClick={capture} disabled={disabledField}>
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

EmployeeNewEditForm.propTypes = {
  currentEmployee: PropTypes.object,
};
