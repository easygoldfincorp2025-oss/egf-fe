import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PenaltyNewEditForm from '../penalty-new-edit-form';

// ----------------------------------------------------------------------

export default function PenaltyCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Penalty"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Penalty List',
            href: paths.dashboard.penalty.root,
          },
          { name: 'New Penalty' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <PenaltyNewEditForm />
    </Container>
  );
}
