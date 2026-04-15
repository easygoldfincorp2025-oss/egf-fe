import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SecureLoanpayhistoryNew from '../secure-loanpayhistory-new.jsx';
import { useParams } from 'react-router';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetSecureLoan } from '../../../api/secure-loanissue.js';

// ----------------------------------------------------------------------

export default function SecureLoanpayhistoryCreateView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const loanPayHistory = true;
  const { secureLoan, mutate } = useGetSecureLoan(loanPayHistory);
  const currentLoan = secureLoan.find((item) => item._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Secure Loan Pay History"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Secure Loan Pay History List',
            href: paths.dashboard.secureloanPayHistory.root,
          },
          { name: 'Secure Loan Pay History' },
        ]}
        sx={{
          mb: 2,
        }}
      />
      {currentLoan ? (
        <SecureLoanpayhistoryNew currentLoan={currentLoan} mutate={mutate} />
      ) : (
        <Box
          sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <LoadingScreen />
        </Box>
      )}
    </Container>
  );
}
