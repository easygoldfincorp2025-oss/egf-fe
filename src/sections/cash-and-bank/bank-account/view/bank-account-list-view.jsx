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
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
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
import BankAccountTableToolbar from '../bank-account-table-toolbar.jsx';
import BankAccountTableFiltersResult from '../bank-account-table-filters-result.jsx';
import BankAccountTableRow from '../bank-account-table-row.jsx';
import { Grid } from '@mui/material';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import Typography from '@mui/material/Typography';
import AccountsListView from '../accounts/view/accounts-list-view.jsx';
import { useGetBankTransactions } from '../../../../api/bank-transactions.js';
import { isBetween } from '../../../../utils/format-time.js';
import TransferDialog from './TransferDialog.jsx';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { getResponsibilityValue } from '../../../../permission/permission.js';
import { useGetConfigs } from '../../../../api/config.js';
import moment from 'moment/moment.js';


// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'bankName', label: 'Bank name' },
  { id: 'name', label: 'Detail' },
  { id: 'category', label: 'Category' },
  { id: 'date', label: 'Date' },
  { id: 'Amount', label: 'Amount' },
  { id: '', width: 88 },
];
const getCurrentMonthDates = () => {
  const now = moment();
  const startDate = now.clone().startOf('month').toDate();
  const endDate = now.clone().endOf('month').toDate();
  return { startDate, endDate };
};
const { startDate: defaultStartDate, endDate: defaultEndDate } = getCurrentMonthDates();

const defaultFilters = {
  name: '',
  category: '',
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  account: {},
  status: '',
};

// ----------------------------------------------------------------------

export default function BankAccountListView() {
  const { bankTransactions, mutate, bankTransactionsLoading } = useGetBankTransactions();
  const [accountDetails, setAccountDetails] = useState({});
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const { configs } = useGetConfigs();
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const [currentTransferId, setCurrentTransferId] = useState('');

  const dataFiltered = applyFilter({
    inputData: bankTransactions?.transactions,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useEffect(() => {
    setFilters({ ...defaultFilters, account: accountDetails });
  }, [accountDetails]);

  useEffect(() => {
    fetchStates();
  }, [dataFiltered]);

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

  const handleEditRow = useCallback(
    async (id) => {
      try {
        if (id) {
          setDialogOpen(true);
          setCurrentTransferId(id);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [user]
  );

  const handleDelete = async (id) => {
    if (!getResponsibilityValue('delete_transfer', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/transfer/${id}`
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Entry');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      handleDelete(id);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage?.length, enqueueSnackbar, table]
  );

  const handleTransferTypeSelect = (type) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  if (bankTransactionsLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    dataFiltered?.map((data) => {
      setOptions((item) => {
        if (!item.find((option) => option === data.status)) {
          return [...item, data.status];
        } else {
          return item;
        }
      });
    });
  }
  const excelData = bankTransactions.transactions.map((item, index) => ({
    Type:item.status,
    'Bank Name':item.bankName,
    Detail:item.detail,
    Category:item.category,
    Date:item.date,
    amount:item.amount,
  }));

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              Bank Account :{' '}
              <strong style={{ color: amount > 0 ? 'green' : 'red' }}>
                {Object.values(filters).some(Boolean)
                  ? Math.abs(amount).toFixed(2)
                  : amount.toFixed(2)}
              </strong>
            </Typography>
          }
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Bank Accounts', href: paths.dashboard.scheme.root },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 1 },
          }}
        />
        <TransferDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          transferType={selectedType}
          bankTransactionsMutate={mutate}
          currentTransferId={currentTransferId}
          setCurrentTransferId={setCurrentTransferId}
        />
        <Card sx={{ p: 2 }}>
          <Grid container>
            <Grid md={3}>
              <Card sx={{ height: '100%', p: 2, mr: 2 }}>
                <AccountsListView
                  accounts={bankTransactions.bankBalances}
                  setAccountDetails={setAccountDetails}
                  accountDetails={accountDetails}
                />
              </Card>
            </Grid>
            <Grid md={9}>
              <Card>
                <BankAccountTableToolbar
                  filters={filters}
                  excelData={excelData}
                  onFilters={handleFilters}
                  accountDetails={accountDetails}
                  options={options}
                  onTransferTypeSelect={handleTransferTypeSelect}
                  bankData={dataFiltered}
                />
                {canReset && (
                  <BankAccountTableFiltersResult
                    filters={filters}
                    onFilters={handleFilters}
                    onResetFilters={handleResetFilters}
                    results={dataFiltered.length}
                    setAcc={setAccountDetails}
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
                          <BankAccountTableRow
                            row={row}
                            onEditRow={() => handleEditRow(row._id)}
                            onDeleteRow={() => handleDeleteRow(row._id)}
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
  const { name, account, category, startDate, endDate, status } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis?.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (sch) =>
        sch?.ref?.toLowerCase().includes(name?.toLowerCase()) ||
        sch?.detail?.toLowerCase().includes(name?.toLowerCase()) ||
        (sch?.amount).toString()?.includes(name)
    );
  }

  if (category) {
    inputData = inputData.filter((item) => item.category === category);
  }

  if (status) {
    inputData = inputData.filter((item) => item.status === status);
  }

  if (Object.keys(account).length) {
    inputData = inputData?.filter((acc) =>
      account.bankName === acc.bankName &&
      account.accountHolderName === acc.bankHolderName
    );
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData?.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  return inputData;
}
