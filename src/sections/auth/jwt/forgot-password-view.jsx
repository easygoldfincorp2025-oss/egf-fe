import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';


import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Logo from 'src/components/logo';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function JwtForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: '',
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
      const res = await axios.post(`${import.meta.env.VITE_AUTH_API}/forgot-password`,data)
      enqueueSnackbar(res?.data.message);
    } catch (error) {
      enqueueSnackbar("something went wrong",{variant:'error'});
      console.error(error);
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
          <Typography variant='h4'>Forgot password</Typography>
        </Stack>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <RHFTextField name='email' label='Email address' />

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

            <Link component={RouterLink} href={paths.auth.jwt.login} variant='subtitle2' sx={{ mt: '8px' }}>
              Back to Login
            </Link>
          </Stack>

          </Stack>
        </FormProvider>
      </Box>
    </Box>
  );
}
