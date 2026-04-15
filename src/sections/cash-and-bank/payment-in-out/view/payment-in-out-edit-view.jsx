import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import PaymentInOutNewEditForm from '../payment-in-out-new-edit-form.jsx';
import { useParams } from '../../../../routes/hooks/index.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { Box } from '@mui/material';
import { useGetPayment } from '../../../../api/payment-in-out.js';

// ----------------------------------------------------------------------

export default function PaymentInOutEditView() {
  const settings = useSettingsContext();
  const { payment } = useGetPayment();
  const { id } = useParams();

  const currentPayment = payment.find((payment) => payment._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Payment List',
            href: paths.dashboard.cashAndBank['payment-in-out'].list,
          },
          { name: currentPayment?.receiptNo },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentPayment ? (
        <PaymentInOutNewEditForm currentPayment={currentPayment} />
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

PaymentInOutEditView.propTypes = {
  id: PropTypes.string,
};
