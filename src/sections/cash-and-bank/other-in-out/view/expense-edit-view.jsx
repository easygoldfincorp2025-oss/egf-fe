import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import { useParams } from '../../../../routes/hooks/index.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { Box } from '@mui/material';
import { useGetExpanse } from '../../../../api/expense.js';
import ExpenceNewEditForm from '../expence-new-edit-form.jsx';

// ----------------------------------------------------------------------

export default function ExpenseEditView() {
  const { expense } = useGetExpanse();
  const settings = useSettingsContext();
  const { id } = useParams();

  const currentExpense = expense.find((expense) => expense._id === id);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Expense List',
            href: paths.dashboard.cashAndBank.expense.list,
          },
          { name: currentExpense?.expenseType },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentExpense ? (
        <ExpenceNewEditForm currentExpense={currentExpense} />
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

ExpenseEditView.propTypes = {
  id: PropTypes.string,
};
