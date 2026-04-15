import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import DisburseNewEditForm from '../disburse-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { Box } from '@mui/material';
import { useGetLoanissue } from '../../../api/loanissue';

// ----------------------------------------------------------------------

export default function DisburseCreateView() {
  const settings = useSettingsContext();
  const { Loanissue } = useGetLoanissue();
  const { id } = useParams();
  const currentDisburse = Loanissue.find((loanissue) => loanissue._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Create New Disburse'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Disburse',
            href: paths.dashboard.disburse.root,
          },
          { name: 'New Disburse' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentDisburse ? <DisburseNewEditForm currentDisburse={currentDisburse} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

DisburseCreateView.propTypes = {
  id: PropTypes.string,
};
