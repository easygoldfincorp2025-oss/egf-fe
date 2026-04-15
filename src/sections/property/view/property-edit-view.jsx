import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PropertyNewEditForm from '../property-new-edit-form';
import { useParams } from '../../../routes/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { Box } from '@mui/material';
import { useGetAllProperty } from '../../../api/property';

// ----------------------------------------------------------------------

export default function PropertyEditView() {
  const settings = useSettingsContext();
  const { property } = useGetAllProperty();
  const { id } = useParams();
  const currentProperty = property.find((carat) => carat._id === id);

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
            name: 'Property List',
            href: paths.dashboard.property.root,
          },
          { name: 'Edit Property' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentProperty ? <PropertyNewEditForm currentProperty={currentProperty} /> :
        <Box sx={{ height: '65vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingScreen />
        </Box>
      }
    </Container>
  );
}

PropertyEditView.propTypes = {
  id: PropTypes.string,
};
