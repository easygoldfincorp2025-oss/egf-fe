import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CustomerNewEditForm from '../customer-new-edit-form';
import { useGetCustomer } from '../../../api/customer';
import { useParams } from '../../../routes/hooks';

// ----------------------------------------------------------------------

export default function CustomerEditView() {
  const { customer } = useGetCustomer();
  const settings = useSettingsContext();
  const { id } = useParams();
  const currentCustomer = customer?.find((user) => user?._id === id);

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
            name: 'Customer List',
            href: paths.dashboard.customer.root,
          },
          { name: currentCustomer?.firstName },
        ]}
        sx={{
          mb: { xs: 3, md: 3 },
        }}
      />
      <CustomerNewEditForm currentCustomer={currentCustomer} />
    </Container>
  );
}

CustomerEditView.propTypes = {
  id: PropTypes.string,
};
