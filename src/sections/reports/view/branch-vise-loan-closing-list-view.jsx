import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useGetAllLoanSummary } from '../../../api/all-branch-loan-summary';
import BranchWiseLoanClosingTableToolbar from '../close-loan/branch-wise-loan-closing-table-toolbar';
import BranchWiseLoanClosingFiltersResult from '../close-loan/branch-wise-loan-closing-filters-result';
import BranchWiseLoanClosingTableRow from '../close-loan/branch-wise-loan-closing-table-row';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#' },
  { id: 'loanNo', label: 'Loan No.' },
  { id: 'CustomerName', label: 'Customer name' },
  { id: 'ContactNo', label: 'Contact' },
  { id: 'int%', label: 'int (%)' },
  { id: 'consultingCharge', label: 'Con. charge' },
  { id: 'issueDate', label: 'Issue date' },
  { id: 'loanAmount', label: 'loan amt' },
  { id: 'LastAmtPayDate', label: 'Last int. pay date' },
  { id: 'TotalIntPay', label: 'Total int. pay' },
  { id: 'Day', label: 'Day' },
  { id: 'closedtae', label: 'Close date' },
  { id: 'approvalCharge', label: 'Approval charge' },
  { id: 'closecharge', label: 'Close charge' },
  { id: 'closeamt', label: 'Close amt' },
  { id: 'paymentMode', label: 'Payment mode' },
  { id: 'cashAmt', label: 'Cash amt' },
  { id: 'bankAmt', label: 'Bank amt' },
  { id: 'bankName', label: 'Bank Name' },
  { id: 'closeby', label: 'Close By' },
  { id: 'Status', label: 'Status' },
];

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  startCloseDate: null,
  endCloseDate: null,
  branch: '',
  closedBy: '',
};

// ----------------------------------------------------------------------

export default function BranchViseLoanClosingListView() {
  const [options, setOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { LoanSummary, LoanSummaryLoading } = useGetAllLoanSummary(false, true);
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(LoanSummary);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: LoanSummary,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const cutoffDate = new Date("2025-08-01");

  const int = dataFiltered.reduce(
    (prev, next) =>
      prev +
      (Number(
        new Date(next.issueDate) < cutoffDate
          ? Number(next.scheme?.interestRate > 1.5 ? 1.5 : next.scheme?.interestRate).toFixed(2)
          : 1
      ) || 0),
    0
  );

  const conCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.consultingCharge) || 0),
    0
  );
  const cashAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.cashAmount) || 0), 0);
  const bankAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.bankAmount) || 0), 0);

  const loanAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.loanAmount) || 0), 0);
  const intLoanAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.interestLoanAmount) || 0),
    0
  );

  const totalIntPay = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.totalPaidInterest) || 0),
    0
  );

  const day = dataFiltered.reduce(
    (prev, next) => prev + (Number(next.day > 0 && next?.day) || 0),
    0
  );

  const approvalCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.approvalCharge) || 0),
    0
  );

  const closeCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.closeCharge) || 0),
    0
  );

  const closeAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.closeAmt) || 0), 0);

  const total = {
    int,
    conCharge,
    totalIntPay,
    closeCharge,
    closeAmt,
    loanAmt,
    intLoanAmt,
    approvalCharge,
    day,
    cashAmt,
    bankAmt,
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
    const deleteRows = LoanSummary.filter((row) => table.selected.includes(row._id));
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

  if (LoanSummaryLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    dataFiltered?.map((data) => {
      setOptions((item) => {
        if (!item.find((option) => option.value === data.closedBy._id)) {
          return [
            ...item,
            {
              name: `${data.closedBy.firstName} ${data.closedBy.middleName} ${data.closedBy.lastName}`,
              value: data.closedBy._id,
            },
          ];
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
          heading="Loan Closing Report"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            {
              name: 'Loan Closing Report',
              href: paths.dashboard.reports['closed-loanList'],
            },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <BranchWiseLoanClosingTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            options={options}
            total={total}
          />
          {canReset && (
            <BranchWiseLoanClosingFiltersResult
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
              ' .css-h9g863-MuiTableCell-root': {
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
                    <BranchWiseLoanClosingTableRow
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
                    boxShaodw: '0px 2px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(int / dataFiltered.length).toFixed(2)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(conCharge / dataFiltered.length).toFixed(2)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {loanAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {totalIntPay.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {(day / dataFiltered.length).toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {approvalCharge.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {closeCharge.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                    {loanAmt.toFixed(0)}
                  </TableCell><TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}>
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 0.5 }}>
                    {cashAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 0.5 }}>
                    {bankAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 1 }}></TableCell>
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
  const { username, status, startDate, startCloseDate, endDate, endCloseDate, branch, closedBy } =
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
        (item.customer.firstName + ' ' + item.customer.middleName + ' ' + item.customer.lastName)
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item.customer.firstName.toLowerCase().includes(username.toLowerCase()) ||
        item.customer.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item.loanNo.toLowerCase().includes(username.toLowerCase()) ||
        item.loanAmount === Number(username) ||
        item.customer.contact.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (closedBy) {
    inputData = inputData.filter((item) => item?.closedBy?._id === closedBy?.value);
  }

  if (status && status !== 'All') {
    inputData = inputData.filter((item) => item.status === status);
  }

  if (branch) {
    inputData = inputData.filter((loan) => loan.customer.branch._id === branch._id);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((loan) => isBetween(new Date(loan.issueDate), startDate, endDate));
  }

  if (!dateError && startCloseDate && endCloseDate) {
    inputData = inputData.filter((loan) =>
      isBetween(new Date(loan.closedDate), startCloseDate, endCloseDate)
    );
  }

  return inputData;
}
