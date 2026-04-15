import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
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
import AllTransactionToolbar from '../all-transaction-toolbar.jsx';
import AllTransactionTableFiltersResult from '../all-transaction-table-filters-result.jsx';
import AllTransactionTableRow from '../all-transaction-table-row.jsx';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { useGetCashTransactions } from '../../../../api/cash-transactions.js';
import { isBetween } from '../../../../utils/format-time.js';
import Typography from '@mui/material/Typography';
import { useGetBankTransactions } from '../../../../api/bank-transactions.js';
import moment from 'moment/moment.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'detail', label: 'Detail' },
  { id: 'category', label: 'Category' },
  { id: 'date', label: 'Date' },
  { id: 'paymentMode', label: 'payment mode' },
  { id: 'cashAmount', label: 'Cash amt' },
  { id: 'bankAmount', label: 'Bank amt' },
  { id: 'bankName', label: 'Bank' },
  { id: 'Amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
];

// Get first and last day of current month
const getCurrentMonthDates = () => {
  const now = moment();
  const startDate = now.clone().startOf('month').toDate();
  const endDate = now.clone().endOf('month').toDate();
  return { startDate, endDate };
};

const { startDate: defaultStartDate, endDate: defaultEndDate } = getCurrentMonthDates();

const defaultFilters = {
  name: '',
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  category: '',
  transactions: '',
  status: '',
};

// ----------------------------------------------------------------------

export default function AllTransactionListView() {
  const { cashTransactions, mutate, cashTransactionsLoading } = useGetCashTransactions();
  const { bankTransactions, bankTransactionsLoading } = useGetBankTransactions();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: [
          ...cashTransactions,
          ...(Array.isArray(bankTransactions?.transactions) ? bankTransactions.transactions : []),
        ],
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [cashTransactions, bankTransactions, table.order, table.orderBy, filters]
  );

  const receivable = dataFiltered.reduce((prev, next) => {
    if (next.category === 'Payment In') {
      const cash = Number(next?.paymentDetail?.cashAmount || 0);
      const bank = Number(next?.paymentDetail?.bankAmount || 0);
      return prev + cash + bank;
    }
    return prev;
  }, 0);

  const payable = dataFiltered.reduce((prev, next) => {
    if (next.category === 'Payment Out') {
      const cash = Number(next?.paymentDetail?.cashAmount || 0);
      const bank = Number(next?.paymentDetail?.bankAmount || 0);
      return prev + cash + bank;
    }
    return prev;
  }, 0);


  useEffect(() => {
    {
      dataFiltered.length > 0 && fetchStates();
      fetchType();
    }
  }, [dataFiltered]);

  const amount =
    dataFiltered
      .filter((e) => e.category === 'Payment In')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0) -
    dataFiltered
      .filter((e) => e.category === 'Payment Out')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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

  if (cashTransactionsLoading) {
    return <LoadingScreen />;
  }

  function fetchType() {
    const uniqueTypes = new Set();
    dataFiltered?.forEach((data) => {
      if (data.status) {
        uniqueTypes.add(data.status);
      }
    });
    setTypeOptions(Array.from(uniqueTypes));
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
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              All Transaction :{' '}
              <strong style={{ marginLeft: 200 }}>
                Receivable : -
                <span
                  style={{
                    color: 'green',
                    marginLeft: 10,
                  }}
                >
                  {receivable.toFixed(2)}
                </span>
              </strong>
              <strong style={{ marginLeft: 20 }}>
                Payable : -
                <span style={{ color: 'red', marginLeft: 10 }}>{payable.toFixed(2)}</span>
              </strong>
            </Typography>
          }
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: `All Transaction` },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 1 },
          }}
        />
        <Card>
          <AllTransactionToolbar
            filters={filters}
            onFilters={handleFilters}
            options={options}
            typeOptions={typeOptions}
            daybookData={dataFiltered}
          />
          {canReset && (
            <AllTransactionTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
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
                    <AllTransactionTableRow
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
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
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, startDate, endDate, category, status, transactions } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (item) =>
        item.detail.toLowerCase().includes(name.toLowerCase()) ||
        item.ref.toLowerCase().includes(name.toLowerCase()) ||
        (item?.amount).toString()?.includes(name)
    );
  }

  if (category) {
    inputData = inputData.filter((item) => item.category === category);
  }

  if (transactions) {
    inputData = inputData.filter((item) => item?.paymentDetail?.account?._id === transactions?._id);
  }

  if (status) {
    inputData = inputData.filter((item) => item.status === status);
    console.log(inputData,"00000000");
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
    console.log(inputData,"00000000");
  }

  return inputData;
}
