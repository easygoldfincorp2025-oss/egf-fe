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
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
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
import { LoadingScreen } from '../../../components/loading-screen';
import { isBetween } from '../../../utils/format-time.js';
import { TableCell, TableRow } from '@mui/material';
import InterestEntryReportsTableToolbar from '../interest-entry-reports/interest-entry-reports-table-toolbar.jsx';
import InterestEntryReportsTableFiltersResult
  from '../interest-entry-reports/interest-entry-reports-table-filters-result.jsx';
import InterestEntryReportsTableRow from '../interest-entry-reports/interest-entry-reports-table-row.jsx';
import { useGetInterestEntryReports } from '../../../api/interest-entry-reports.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '#' },
  { id: 'loanNo', label: 'Loan no' },
  { id: 'from', label: 'From Date' },
  { id: 'to', label: 'To Date' },
  { id: 'loanAmount', label: 'Loan Amt' },
  { id: 'interestLoanAmount', label: 'Int Loan Amt' },
  { id: 'interestRate', label: 'Int. + con. Rate' },
  { id: 'int+concharge', label: 'Int. amt' },
  { id: 'concharge', label: 'con. charge ' },
  { id: 'penaltyAmount', label: 'Penalty Amt' },
  { id: 'totalpay', label: 'Total pay' },
  { id: 'uchakAmt', label: 'Uchak Amt' },
  { id: 'oldcr/dr', label: 'Old cr/dr' },
  { id: 'payAfterAdjust', label: 'Pay After Adjust' },
  { id: 'days', label: 'Days' },
  { id: 'entryDate', label: 'Entry Date' },
  { id: 'cashamt', label: 'Cash amt' },
  { id: 'bankamt', label: 'Bank amt' },
  { id: 'bank', label: 'Bank' },
  { id: 'totalPay', label: 'Total Pay Amt' },
  { id: 'entryBy', label: 'Entry By' },
];

const defaultFilters = {
  username: '',
  branch: '',
  startDate: null,
  endDate: null,
  rate: '',
};

// ----------------------------------------------------------------------

export default function interestEntryReportsListView() {
  const table = useTable();
  const { interestEntryReports, interestEntryReportsLoading } = useGetInterestEntryReports();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [srData, setSrData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);

  const dataFiltered = applyFilter({
    inputData: srData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const penaltyAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.penalty) || 0), 0);
  const payAfterAdjustAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.adjustedPay) || 0),
    0
  );

  const uchakAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.uchakInterestAmount) || 0),
    0
  );

  const totalPayAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.amountPaid) || 0),
    0
  );

  const cashAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.bankAmount) || 0),
    0
  );

  const intAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.interestAmount) || 0), 0);
  const oldCrDr = dataFiltered.reduce((prev, next) => prev + (Number(next?.old_cr_dr) || 0), 0);
  const totalPay = dataFiltered.reduce((prev, next) => prev + (Number(next?.totalPay) || 0), 0);
  const conCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.consultingCharge) || 0),
    0
  );

  const total = {
    penaltyAmt,
    payAfterAdjustAmt,
    totalPayAmt,
    intAmt,
    oldCrDr,
    totalPay,
    conCharge,
    bankAmt,
    cashAmt,
  };

  useEffect(() => {
    const updatedData = interestEntryReports.map((item, index) => ({
      ...item,
      srNo: index + 1,
    }));
    setSrData(updatedData);

    if (updatedData.length > 0) {
      const existingRates = new Set(options.map((opt) => opt.rate));
      const newOptions = [...options];

      updatedData.forEach((data) => {
        const rate = data?.scheme?.interestRate;
        if (!existingRates.has(rate)) {
          existingRates.add(rate);
          newOptions.push({ rate });
        }
      });

      setOptions(newOptions);
    }
  }, [interestEntryReports]);

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

  if (interestEntryReportsLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Interest Entry Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Interest Entry Reports' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <InterestEntryReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            total={total}
            options={options}
          />
          {canReset && (
            <InterestEntryReportsTableFiltersResult
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
                  dataFiltered.map((row) => row.id)
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
                  .map((row, index) => (
                    <InterestEntryReportsTableRow key={row?._id} index={index} row={row} />
                  ))}
                <TableNoData notFound={notFound} />
                <TableRow sx={{
                  backgroundColor: '#F4F6F8',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 1,
                  boxShadow: '0px 2px 2px rgba(0,0,0,0.1)',
                }}>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    TOTAL
                  </TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell
                    sx={{
                      fontWeight: '600',
                      color: '#637381',
                      py: 1,
                      px: 2,
                    }}
                  >
                    {intAmt.toFixed(0)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: '600',
                      color: '#637381',
                      py: 1,
                      px: 2,
                    }}
                  >
                    {conCharge.toFixed(0)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: '600',
                      color: '#637381',
                      py: 1,
                      px: 2,
                    }}
                  >
                    {penaltyAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(intAmt + penaltyAmt + conCharge).toFixed(2)}{' '}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {uchakAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {oldCrDr.toFixed(0)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: '600',
                      color: '#637381',
                      py: 1,
                      px: 2,
                    }}
                  >
                    {payAfterAdjustAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {cashAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {bankAmt.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {totalPayAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
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
  const { username, startDate, endDate, branch, rate } = filters;
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
          item?.loan.customer?.firstName &&
          item?.loan.customer?.firstName +
            ' ' +
            item?.loan.customer?.middleName +
            ' ' +
            item?.loan.customer?.lastName
        )
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item.loan.customer.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.loanNo.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.contact.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) =>
      isBetween(new Date(item?.createdAt), startDate, endDate)
    );
  }

  return inputData;
}
