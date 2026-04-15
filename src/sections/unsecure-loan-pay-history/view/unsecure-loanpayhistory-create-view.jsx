import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import UnsecureLoanpayhistoryNew from '../unsecure-loanpayhistory-new.jsx';
import { useParams } from 'react-router';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetUnsecureLoan } from '../../../api/unsecure-loanissue.js';

// ----------------------------------------------------------------------

export default function UnsecureLoanpayhistoryCreateView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const loanPayHistory = true;
  const { unSecureLoan, mutate } = useGetUnsecureLoan(loanPayHistory);
  const currentLoan = unSecureLoan.find((item) => item._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Unsecure Loan Pay History"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Unsecure Loan Pay History List',
            href: paths.dashboard.unsecureloanPayHistory.root,
          },
          { name: 'Unsecure Loan Pay History' },
        ]}
        sx={{
          mb: 2,
        }}
      />
      {currentLoan ? (
        <UnsecureLoanpayhistoryNew currentLoan={currentLoan} mutate={mutate} />
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
