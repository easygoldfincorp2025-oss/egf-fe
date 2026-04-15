import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { Box, Stack, IconButton, Typography, InputAdornment, Link } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { AUTH_API, PATH_AFTER_LOGIN } from 'src/config-global';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import logo from 'src/assets/logo/logo.png';
import { useAuthContext } from '../../../auth/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import {useTheme} from "@mui/material/styles";

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();
  const router = useRouter();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const searchParams = useSearchParams();
  const [canResendOTP, setCanResendOTP] = useState(false);
  const returnTo = searchParams.get('returnTo');


  // Validation schema
  const LoginSchema = Yup.object().shape({
    contact: Yup.string()
      .required('Contact is required')
      .matches(/^\d{10}$/, 'Contact must be a 10-digit number'),
    otp: Yup.string().required('OTP is required'),
  });

  // Default form values
  const defaultValues = {
    contact: '',
    otp: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const contactValue = watch('contact');

  const onSubmit = async (data) => {
    try {
      await login(data.contact, data.otp);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error('Login failed:', error);
      reset();
    }
  };

  const handleSendOTP = async () => {
    if (!contactValue || !/^\d{10}$/.test(contactValue)) {
      enqueueSnackbar('Please enter a valid 10-digit contact number.');
      return;
    }

    try {
      const URL = `${AUTH_API}/send-otp`;
      await axios.post(URL, { contact: contactValue });
      enqueueSnackbar(`OTP sent successfully`);

      setIsButtonDisabled(true);
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 30000);

      setCanResendOTP(false);
      setTimeout(() => setCanResendOTP(true), 5000);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  // Render header
  const renderHeader = (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={logo} alt="logo" width={100} />
      </Box>
    </Stack>
  );

  return (
    <>
      {renderHeader}
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          spacing={2.5}
        >
          <RHFTextField
            name="contact"
            label="Contact"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="send OTP"
                    onClick={handleSendOTP}
                    disabled={isButtonDisabled}
                  >
                    <Iconify icon="eva:paper-plane-outline" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <RHFTextField name="otp" label="OTP" type={"password"}/>
          <Stack>
            {canResendOTP && (
              <Link onClick={handleSendOTP} variant="subtitle2">
                Resent OTP?
              </Link>
            )}
          </Stack>
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Login
          </LoadingButton>
          <Stack sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">Don't have an account?</Typography>
            <Link
              component={RouterLink}
              href={paths.auth.jwt.register}
              variant="subtitle2"
              sx={{ mt: 1 }}
            >
              Create an account
            </Link>
          </Stack>
        </Stack>
      </FormProvider>
    </>
  );
}
