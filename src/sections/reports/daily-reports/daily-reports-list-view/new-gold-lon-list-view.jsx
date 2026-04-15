import isEqual from 'lodash/isEqual';
import React, { useCallback, useState } from 'react';
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
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks';
import AllBranchLoanSummaryTableFiltersResult from '../../all-branch-loan/all-branch-loan-summary-table-filters-result';
import NewGoldLoanTableRow from '../daily-reports-table/new-gold-loan-table-row';
import { TableCell, TableRow, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#' },
  { id: 'loanNo', label: 'Loan no.' },
  { id: 'CustomerName', label: 'Customer name' },
  { id: 'loanAmount', label: 'loan amt' },
  { id: 'paymentMode', label: 'Payment mode' },
  {id: 'cashAmt', label: 'Cash amt' },
{ id: 'bankAmt', label: 'Bank amt' },
  { id: 'bankName', label: 'Bank name' },
  { id: 'int', label: 'Int(%)' },
  { id: 'ConCharge', label: 'Con. charge' },
  { id: 'appCharge', label: 'App. charge' },
  { id: 'paymentMode', label: 'Payment mode' },
  {id: 'cashAmt', label: 'Cash amt' },
{ id: 'bankAmt', label: 'Bank amt' },
  { id: 'bankName', label: 'Bank name' },
  { id: 'issueDate', label: 'Issue date' },
  { id: 'EntryBy', label: 'Entry by' },
];

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  branch: '',
};

// ----------------------------------------------------------------------

export default function NewGoldLonListView({ LoanIssue, branch }) {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(LoanIssue);
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
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

  const loanAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.loanAmount) || 0), 0);
  const conCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.consultingCharge) || 0),
    0
  );
  const cashAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.cashAmount) || 0),
    0
  );
  const bankAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.bankAmount) || 0),
    0
  );
  const chargeCashAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.chargePaymentDetail?.cashAmount) || 0),
    0
  );
  const chargeBankAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.chargePaymentDetail?.bankAmount) || 0),
    0
  );  const approvalCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.approvalCharge) || 0),
    0
  );


  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
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
    const deleteRows = dataFiltered.filter((row) => table.selected.includes(row._id));
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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Typography sx={{ fontSize: 22, fontWeight: 600 }}>New Gold Loan Details</Typography>
        <Card>
          {canReset && (
            <AllBranchLoanSummaryTableFiltersResult
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 950 }}>
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
                  ?.slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  ?.map((row, index) => (
                    <NewGoldLoanTableRow
                      key={row?._id}
                      row={row}
                      index={index}
                      handleClick={() => handleClick(row?._id)}
                      selected={table.selected.includes(row?._id)}
                      onSelectRow={() => table.onSelectRow(row?._id)}
                      onDeleteRow={() => handleDeleteRow(row?._id)}
                      onEditRow={() => handleEditRow(row?._id)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
                {dataFiltered.length == 0 && (
                  <TableRow>
                    <TableCell colSpan={16} align="center" sx={{ p: 1, fontWeight: 500 }}>
                      No Data Available
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  sx={{
                    backgroundColor: '#F4F6F8',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    boxShadow: '0px 2px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    TOTAL
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {loanAmt.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>{cashAmt.toFixed(0)}</TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>{bankAmt.toFixed(0)}</TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(int / dataFiltered.length).toFixed(2)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(conCharge / dataFiltered.length).toFixed(2)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>{approvalCharge.toFixed(0)}</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>{chargeCashAmt.toFixed(0)}</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>{chargeBankAmt.toFixed(0)}</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                </TableRow>
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
  const { username, status, startDate, endDate, branch } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (branch) {
    inputData = inputData.filter((loan) => loan.customer.branch._id === branch._id);
  }

  inputData = stabilizedThis.map((el) => el[0]);
  return inputData;
}
