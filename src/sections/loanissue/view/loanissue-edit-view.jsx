import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import LoanissueNewEditForm from '../loanissue-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { Box } from '@mui/material';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetLoanissue } from '../../../api/loanissue';

// ----------------------------------------------------------------------

export default function LoanissueEditView() {
  const settings = useSettingsContext();
  const { Loanissue } = useGetLoanissue();
  const { id } = useParams();
  const currentLoanIssue = Loanissue?.find((loan) => loan?._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit Loanissue'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Loan issue',
            href: paths.dashboard.loanissue.root,
          },
          { name: 'Edit Loanissue' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentLoanIssue ? <LoanissueNewEditForm currentLoanIssue={currentLoanIssue} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

LoanissueEditView.propTypes = {
  id: PropTypes.string,
};
