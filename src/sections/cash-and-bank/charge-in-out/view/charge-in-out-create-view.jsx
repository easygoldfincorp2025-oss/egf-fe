import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import ChargeInOutNewEditForm from '../charge-in-out-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function ChargeInOutCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Create a new Charge In/Out'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Charge In/Out List',
            href: paths.dashboard.cashAndBank.chargeInOut.list,
          },
          { name: 'New Charge' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ChargeInOutNewEditForm />
    </Container>
  );
}
