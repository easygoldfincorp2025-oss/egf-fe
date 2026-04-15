import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OtherLoanissueNewEditForm from '../other-loanissue-new-edit-form';

// ----------------------------------------------------------------------

export default function OtherLoanissueCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create Other Loan Issue"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Other Loan issue',
            href: paths.dashboard.other_loanissue.root,
          },
          { name: 'New Other Loanissue' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <OtherLoanissueNewEditForm />
    </Container>
  );
}
