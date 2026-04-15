import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import ExpenceNewEditForm from '../expence-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function ExpenseCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Expense"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Expense List',
            href: paths.dashboard.cashAndBank.expense.list,
          },
          { name: 'New Expense' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ExpenceNewEditForm />
    </Container>
  );
}
