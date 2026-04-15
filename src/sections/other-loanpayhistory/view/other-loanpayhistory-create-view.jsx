import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OtherLoanpayhistoryNew from '../other-loanpayhistory-new';
import { useParams } from 'react-router';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetOtherLoanissue } from '../../../api/other-loan-issue.js';

// ----------------------------------------------------------------------

export default function LoanpayhistoryCreateView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const { otherLoanissue, mutate } = useGetOtherLoanissue();

  const currentOtherLoan = otherLoanissue.find((item) => item._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Other Loan Pay History"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'other Loan Pay History List',
            href: paths.dashboard.other_loanPayHistory.root,
          },
          { name: 'Other Loan Pay History' },
        ]}
        sx={{
          mb: 2,
        }}
      />
      {currentOtherLoan ? (
        <OtherLoanpayhistoryNew currentOtherLoan={currentOtherLoan} mutate={mutate} />
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
