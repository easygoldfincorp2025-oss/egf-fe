import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useRouter } from 'src/routes/hooks/index.js';
import { RouterLink } from 'src/routes/components/index.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table/index.js';
import ExpenceTableToolbar from '../expence-table-toolbar.jsx';
import ExpenseTableRow from '../expence-table-row.jsx';
import { Grid } from '@mui/material';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import Typography from '@mui/material/Typography';
import { isBetween } from '../../../../utils/format-time.js';
import ExpenceTableFiltersResult from '../expence-table-filters-result.jsx';
import ExpenceTypeListView from '../other/view/expence-type-list-view.jsx';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetExpanse } from '../../../../api/expense.js';
import { getResponsibilityValue } from '../../../../permission/permission.js';
import { useGetConfigs } from '../../../../api/config.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'category', label: 'Category' },
  { id: 'date', label: 'Date' },
  { id: 'paymentMode', label: 'Payment mode' },
  { id: 'Cash amt', label: 'Cash amt' },
  { id: 'Bank amt', label: 'Bank amt' },
  { id: 'Bank', label: 'Bank' },
  { id: 'des', label: 'Des' },
  { id: 'invoice', label: 'Invoice' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  category: '',
  startDate: null,
  endDate: null,
  expenseType: {},
  transactions: '',
};

// ----------------------------------------------------------------------

