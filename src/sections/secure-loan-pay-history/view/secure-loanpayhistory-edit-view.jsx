import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SecureLoanpayhistoryNew from '../secure-loanpayhistory-new.jsx';
import { useParams } from '../../../routes/hooks';
import { useGetEmployee } from '../../../api/employee';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

export default function SecureLoanpayhistoryEditView() {
  const settings = useSettingsContext();
  const { employee } = useGetEmployee();
  const { id } = useParams();
  const currentEmployee = employee.find((emp) => emp._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Secure Loan Pay History'
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
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentEmployee ? <SecureLoanpayhistoryNew currentEmployee={currentEmployee} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

SecureLoanpayhistoryEditView.propTypes = {
  id: PropTypes.string,
};
