import { Helmet } from 'react-helmet-async';
import JwtForgotPassword from '../../../sections/auth/jwt/forgot-password-view';


// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> EGF: Login</title>
      </Helmet>

      <JwtForgotPassword />
    </>
  );
}
