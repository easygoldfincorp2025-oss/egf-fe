import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import LoanpayhistoryNew from '../loanpayhistory-new';
import { useParams } from 'react-router';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetLoanissue } from '../../../api/loanissue';

// ----------------------------------------------------------------------

export default function LoanpayhistoryCreateView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const loanPayHistory = true;
  const { Loanissue, mutate } = useGetLoanissue(loanPayHistory);
  const currentLoan = Loanissue.find((item) => item._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Loan Pay History'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Loan Pay History List',
            href: paths.dashboard.loanPayHistory.root,
          },
          { name: 'Loan Pay History' },
        ]}
        sx={{
          mb: 2,
        }}
      />
      {currentLoan ? <LoanpayhistoryNew currentLoan={currentLoan} mutate={mutate} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}
