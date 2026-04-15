import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Logo from 'src/components/logo';
import { useAuthContext } from '../../../auth/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'react-router';

// ----------------------------------------------------------------------

export default function JwtResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
const {token} = useParams()
  const returnTo = searchParams.get('returnTo');

  const newPassword = useBoolean();
  const confirmPassword = useBoolean();

  const LoginSchema = Yup.object().shape({
    newPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const defaultValues = {
    newPassword: '',
    confirmPassword: '',

  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_AUTH_API}/reset-password/${token}`,data)
      enqueueSnackbar(res?.data.message);
      router.push(paths.auth.jwt.login);
    } catch (error) {
      enqueueSnackbar("something went wrong",{variant:'error'});
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 1 }}>
      <Typography sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Logo /></Typography>
    </Stack>
  );

  return (
    <Box sx={{height:'100vh',display:'flex',justifyContent:"center" ,alignItems:'center'}}>
      <Box width={350} sx={{boxShadow: '1px 1px 20px #e1e1e1',p:3,borderRadius:2}}>
        {renderHead}
        <Stack sx={{mb:3}} alignItems={'center'}>
          <Typography variant='h4'>Reset password</Typography>
        </Stack>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <RHFTextField
              name='newPassword'
              label='New Password'
              type={newPassword.value ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={newPassword.onToggle} edge='end'>
                      <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              name='confirmPassword'
              label='Confirm Password'
              type={confirmPassword.value ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={confirmPassword.onToggle} edge='end'>
                      <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
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
              Submit
            </LoadingButton>   <Stack sx={{ textAlign: 'center', mt: '10px' }}>

          </Stack>
          </Stack>
        </FormProvider>
      </Box>
    </Box>
  );
}
