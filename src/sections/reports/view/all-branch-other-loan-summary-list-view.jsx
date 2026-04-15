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
  TableSelectedAction,
  useTable,
} from 'src/components/table';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { isBetween } from '../../../utils/format-time';
import { useGetConfigs } from '../../../api/config';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label';
import { useGetOtherLoanReports } from '../../../api/all-branch-other-loan-report.js';
import AllBranchOtherLoanSummaryTableToolbar from '../all-branch-other-loan/all-branch-other-loan-summary-table-toolbar.jsx';
import AllBranchOtherLoanSummaryTableFiltersResult from '../all-branch-other-loan/all-branch-other-loan-summary-table-filters-result.jsx';
import AllBranchOtherLoanSummaryTableRow from '../all-branch-other-loan/all-branch-other-loan-summary-table-row.jsx';
import { TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#' },
  { id: 'Code', label: 'Code' },
  { id: 'LoanNo', label: 'Loan no.' },
  { id: 'firstName', label: 'Customer name' },
  { id: 'otherName', label: 'Other name' },
  { id: 'otherNumber', label: 'Other no.' },
  { id: 'percentage', label: 'int rate (%)' },
  { id: 'fund', label: 'Fund' },
  { id: 'date', label: 'Open date' },
  { id: 'otherLoanAmount', label: 'Other loan amt' },
  { id: 'grossWt', label: 'Gross wt' },
  { id: 'netWt', label: 'Net wt' },
  { id: 'charge', label: 'Charge' },
  { id: 'day', label: ' Day' },
  { id: 'pendingAmt', label: 'Pending int.' },
  { id: 'renewalDate', label: 'Renew date' },
  { id: 'status', label: 'Status' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Issued', label: 'Issued' },

  { value: 'Regular', label: 'Regular' },
  {
    value: 'Overdue',
    label: 'Overdue',
  },
];

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  branch: '',
  otherName: '',
  renewStartDate: null,
  renewEndDate: null,
};

// ----------------------------------------------------------------------

export default function AllBranchLoanSummaryListView() {
  const [options, setOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { otherLoanReports, otherLoanReportsLoading } = useGetOtherLoanReports(true, false);
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

  useEffect(() => {
    fetchStates();
  }, [otherLoanReports]);

  const percentage = dataFiltered.reduce((prev, next) => prev + (Number(next?.percentage) || 0), 0);
  const rate = dataFiltered.reduce((prev, next) => prev + (Number(next?.rate) || 0), 0);
  const amount = dataFiltered.reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);
  const charge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.otherCharge) || 0),
    0
  );

  const pendingInterest = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.pendingInterest) || 0),
    0
  );

  const day = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.pendingDay > 0 ? next.pendingDay : 0) || 0),
    0
  );

  const grossWt = dataFiltered.reduce(
    (loanSum, otherLoan) =>
      loanSum + otherLoan.loan.propertyDetails.reduce((sum, item) => sum + Number(item.grossWeight || 0), 0),
    0
  );
  const netWt = dataFiltered.reduce(
    (loanSum, otherLoan) =>
      loanSum + otherLoan.loan.propertyDetails.reduce((sum, item) => sum + Number(item.totalWeight || 0), 0),
    0
  );


  const total = {
    percentage,
    rate,
    amount,
    pendingInterest,
    charge,
    grossWt,
    netWt
  };

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

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

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
          heading="Other Loan All Branch Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            {
              name: 'Other Loan All Branch Reports',
              href: paths.dashboard.reports['other-loan-all-branch-reports'],
            },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <>
                    <Label
                      style={{ margin: '5px' }}
                      variant={
                        ((tab.value === 'All' || tab.value == filters.status) && 'filled') || 'soft'
                      }
                      color={
                        (tab.value === 'Regular' && 'success') ||
                        (tab.value === 'Overdue' && 'error') ||
                        (tab.value === 'Issued' && 'secondary') ||
                        'default'
                      }
                    >
                      {['Issued', 'Regular', 'Overdue', 'Closed'].includes(tab.value)
                        ? otherLoanReports.filter((item) => item.status === tab.value).length
                        : otherLoanReports.length}
                    </Label>
                  </>
                }
              />
            ))}
          </Tabs>
          <AllBranchOtherLoanSummaryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            options={options}
            total={total}
          />
          {canReset && (
            <AllBranchOtherLoanSummaryTableFiltersResult
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
                  zIndex: 1000,
                }}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <AllBranchOtherLoanSummaryTableRow
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
                    zIndex: 1,
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
                    {amount.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>{grossWt.toFixed(2)}</TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>{netWt.toFixed(2)}</TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {charge.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(day / dataFiltered.length).toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {pendingInterest.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>{' '}
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
  const { username, status, startDate, endDate, branch, otherName, renewEndDate, renewStartDate } =
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
        item?.loan?.customer?.firstName?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer?.lastName?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.loanNo?.toLowerCase().includes(username.toLowerCase()) ||
        item?.otherNumber?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer?.contact?.toLowerCase().includes(username.toLowerCase()) ||
        item?.code.toLowerCase().includes(username.toLowerCase()) ||
        item?.amount === Number(username) ||
        item?.otherName?.toLowerCase().includes(username.toLowerCase())
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

  if (!dateError && renewStartDate && renewEndDate) {
    inputData = inputData.filter((order) =>
      isBetween(new Date(order.renewalDate), renewStartDate, renewEndDate)
    );
  }

  return inputData;
}
