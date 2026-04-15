import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SchemeNewEditForm from '../scheme-new-edit-form';

// ----------------------------------------------------------------------

export default function SchemeCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Create a new Scheme'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Scheme List',
            href: paths.dashboard.scheme.root,
          },
          { name: 'New Scheme' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <SchemeNewEditForm />
    </Container>
  );
}
