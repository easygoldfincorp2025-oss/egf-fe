import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OtherLoanpayhistoryNew from '../other-loanpayhistory-new';
import { useParams } from '../../../routes/hooks';
import { useGetEmployee } from '../../../api/employee';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

export default function OtherLoanpayhistoryEditView() {
  const settings = useSettingsContext();
  const { employee } = useGetEmployee();
  const { id } = useParams();
  const currentEmployee = employee.find((emp) => emp._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='other Loan Pay History'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Other Loan Pay History List',
            href: paths.dashboard.other_loanPayHistory.root,
          },
          { name: 'other Loan Pay History' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentEmployee ? <OtherLoanpayhistoryNew currentEmployee={currentEmployee} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

OtherLoanpayhistoryEditView.propTypes = {
  id: PropTypes.string,
};
