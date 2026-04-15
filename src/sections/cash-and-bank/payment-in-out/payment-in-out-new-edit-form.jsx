import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form/index.js';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { Button, Dialog, IconButton } from '@mui/material';
import { useGetBranch } from '../../../api/branch.js';
import RhfDatePicker from '../../../components/hook-form/rhf-date-picker.jsx';
import Iconify from '../../../components/iconify/index.js';
import { UploadBox } from '../../../components/upload/index.js';
import { useGetParty } from '../../../api/party.js';
import PartyNewEditForm from './parties/party-new-edit-form.jsx';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


// ----------------------------------------------------------------------

export default function PaymentInOutNewEditForm({ currentPayment }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [paymentMode, setPaymentMode] = useState('');
  const { branch } = useGetBranch();
  const [file, setFile] = useState(currentPayment ? currentPayment?.invoice : null);
  const { party, refetch: refetchParties, mutate } = useGetParty();
  const [inputValue, setInputValue] = useState('');
  const [openEditForm, setOpenEditForm] = useState(false);
  const [partyNameToAdd, setPartyNameToAdd] = useState('');
  const [croppedImage, setCroppedImage] = useState(currentPayment?.invoice || null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [open, setOpen] = useState(false);

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

  const NewSchema = Yup.object().shape({
    paymentType: Yup.string().required('Payment Type is required'),
    party: Yup.object().required('Party is required'),
    paymentMode: Yup.string().required('Payment Mode is required'),
    date: Yup.date().typeError('Please enter a valid date').required('Date is required'),
    ...paymentSchema,
  });

  const defaultValues = useMemo(
    () => ({
      paymentType: currentPayment?.status || '',
      party: currentPayment?.party || '',
      date: currentPayment?.date ? new Date(currentPayment?.date) : new Date(),
      description: currentPayment?.description || '',
      paymentMode: currentPayment?.paymentDetail?.paymentMode || '',
      cashAmount: currentPayment?.paymentDetail?.cashAmount || 0,
      bankAmount: currentPayment?.paymentDetail?.bankAmount || 0,
      account: currentPayment?.paymentDetail?.account || null,
    }),
    [currentPayment]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (watch('paymentMode')) {
      setPaymentMode(watch('paymentMode'));
    }
  }, [watch('paymentMode')]);

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
        account: {
          ...data.account,
        },
        bankAmount: data.bankAmount,
      };
    } else if (data.paymentMode === 'Both') {
      paymentDetail = {
        ...paymentDetail,
        cashAmount: data.cashAmount,
        account: {
          ...data.account,
        },
        bankAmount: data.bankAmount,
      };
    }

    const formData = new FormData();
    console.log(data);
    

    formData.append('company', user?.company);
    formData.append('branch', data?.party?.branch || currentPayment?.party?.branch);
    formData.append('party', data.party._id);
    formData.append('paymentMode', data.paymentMode);
    formData.append('date', data.date);
    formData.append('description', data.description);
    formData.append('status', data.paymentType);

    for (const [key, value] of Object.entries(paymentDetail)) {
      if (key === 'account' && value) {
        formData.append('paymentDetail[account][_id]', value._id);
        formData.append('paymentDetail[account][bankName]', value.bankName);
        formData.append('paymentDetail[account][accountNumber]', value.accountNumber);
        formData.append('paymentDetail[account][branchName]', value.branchName);
        formData.append('paymentDetail[account][accountHolderName]', value.accountHolderName);
      } else {
        formData.append(`paymentDetail[${key}]`, value);
      }
    }

    if (file) {
      formData.append('invoice', file);
    }

    try {
      if (currentPayment) {
        const res = await axios.put(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/payment/${currentPayment._id}`,
          formData
        );
        mutate();
        router.push(paths.dashboard.cashAndBank['payment-in-out'].list);
        enqueueSnackbar(res?.data.message);
        reset();
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/payment`,
          formData
        );
        router.push(paths.dashboard.cashAndBank['payment-in-out'].list);
        enqueueSnackbar(res?.data.message);
        reset();
      }
    } catch (error) {
      enqueueSnackbar(currentPayment ? 'Failed to update payment' : error.response.data.message, {
        variant: 'error',
      });
      console.error(error);
    }
  });

  const handleDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];

    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setOpen(true);
      };
      reader.readAsDataURL(uploadedFile);
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

  const handleDeleteImage = () => {
    setCroppedImage(null);
    setFile(null);
    setImageSrc(null);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: '600' }}>
            Payment Info
          </Typography>
          {currentPayment && (
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: '600' }}>
              Receipt No &nbsp; - &nbsp; {currentPayment.receiptNo}
            </Typography>
          )}
        </Grid>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
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
                name="paymentType"
                label="Payment Type"
                req="red"
                fullWidth
                options={['Payment In', 'Payment Out']}
                getOptionLabel={(option) => option || ''}
                renderOption={(props, option, { index }) => (
                  <li {...props} key={index}>
                    {option}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="party"
                label="Party"
                req="red"
                fullWidth
                options={party || []}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return option.name || '';
                }}
                renderOption={(props, option) => {
                  if (option === 'add-party') {
                    return (
                      <li
                        {...props}
                        key="add-party"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPartyNameToAdd(inputValue);
                          setOpenEditForm(true);
                        }}
                      >
                        <Button fullWidth startIcon={<Iconify icon="eva:plus-fill" />}>
                          Add New Party
                        </Button>
                      </li>
                    );
                  }
                  return (
                    <li
                      {...props}
                      key={option._id}
                      style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{option.name}</span>
                      <span style={{ color: option.amount <= 0 ? '#22C55E' : '#FF5630' }}>
                        ₹{Math.abs(option.amount)}
                      </span>
                    </li>
                  );
                }}
                filterOptions={(options, params) => {
                  const filtered = options.filter((option) =>
                    option.name.toLowerCase().includes(params.inputValue.toLowerCase())
                  );

                  if (params.inputValue !== '' && filtered.length === 0) {
                    filtered.push('add-party');
                  }

                  return filtered;
                }}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              <RhfDatePicker name="date" control={control} label="Date" req={'red'} />
              <RHFTextField name="description" label="Description" multiline />
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
                    req={'red'}
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
                        <RHFTextField {...field} label="Cash Amount" req={'red'} />
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
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Box>
            <UploadBox
              onDrop={handleDrop}
              onDelete={handleDeleteImage}
              placeholder={
                !file && !croppedImage ? (
                  <Stack spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload file</Typography>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {file?.type === 'application/pdf' ? (
                      <iframe
                        src={file.preview || currentPayment?.invoice}
                        width="100%"
                        height="100%"
                        title="pdf-preview"
                      />
                    ) : file?.type?.startsWith('image/') ? (
                      <img
                        src={croppedImage || file.preview}
                        alt={file.path}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : croppedImage ? (
                      <img
                        src={croppedImage}
                        alt="uploaded"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography variant="body2">{file?.path}</Typography>
                    )}
                  </Box>
                )
              }
              sx={{
                mb: 3,
                py: 2.5,
                width: 'auto',
                height: '250px',
                borderRadius: 1.5,
                mt: 3,
              }}
            />
          </Card>
          <Box xs={12} md={8} sx={{ display: 'flex', justifyContent: 'end', mt: 3 }}>
            <Button
              color="inherit"
              sx={{ margin: '0px 10px', height: '36px' }}
              variant="outlined"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {currentPayment ? 'Save' : 'Submit'}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
      <PartyNewEditForm
        open={openEditForm}
        setOpen={setOpenEditForm}
        mutate={mutate}
        partyName={partyNameToAdd}
      />
      <Dialog open={open} onClose={handleCancel}>
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(newCrop) => setCompletedCrop(newCrop)}
            aspect={1}
          >
            <img
              id="cropped-image"
              src={imageSrc}
              alt="Crop preview"
              onLoad={resetCrop}
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </ReactCrop>
        )}
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
    </FormProvider>
  );
}

PaymentInOutNewEditForm.propTypes = {
  currentPayment: PropTypes.object,
};
