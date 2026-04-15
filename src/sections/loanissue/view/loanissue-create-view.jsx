import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import LoanissueNewEditForm from '../loanissue-new-edit-form';

// ----------------------------------------------------------------------

export default function LoanissueCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Create Loan Issue'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Loan issue',
            href: paths.dashboard.loanissue.root,
          },
          { name: 'New Loanissue' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <LoanissueNewEditForm />
    </Container>
  );
}
