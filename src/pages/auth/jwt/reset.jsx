import { Helmet } from 'react-helmet-async';

import { JwtLoginView } from 'src/sections/auth/jwt';
import JwtResetPassword from '../../../sections/auth/jwt/reset-password-view';

// ----------------------------------------------------------------------

export default function ResetPage() {
  return (
    <>
      <Helmet>
        <title> Jwt: Login</title>
      </Helmet>

      <JwtResetPassword />
    </>
  );
}
