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
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,  useTable,
} from 'src/components/table';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { isBetween } from '../../../utils/format-time';
import { useGetConfigs } from '../../../api/config';
import { useGetOtherLoanReports } from '../../../api/all-branch-other-loan-report.js';
import OtherLoanCloseSummaryTableToolbar from '../other-loan-close-reports/other-loan-close-summary-table-toolbar.jsx';
import OtherLoanCloseSummaryTableFiltersResult from '../other-loan-close-reports/other-loan-close-summary-table-filters-result.jsx';
import OtherLoanCloseSummaryTableRow from '../other-loan-close-reports/other-loan-close-summary-table-row.jsx';
import { TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#' },
  { id: 'code', label: 'Code' },
  { id: 'LoanNo', label: 'Loan no.' },
  { id: 'firstName', label: 'Customer name' },
  { id: 'otherName', label: 'Other name' },
  { id: 'otherNumber', label: 'Other no.' },
  { id: 'percentage', label: 'int rate (%)' },
  { id: 'fund', label: 'Fund' },
  { id: 'date', label: 'Open date' },
  { id: 'otherLoanAmount', label: 'Other loan amt' },
  { id: 'totalInterestAmt.', label: 'Total int.' },
  { id: 'day', label: ' Day' },
  { id: 'closingAmount', label: 'closeAmt' },
  { id: 'pendingAmt', label: 'Pending amt' },
  { id: 'closeDate', label: 'Close date' },
  { id: 'otherCharge', label: 'Other charge' },
  { id: 'intcharge', label: 'Int. charge' },
  { id: 'closingCharge', label: 'Closing charge' },
  { id: 'totalCloseamt', label: 'Total close amt' },
  { id: 'status', label: 'Status' },
];

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  startCloseDate: null,
  endCloseDate: null,
  branch: '',
  otherName: '',
};

// ----------------------------------------------------------------------

export default function OtherLoanCloseSummaryListView() {
  const [options, setOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { otherLoanReports, otherLoanReportsLoading } = useGetOtherLoanReports(false, true);
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(otherLoanReports);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: otherLoanReports,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const percentage = dataFiltered.reduce((prev, next) => prev + (Number(next?.percentage) || 0), 0);
  const rate = dataFiltered.reduce((prev, next) => prev + (Number(next?.rate) || 0), 0);
  const otherLoanAmount = dataFiltered.reduce((prev, next) => prev + (Number(next?.otherLoanAmount) || 0), 0);
  const totalInterestAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.totalInterestAmt) || 0),
    0
  );

  const pendingInterest = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.pendingInterest) || 0),
    0
  );

  const day = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.day > 0 ? next.day : 0) || 0),
    0
  );

  const closeAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.closingAmount) || 0),
    0
  );

  const closingCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.closingCharge) || 0),
    0
  );

  const totalCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.totalCharge) || 0),
    0
  );  const otherCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.otherCharge) || 0),
    0
  );

  const total = {
    percentage,
    rate,
    otherLoanAmount,
    totalInterestAmt,
    pendingInterest,
    day,
    closeAmt,
    closingCharge,
    totalCharge,
    otherCharge
  };

  useEffect(() => {
    fetchStates();
  }, [dataFiltered]);

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

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/${user?.company}/loans`, {
        data: { ids: id },
      });
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Employee');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      if (id) {
        handleDelete([id]);
        table.onUpdatePageDeleteRow(dataInPage.length);
      }
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = otherLoanReports.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    handleDelete(deleteIds);
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.loanissue.edit(id));
    },
    [router]
  );

  const handleClick = useCallback(
    (id) => {
      router.push(paths.dashboard.disburse.new(id));
    },
    [router]
  );

  if (otherLoanReportsLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    dataFiltered?.map((data) => {
      setOptions((item) => {
        if (!item.find((option) => option === data.otherName)) {
          return [...item, data.otherName];
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
          heading="Other Loan Close Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            {
              name: 'Other Loan Close Reports',
              href: paths.dashboard.reports['other-loan-all-branch-reports'],
            },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <OtherLoanCloseSummaryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            options={options}
            total={total}
          />
          {canReset && (
            <OtherLoanCloseSummaryTableFiltersResult
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
              ' .css-131g1ae-MuiTableCell-root': {
                padding: '6px',
              },
              ' .css-1613c04-MuiTableCell-root': {
                padding: '8px',
              },
              ' .css-1ms7e38-MuiTableCell-root': {
                padding: '6px',
              },
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
            <Table size={table.dense ? 'small' : 'medium'}>
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
                  zIndex: 1,
                  backgroundColor: '#2f3944',
                }}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <OtherLoanCloseSummaryTableRow
                      key={row._id}
                      row={row}
                      index={index}
                      handleClick={() => handleClick(row._id)}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                    />
                  ))}
                <TableNoData notFound={notFound} />
                <TableRow
                  sx={{
                    backgroundColor: '#F4F6F8',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1000,
                    boxShadow: '0px 2px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(percentage / dataFiltered.length).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {rate.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {otherLoanAmount.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(totalInterestAmt - totalCharge).toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(day / dataFiltered.length).toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {closeAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {pendingInterest.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {otherCharge.toFixed(0)}
                  </TableCell>{' '} <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {totalCharge.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {closingCharge.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(totalInterestAmt + closeAmt + closingCharge).toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                </TableRow>
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
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
              handleDeleteRows();
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
  const { username, status, startDate, endDate, branch, otherName, startCloseDate, endCloseDate } =
    filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (username && username.trim()) {
    inputData = inputData.filter(
      (item) =>
        (
          item.loan.customer.firstName +
          ' ' +
          item.loan.customer.middleName +
          ' ' +
          item.loan.customer.lastName
        )
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item?.loan?.customer?.firstName?.toLowerCase()?.includes(username.toLowerCase()) ||
        item?.loan?.customer?.lastName?.toLowerCase()?.includes(username.toLowerCase()) ||
        item?.loan?.loanNo?.toLowerCase()?.includes(username.toLowerCase()) ||
        item?.loan?.customer?.contact?.toLowerCase()?.includes(username.toLowerCase()) ||
        item?.amount === Number(username) ||
        item?.closingAmount === Number(username) ||
        item?.code.toLowerCase().includes(username.toLowerCase()) ||
        item?.otherNumber?.toLowerCase()?.includes(username.toLowerCase())
    );
  }

  if (status && status !== 'All') {
    inputData = inputData.filter((item) => item.status === status);
  }

  if (branch) {
    inputData = inputData.filter((loan) => loan.loan.customer.branch._id === branch._id);
  }

  if (otherName) {
    inputData = inputData.filter((item) => item?.otherName === otherName);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  if (!dateError && startCloseDate && endCloseDate) {
    inputData = inputData.filter((loan) =>
      isBetween(new Date(loan.closeDate), startCloseDate, endCloseDate)
    );
  }

  return inputData;
}
