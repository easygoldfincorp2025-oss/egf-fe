import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import InquiryNewEditForm from '../inquiry-new-edit-form';

// ----------------------------------------------------------------------

export default function InquiryCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='New Inquiry'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Inquiry List',
            href: paths.dashboard.inquiry.root,
          },
          { name: 'New Inquiry' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <InquiryNewEditForm />
    </Container>
  );
}
