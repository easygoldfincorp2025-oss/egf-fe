import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import PaymentInOutNewEditForm from '../payment-in-out-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function PaymentInOutCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Payment"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Payment List',
            href: paths.dashboard.cashAndBank['payment-in-out'].list,
          },
          { name: 'New Payment' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PaymentInOutNewEditForm />
    </Container>
  );
}
