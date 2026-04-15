import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { paths } from 'src/routes/paths';
import { Grid } from '@mui/material';
import loginImage from 'src/assets/login-back/login.jpg';
import { useRouter } from '../../routes/hooks';
import { PATH_AFTER_LOGIN } from '../../config-global';
import Iconify from '../../components/iconify';
import {useTheme} from "@mui/material/styles";
// ----------------------------------------------------------------------

const METHODS = [
  {
    id: 'jwt',
    label: 'Jwt',
    path: paths.auth.jwt.login,
    icon: '/assets/icons/auth/ic_jwt.svg',
  },
  {
    id: 'firebase',
    label: 'Firebase',
    path: paths.auth.firebase.login,
    icon: '/assets/icons/auth/ic_firebase.svg',
  },
  {
    id: 'amplify',
    label: 'Amplify',
    path: paths.auth.amplify.login,
    icon: '/assets/icons/auth/ic_amplify.svg',
  },
  {
    id: 'auth0',
    label: 'Auth0',
    path: paths.auth.auth0.login,
    icon: '/assets/icons/auth/ic_auth0.svg',
  },
  {
    id: 'supabase',
    label: 'Supabase',
    path: paths.auth.supabase.login,
    icon: '/assets/icons/auth/ic_supabase.svg',
  },
];

export default function AuthClassicLayout({ children, register, invite, forgotPassword }) {
  const router = useRouter();
  const theme = useTheme();
  const renderContent = (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'light' ? '#ffff' : '#222830',
          position: invite ? 'relative' : 'unset',
        }}
      >
        {invite && (
          <Box
            sx={{
              position: 'absolute',
              top: '3%',
              left: '5%',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => router.push(PATH_AFTER_LOGIN)}
          >
            <Iconify
              icon="material-symbols-light:keyboard-backspace"
              sx={{ height: '25px', width: '25px', marginRight: '3px' }}
            />{' '}
            Back
          </Box>
        )}
        <Grid
          container
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '1px 1px 10px #e1e1e1',
            maxWidth: { md: '85rem !important', xs: 'unset' },
            width: forgotPassword ? { xs: '430px' } : { xs: '430px', md: '100%' },
            mx: '20px',
            justifyContent: { xs: 'center' },
            height: register ? { xs: '620px', md: '890px' } : { xs: '450px', md: '550px' },
          }}
        >
          <Grid item xs={12} md={5} lg={4}>
            <Stack
              sx={{
                px: { xs: 6, md: 8 },
                pt: register ? { xs: 2, md: 2 } : { xs: 3, md: 3 },
                pb: register ? { xs: 6, md: 6 } : { xs: 8, md: 10 },
              }}
            >
              {children}
            </Stack>
          </Grid>
          {!forgotPassword && (
            <Grid
              item
              md={7}
              lg={8}
              sx={{
                display: {
                  xs: 'none',
                  md: 'none',
                  lg: 'block',
                },
              }}
            >
              <img
                src={loginImage}
                alt={loginImage}
                style={{ height: '100%', aspectRatio: '3/2' }}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );

  return (
    <Stack component="main" direction="row">
      {renderContent}
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
