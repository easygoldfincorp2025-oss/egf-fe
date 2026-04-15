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
import ChargeInOutTableToolbar from '../charge-in-out-table-toolbar.jsx';
import ChargeInOutTableRow from '../charge-in-out-table-row.jsx';
import { Grid } from '@mui/material';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import Typography from '@mui/material/Typography';
import { isBetween } from '../../../../utils/format-time.js';
import { useGetChargeInOut } from '../../../../api/charge-in-out.js';
import ChargeInOutTableFiltersResult from '../charge-in-out-table-filters-result.jsx';
import ChargeListView from '../charge/view/charge-list-view.jsx';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
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
  { id: 'status', label: 'status' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  category: '',
  startDate: null,
  endDate: null,
  chargeType: {},
  transactions: '',
};

// ----------------------------------------------------------------------

export default function ChargeInOutListView() {
  const { ChargeInOut, ChargeInOutLoading, mutate } = useGetChargeInOut();
  const { enqueueSnackbar } = useSnackbar();
  const [chargeDetails, setChargeDetails] = useState({});
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { configs } = useGetConfigs();
  const { user } = useAuthContext();
  const [tableData, setTableData] = useState(ChargeInOut);
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setFilters({ ...defaultFilters, chargeType: chargeDetails });
  }, [chargeDetails]);

  const dataFiltered = applyFilter({
    inputData: ChargeInOut,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useEffect(() => {
    {
      dataFiltered.length > 0 && fetchStates();
    }
  }, [ChargeInOut]);

  const receivable = dataFiltered.reduce((prev, next) => {
    if (next.status === 'Payment In') {
      const cash = Number(next?.paymentDetail?.cashAmount || 0);
      const bank = Number(next?.paymentDetail?.bankAmount || 0);
      return prev + cash + bank;
    }
    return prev;
  }, 0);

  const payable = dataFiltered.reduce((prev, next) => {
    if (next.status === 'Payment Out') {
      const cash = Number(next?.paymentDetail?.cashAmount || 0);
      const bank = Number(next?.paymentDetail?.bankAmount || 0);
      return prev + cash + bank;
    }
    return prev;
  }, 0);

  const calculateChargeTypeTotals = (data) => {
    const totals = {};
    data.forEach((item) => {
      const chargeType = item.chargeType;
      if (!totals[chargeType]) {
        totals[chargeType] = 0;
      }
      if (item.status === 'Payment In') {
        totals[chargeType] +=
          Number(item?.paymentDetail?.cashAmount || 0) +
          Number(item?.paymentDetail?.bankAmount || 0);
      } else if (item.status === 'Payment Out') {
        totals[chargeType] -=
          Number(item?.paymentDetail?.cashAmount || 0) +
          Number(item?.paymentDetail?.bankAmount || 0);
      }
    });
    return Object.entries(totals).map(([chargeType, amount]) => ({
      chargeType,
      amount: Number(amount.toFixed(2)),
    }));
  };

  const chargeTypeTotals = calculateChargeTypeTotals(ChargeInOut);

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
    if (!getResponsibilityValue('delete_charge', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/charge/${id}`
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
      router.push(paths.dashboard.cashAndBank.chargeInOut.edit(id));
    },
    [router]
  );

  if (ChargeInOutLoading) {
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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              Charge In/Out :{' '}
              <strong style={{ marginLeft: 200 }}>
                Receivable : -
                <span style={{ color: 'green', marginLeft: 10 }}>
                  {Number(receivable).toFixed(2)}
                </span>
              </strong>
              <strong style={{ marginLeft: 20 }}>
                Payable : -
                <span style={{ color: 'red', marginLeft: 10 }}>
                  {Object.entries(filters).some(([key, val]) => {
                    if (val === null || val === '') return false;
                    if (typeof val === 'object') {
                      return val instanceof Date || Object.keys(val).length > 0;
                    }
                    return true;
                  })
                    ? payable.toFixed(2)
                    : Math.abs(payable).toFixed(2)}
                </span>
              </strong>
            </Typography>
          }
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
          action={
            <>
              {getResponsibilityValue('create_charge', configs, user) && (<Button
                component={RouterLink}
                href={paths.dashboard.cashAndBank.chargeInOut.new}
                variant='contained'
                startIcon={<Iconify icon='mingcute:add-line' />}
              >
                Add Charge in-out
              </Button>)}
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
                <ChargeListView
                  setChargeDetails={setChargeDetails}
                  chargeDetails={chargeDetails}
                  chargeTypeTotals={chargeTypeTotals}
                />
              </Card>
            </Grid>
            <Grid md={9}>
              <Card>
                <ChargeInOutTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  chargeDetails={chargeDetails}
                  options={options}
                  chargeData={dataFiltered}
                  chargeTypeTotals={chargeTypeTotals}
                />
                {canReset && (
                  <ChargeInOutTableFiltersResult
                    filters={filters}
                    onFilters={handleFilters}
                    onResetFilters={handleResetFilters}
                    results={dataFiltered.length}
                    setChargeDetails={setChargeDetails}
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
                          <ChargeInOutTableRow
                            key={row._id}
                            row={row}
                            selected={table.selected.includes(row._id)}
                            onSelectRow={() => table.onSelectRow(row._id)}
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
  const { name, chargeType, category, startDate, endDate, transactions } = filters;

  if (!inputData) return [];

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
        item?.chargeType?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.category?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.description?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.paymentDetail?.cashAmount === name ||
        item?.paymentDetail?.bankAmount?.includes(name)
    );
  }

  if (category) {
    inputData = inputData.filter((item) => item.status === category);
  }

  if (transactions) {
    inputData = inputData.filter((item) => item?.paymentDetail?.account?._id === transactions?._id);
    console.log(inputData,"0000");
  }

  if (Object.keys(chargeType).length > 0) {
    inputData = inputData.filter((item) => chargeType.chargeType === item.chargeType);
    console.log(inputData,"ghjuhg");
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  return inputData;
}
