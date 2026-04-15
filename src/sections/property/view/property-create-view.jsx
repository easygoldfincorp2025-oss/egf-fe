import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PropertyNewEditForm from '../property-new-edit-form';

// ----------------------------------------------------------------------

export default function PropertyCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Property"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Property List',
            href: paths.dashboard.property.root,
          },
          { name: 'New Property' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PropertyNewEditForm />
    </Container>
  );
}
