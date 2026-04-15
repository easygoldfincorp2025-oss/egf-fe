import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import LoanpayhistoryNew from '../loanpayhistory-new';
import { useParams } from '../../../routes/hooks';
import { useGetEmployee } from '../../../api/employee';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';

// ----------------------------------------------------------------------

export default function LoanpayhistoryEditView() {
  const settings = useSettingsContext();
  const { employee } = useGetEmployee();
  const { id } = useParams();
  const currentEmployee = employee.find((emp) => emp._id === id);

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
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentEmployee ? <LoanpayhistoryNew currentEmployee={currentEmployee} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

LoanpayhistoryEditView.propTypes = {
  id: PropTypes.string,
};
