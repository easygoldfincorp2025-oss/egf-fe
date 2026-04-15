import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PenaltyNewEditForm from '../penalty-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { Box } from '@mui/material';
import { useGetPenalty } from '../../../api/penalty';

// ----------------------------------------------------------------------

export default function PenaltyEditView() {
  const settings = useSettingsContext();
  const { penalty } = useGetPenalty();
  const { id } = useParams();
  const currentPenalty = penalty.find((penalty) => penalty._id === id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading='Edit'
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Penalty List',
            href: paths.dashboard.penalty.root,
          },
          { name: currentPenalty?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentPenalty ? <PenaltyNewEditForm currentPenalty={currentPenalty} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

PenaltyEditView.propTypes = {
  id: PropTypes.string,
};
