import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CaratNewEditForm from '../carat-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { Box } from '@mui/material';
import { useGetCarat } from '../../../api/carat';

// ----------------------------------------------------------------------

export default function CaratEditView() {
  const settings = useSettingsContext();
  const { carat } = useGetCarat();
  const { id } = useParams();

  const currentCarat = carat.find((carat) => carat._id === id);
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
            name: 'Carat List',
            href: paths.dashboard.carat.root,
          },
          { name: currentCarat?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentCarat ? <CaratNewEditForm currentCarat={currentCarat} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

CaratEditView.propTypes = {
  id: PropTypes.string,
};
