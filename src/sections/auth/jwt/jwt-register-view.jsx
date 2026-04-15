import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useSnackbar } from 'src/components/snackbar';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import Logo from '../../../components/logo';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string().notRequired(),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().required('Email is required').email('Must be a valid email'),
  password: Yup.string().required('Password is required'),
  contact: Yup.string().notRequired(),
  companyName: Yup.string().notRequired(),
  role: Yup.string().required('Role is required').default('Admin'),
});

const defaultValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  contact: '',
  email: '',
  password: '',
  companyName: '',
  role: 'Admin',
};

export default function JwtRegisterView() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const URL = `${import.meta.env.VITE_AUTH_API}/register`;
      const response = await axios.post(URL, data);
      if (response.data.status === 201) {
        enqueueSnackbar(response.data.message, { variant: 'success' });
        reset();
        router.push(returnTo || PATH_AFTER_LOGIN);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <Stack spacing={2} sx={{ mb: 1 }}>
        <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Logo /></Typography>
      </Stack>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          <RHFTextField name='firstName' label='First name' />
          <RHFTextField name='middleName' label='Middle name' />
          <RHFTextField name='lastName' label='Last name' />
          <RHFTextField name='contact' label='Contact' />
          <RHFTextField name='companyName' label='Company Name' />
          <RHFTextField name='email' label='Email address' />
          <RHFTextField
            name='password'
            label='Password'
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={handleClickShowPassword} edge='end'>
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <LoadingButton
            fullWidth
            color='inherit'
            size='large'
            type='submit'
            variant='contained'
            loading={isSubmitting}
          >
            Create account
          </LoadingButton>
        </Stack>
      </FormProvider>
      <Stack direction='row' sx={{ textAlign: 'center', mt: '20px', justifyContent: 'center' }}>
        <Typography variant='body2'>Already have an account?</Typography>
        <Typography>
          <Link component={RouterLink} href={paths.auth.jwt.login} variant='subtitle2' style={{ marginLeft: '5px' }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
      <Typography
        component='div'
        sx={{
          mt: 2.5,
          textAlign: 'center',
          typography: 'caption',
          color: 'text.secondary',
        }}
      >
        By signing up, I agree to{' '}
        <Link underline='always' color='text.primary'>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link underline='always' color='text.primary'>
          Privacy Policy
        </Link>
      </Typography>
    </>
  );
}
