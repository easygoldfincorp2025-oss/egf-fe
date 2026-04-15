import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OtherLoanissueNewEditForm from '../other-loanissue-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetOtherLoanissue } from '../../../api/other-loan-issue.js';

// ----------------------------------------------------------------------

export default function OtherLoanissueEditView() {
  const settings = useSettingsContext();
  const { otherLoanissue } = useGetOtherLoanissue();
  const { id } = useParams();
  const currentOtherLoanIssue = otherLoanissue?.find((loan) => loan?._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Other Loanissue"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Other Loan issue',
            href: paths.dashboard.other_loanissue.root,
          },
          { name: 'Edit Loanissue' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentOtherLoanIssue ? (
        <OtherLoanissueNewEditForm currentOtherLoanIssue={currentOtherLoanIssue} />
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

OtherLoanissueEditView.propTypes = {
  id: PropTypes.string,
};
