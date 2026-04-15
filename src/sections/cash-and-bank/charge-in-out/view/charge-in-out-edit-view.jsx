import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import ChargeInOutNewEditForm from '../charge-in-out-new-edit-form.jsx';
import { useParams } from '../../../../routes/hooks/index.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { Box } from '@mui/material';
import { useGetChargeInOut } from '../../../../api/charge-in-out.js';

// ----------------------------------------------------------------------

export default function ChargeInOutEditView() {
  const settings = useSettingsContext();
  const { ChargeInOut } = useGetChargeInOut();
  const { id } = useParams();

  const currentCharge = ChargeInOut.find((Charge) => Charge?._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Charge In/Out List',
            href: paths.dashboard.cashAndBank.chargeInOut.list,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentCharge ? (
        <ChargeInOutNewEditForm currentCharge={currentCharge} />
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

ChargeInOutEditView.propTypes = {
  id: PropTypes.string,
};
