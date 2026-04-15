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
import PaymentInOutTableToolbar from '../payment-in-out-table-toolbar.jsx';
import PaymentInOutTableRow from '../payment-in-out-table-row.jsx';
import { Grid } from '@mui/material';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import Typography from '@mui/material/Typography';
import { isBetween } from '../../../../utils/format-time.js';
import PartiesListView from '../parties/view/parties-list-view.jsx';
import { usePopover } from '../../../../components/custom-popover/index.js';
import PartyNewEditForm from '../parties/party-new-edit-form.jsx';
import { useGetPayment } from '../../../../api/payment-in-out.js';
import axiosInstance from 'src/utils/axios.js';
import { useAuthContext } from 'src/auth/hooks';
import PaymentInOutTableFiltersResult from '../payment-in-out-table-filters-result.jsx';
import { useGetParty } from '../../../../api/party.js';
import { useGetConfigs } from '../../../../api/config.js';
import { getResponsibilityValue } from '../../../../permission/permission.js';
import { RouterLink } from '../../../../routes/components/index.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '' },
  { id: 'party', label: 'party' },
  { id: 'receiptNo', label: 'Receipt no' },
  { id: 'date', label: 'Date' },
  { id: 'paymentMode', label: 'Payment mode' },
  { id: 'cashAmount', label: 'Cash amt' },
  { id: 'bankAmount', label: 'Bank amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'des', label: 'Des' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'status', label: 'satus' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  category: '',
  startDate: null,
  endDate: null,
  transactions: '',
  party: {},
};

// ----------------------------------------------------------------------

export default function PaymentInOutListView() {
  const { enqueueSnackbar } = useSnackbar();
  const [partyDetails, setPartyDetails] = useState({});
  const { payment, mutate, paymentLoading } = useGetPayment();
  const { party, mutate: mutateParty, partyLoading } = useGetParty();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const partyPopover = usePopover();
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setFilters({ ...defaultFilters, party: partyDetails });
  }, [partyDetails]);

  const dataFiltered = applyFilter({
    inputData: payment,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useEffect(() => {
    {
      dataFiltered.length > 0 && fetchStates();
    }
  }, [payment]);

  const receivableAmt = party.reduce(
    (prev, next) => prev + (Number(next.amount <= 0 && next?.amount) || 0),
    0
  );

  const payableAmt = party.reduce(
    (prev, next) => prev + (Number(next.amount >= 0 && next?.amount) || 0),
    0
  );

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
    (id) => {
      router.push(paths.dashboard.cashAndBank['payment-in-out'].edit(id));
    },
    [router]
  );

  const handleDelete = async (id) => {
    if (!getResponsibilityValue('delete_payment_in_out', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axiosInstance.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/payment/${id}`
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
      mutateParty();
    } catch (err) {
      enqueueSnackbar('Failed to delete Payment');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      handleDelete(id);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = dataFiltered.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    deleteIds.forEach((id) => handleDelete(id));
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered, dataInPage.length, table]);

  if (paymentLoading) {
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
              Payment In/Out :{' '}
              <strong style={{ marginLeft: 200 }}>
                Receivable : -
                <span
                  style={{
                    color: 'green',
                    marginLeft: 10,
                  }}
                >
                  {Object.entries(filters).some(([key, val]) => {
                    if (val === null || val === '') return false;
                    if (typeof val === 'object') {
                      return val instanceof Date || Object.keys(val).length > 0;
                    }
                    return true;
                  })
                    ? receivable.toFixed(2)
                    : Math.abs(receivableAmt).toFixed(2)}
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
                    : Math.abs(payableAmt).toFixed(2)}
                </span>
              </strong>
            </Typography>
          }
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Payment in/out' },
            { name: 'List' },
          ]}
          action={
            <>
              {getResponsibilityValue('create_party', configs, user) && (
                <Button
                  variant='contained'
                  startIcon={<Iconify icon='mingcute:add-line' />}
                  onClick={() => setOpen(true)}
                  sx={{mx:1}}
                >
                  Add Party
                </Button>
              )}
              {getResponsibilityValue('create_payment_in_out', configs, user) && (
                <Button
                  component={RouterLink}
                  href={paths.dashboard.cashAndBank['payment-in-out'].new}
                  variant='contained'
                  startIcon={<Iconify icon='mingcute:add-line' />}
                >
                  Add Payment
                </Button>
              )}
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
                <PartiesListView
                  setPartyDetails={setPartyDetails}
                  partyDetails={partyDetails}
                  party={party}
                  mutateParty={mutateParty}
                  partyLoading={partyLoading}
                />
              </Card>
            </Grid>
            <Grid md={9}>
              <PartyNewEditForm open={open} setOpen={setOpen} mutate={mutateParty} />
              <Card>
                <PaymentInOutTableToolbar
                  filters={filters}
                  onFilters={handleFilters}
                  partyDetails={partyDetails}
                  mutate={mutate}
                  options={options}
                  paymentData={dataFiltered}
                  party={party}
                />
                {canReset && (
                  <PaymentInOutTableFiltersResult
                    filters={filters}
                    onFilters={handleFilters}
                    onResetFilters={handleResetFilters}
                    results={dataFiltered.length}
                    setPartyDetails={setPartyDetails}
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
                          <PaymentInOutTableRow
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
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, party, category, startDate, endDate, transactions } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis?.map((el) => el[0]);

  if (name && name?.trim()) {
    inputData = inputData.filter(
      (item) =>
        item?.party?.name?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.receiptNo?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.description?.toLowerCase().includes(name?.toLowerCase()) ||
        item?.paymentDetail?.cashAmount?.includes(name) ||
        item?.paymentDetail?.bankAmount?.includes(name)

    );
  }

  if (category) {
    inputData = inputData.filter((item) => item.status === category);
  }

  if (transactions) {
    inputData = inputData.filter((item) => item?.paymentDetail?.account?._id === transactions?._id);
  }

  if (Object.keys(party).length) {
    inputData = inputData?.filter((item) => party?._id === item?.party?._id);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  return inputData;
}
