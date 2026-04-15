import React, { useCallback, useMemo, useState } from 'react';
import { Box, Card, Container, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { Stack } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from '../../../routes/hooks';

export default function MyProfile() {
  const { user, initialize } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuthContext();
  const [disable, setDisable] = useState(true);
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      avatar_url: user?.avatar_url || '',
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      contact: user?.contact || '',
    }),
    [user],
  );

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    middleName: Yup.string().optional(),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address'),
    contact: Yup.string()
      .required('Phone Number is required')
      .min(10, 'Contact number must be 10 digits')
      .max(10, 'Contact number must be 10 digits'),
  });

  const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string()
      .min(1, 'Password must be at least 6 characters')
      .required('New Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const passwordMethods = useForm({
    resolver: yupResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const {
    handleSubmit: handlePasswordSubmit,
    formState: { isSubmitting: isPasswordSubmitting },
  } = passwordMethods;

  const handleDisable = () => {
    setDisable(false);
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setValue('avatar_url', newFile.preview);
      const formData = new FormData();
      formData.append('profile-pic', file);
      axios
        .put(`${import.meta.env.VITE_BASE_URL}/${user?.company}/user/${user?._id}/profile`, formData)
        .then(() => {
          enqueueSnackbar('Profile image updated successfully');
          initialize();
        })
        .catch(() => enqueueSnackbar('Something went wrong'));
    },
    [setValue, enqueueSnackbar, user?._id, initialize],
  );

  const onSubmitPersonalDetails = async (data) => {
    const payload = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      contact: data.contact,
    };
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/user/${user?._id}`;
    try {
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        initialize();
        enqueueSnackbar('Personal details updated successfully', {
          variant: 'success',
        });
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'An error occurred', {
        variant: 'error',
      });
    }
  };

  const onSubmitPassword = async (data) => {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/user/${user?._id}/update-password`;
    try {
      const res = await axios.put(URL, payload);
      if (res.status === 200) {
        await logout();
        router.push('/');
        enqueueSnackbar('Password updated successfully', {
          variant: 'success',
        });
        passwordMethods.reset();
      }
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'An error occurred', {
        variant: 'error',
      });
    }
  };

  return (
    <Container maxWidth={'lg'}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={8}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitPersonalDetails)}>
            <Typography variant='h6' sx={{ mb: 0.5 }}>
              Personal Details
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
              Personal info, profile pic, Name...
            </Typography>
            <Card sx={{ pt: 5, px: 3 }}>
              <Box sx={{ mb: 5, px: 3, display: 'flex', textAlign: 'center', justifyContent: 'start' }}>
                <RHFUploadAvatar name='avatar_url' onDrop={handleDrop} />
              </Box>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Box
                  columnGap={2}
                  rowGap={3}
                  display='grid'
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(3, 1fr)',
                  }}
                >
                  <RHFTextField label='First Name' name='firstName' onClick={handleDisable} />
                  <RHFTextField label='Middle Name' name='middleName' onClick={handleDisable} />
                  <RHFTextField label='Last Name' name='lastName' onClick={handleDisable} />
                  <RHFTextField label='Email' name='email' onClick={handleDisable} />
                  {
                    user?.role === 'Admin' &&
                    <RHFTextField label='Contact' name='contact' onClick={handleDisable} />
                  }
                </Box>
                <Stack direction='row' justifyContent='flex-end'>
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    disabled={disable}
                    loading={isSubmitting}
                  >
                    Submit
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </FormProvider>
        </Grid>
        {user?.role === 'Admin' && <Grid item xs={12} md={4}>
          <FormProvider methods={passwordMethods} onSubmit={handlePasswordSubmit(onSubmitPassword)}>
            <Typography variant='h6' sx={{ mb: 0.5 }}>
              Update Password
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3 }}>
              Password info...
            </Typography>
            <Card>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Box
                  columnGap={2}
                  rowGap={3}
                  display='grid'
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                  }}
                >
                  <RHFTextField label='Current Password' name='currentPassword' />
                  <RHFTextField label='New Password' name='newPassword' />
                  <RHFTextField label='Confirm Password' name='confirmPassword' />
                </Box>
                <Stack direction='row' justifyContent='flex-end'>
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    loading={isPasswordSubmitting}
                  >
                    Update Password
                  </LoadingButton>
                </Stack>
              </Stack>
            </Card>
          </FormProvider>
        </Grid>}
      </Grid>
    </Container>
  );
}