export default function ExpenceListView() {
  const { expense, expenseLoading, mutate } = useGetExpanse();
  const { enqueueSnackbar } = useSnackbar();
  const [expenceDetails, setExpenceDetails] = useState({});
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [tableData, setTableData] = useState(expense);
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const dataFiltered = applyFilter({
    inputData: expense,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useEffect(() => {
    {
      dataFiltered.length > 0 && fetchStates();
      fetchCategoryStates();
    }
  }, [expense]);

  const cash = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail?.cashAmount) || 0),
    0
  );

  const bank = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail?.bankAmount) || 0),
    0
  );

  const calculateExpenceTypeTotals = (data) => {
    const totals = {};
    data.forEach((item) => {
      const expenseType = item.expenseType;
      if (!totals[expenseType]) {
        totals[expenseType] = 0;
      }
      if (item.expenseType) {
        totals[expenseType] +=
          Number(item?.paymentDetail?.cashAmount || 0) +
          Number(item?.paymentDetail?.bankAmount || 0);
      }
    });
    return Object.entries(totals).map(([expenseType, amount]) => ({
      expenseType,
      amount: Number(amount.toFixed(2)),
    }));
  };

  const expenceTypeTotals = calculateExpenceTypeTotals(expense);

  useEffect(() => {
    setFilters({ ...defaultFilters, expenseType: expenceDetails });
  }, [expenceDetails]);

  const amount =
    dataFiltered
      ?.filter((e) => e.category === 'Payment In')
      ?.reduce((prev, next) => prev + (Number(next?.amount) || 0), 0) -
    dataFiltered
      ?.filter((e) => e.category === 'Payment Out')
      ?.reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  const dataInPage = dataFiltered?.slice(
    table.page * table?.rowsPerPage,
    table.page * table?.rowsPerPage + table?.rowsPerPage
  );

  const denseHeight = table?.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDelete = async (id) => {
    if (getResponsibilityValue('delete_expenses', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/expense/${id}`
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Expense');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      handleDelete([id]);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.cashAndBank.expense.edit(id));
    },
    [router]
  );

  if (expenseLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    const accountMap = new Map();
    accountMap.set('cash', { transactionsType: 'Cash' });
    dataFiltered?.forEach((data) => {
      const account = data?.paymentDetail?.account;
      if (account && account._id && !accountMap.has(account._id)) {
        accountMap.set(account._id, account);
      }
    });

    const newOptions = Array.from(accountMap.values());
    setOptions((prevOptions) => {
      const isSame =
        prevOptions.length === newOptions.length &&
        prevOptions.every((item) => newOptions.some((opt) => opt._id === item._id));

      return isSame ? prevOptions : newOptions;
    });
    setOptions(newOptions);
  }

  function fetchCategoryStates() {
    dataFiltered?.map((data) => {
      setCategoryOptions((item) => {
        if (!item.find((option) => option === data.category)) {
          return [...item, data.category];
        } else {
          return item;
        }
      });
    });
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              Expence :{' '}
              <strong style={{ marginLeft: 400 }}>
                Total Expence : -
                <span style={{ color: 'red', marginLeft: 10 }}>
                  {(Number(cash) + Number(bank)).toFixed(2)}
                </span>
              </strong>
            </Typography>
          }
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            <>
              {getResponsibilityValue('create_expenses', configs, user) && <Button
              component={RouterLink}
              href={paths.dashboard.cashAndBank.expense.new}
              variant='contained'
              startIcon={<Iconify icon='mingcute:add-line' />}
            >
              Add Expense
              </Button>}
            </>
          }
          sx={{
            mb: { xs: 3, md: 1 },
          }}
        />
        <Card sx={{ p: 2 }}>
          <Grid container>
            <Grid md={3}>
              <Card sx={{ height: '100%', p: 2, mr: 2 }}>
                <ExpenceTypeListView
                  setExpenceDetails={setExpenceDetails}
                  expenceDetails={expenceDetails}
                  expenceTypeTotals={expenceTypeTotals}
                />
              </Card>
            </Grid>
            <Grid md={9}>
              <Card>
                <ExpenceTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  expenceDetails={expenceDetails}
                  options={options}
                  categoryOptions={categoryOptions}
                  expenceData={dataFiltered}
                />
                {canReset && (
                  <ExpenceTableFiltersResult
                    filters={filters}
                    onFilters={handleFilters}
                    onResetFilters={handleResetFilters}
                    results={dataFiltered.length}
                    setExpenceDetails={setExpenceDetails}
                    sx={{ p: 2.5, pt: 0 }}
                  />
                )}
                <TableContainer
                  sx={{
                    maxHeight: 500,
                    overflow: 'auto',
                    position: 'relative',
                  }}
                >
                  <TableSelectedAction
                    dense={table.dense}
                    numSelected={table.selected.length}
                    rowCount={dataFiltered.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        dataFiltered.map((row) => row._id)
                      )
                    }
                    action={
                      <Tooltip title="Delete">
                        <IconButton color="primary" onClick={confirm.onTrue}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: '#2f3944',
                      }}
                    />
                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <ExpenseTableRow
                            key={row._id}
                            row={row}
                            selected={table.selected.includes(row._id)}
                            onSelectRow={() => table.onSelectRow(row._id)}
                            onDeleteRow={() => handleDeleteRow(row._id)}
                            onEditRow={() => handleEditRow(row._id)}
                          />
                        ))}
                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      />
                      <TableNoData notFound={notFound} />
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePaginationCustom
                  count={dataFiltered.length}
                  page={table.page}
                  rowsPerPage={table.rowsPerPage}
                  onPageChange={table.onChangePage}
                  onRowsPerPageChange={table.onChangeRowsPerPage}
                  dense={table.dense}
                  onChangeDense={table.onChangeDense}
                />
              </Card>
            </Grid>
          </Grid>
        </Card>
      </Container>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, expenseType, category, startDate, endDate, transactions } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis?.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (item) =>
        item?.expenseType?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.category?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.description?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.paymentDetail?.cashAmount?.includes(name) ||
        item?.paymentDetail?.bankAmount?.includes(name)
    );
  }

  if (transactions) {
    inputData = inputData.filter((item) => item?.paymentDetail?.account?._id === transactions?._id);
  }

  if (category) {
    inputData = inputData.filter((item) => item?.category === category);
  }

  if (Object.keys(expenseType).length > 0) {
    inputData = inputData.filter((item) => expenseType.expenseType === item.expenseType);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  return inputData;
}
