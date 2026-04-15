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
import OtherInterestEntryReportsTableToolbar
  from '../other-interest-entry-reports/other-interest-entry-reports-table-toolbar.jsx';
import OtherInterestEntryReportsTableFiltersResult
  from '../other-interest-entry-reports/other-interest-entry-reports-table-filters-result.jsx';
import OtherInterestEntryReportsTableRow
  from '../other-interest-entry-reports/other-interest-entry-reports-table-row.jsx';
import { useGetOtherInterestEntryReports } from '../../../api/other-interest-entry-reports.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'Code' },
  { id: 'otherLoanNumber', label: 'Loan No' },
  { id: 'otherNo', label: 'other no' },
  { id: 'from', label: 'From Date' },
  { id: 'to', label: 'To Date' },
  { id: 'days', label: 'Days' },
  { id: 'amount', label: 'Other amt' },
  { id: 'interestAmount', label: 'Int. amt' },
  { id: 'charge', label: 'Charge' },
  { id: 'amountPaid', label: 'Amount Paid' },
  { id: 'paymentMode', label: 'Payment mode' },
  { id: 'cashAmt', label: 'Cash Amt' },
  { id: 'BankAmt', label: 'Bank Amt' },
  { id: 'Bank', label: 'Bank' },
  { id: 'EntryDate', label: 'Entry Date' },
];

const defaultFilters = {
  username: '',
  branch: '',
  startDate: null,
  endDate: null,
  rate: '',
};

// ----------------------------------------------------------------------

export default function OtherInterestEntryReportsListView() {
  const table = useTable();
  const { otherInterestEntryReports, otherInterestEntryReportsLoading } =
    useGetOtherInterestEntryReports();
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

  const payAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.payAfterAdjust) || 0), 0);
  const cashAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.cashAmount) || 0),
    0
  );

  const bankAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.paymentDetail.bankAmount) || 0),
    0
  );

  const interestAmount = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.payAfterAdjust) || 0),
    0
  );

  const charge = dataFiltered.reduce((prev, next) => prev + (Number(next?.charge) || 0), 0);
  const otherAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.otherLoan?.otherLoanAmount) || 0),
    0
  );

  const day = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.days > 0 ? next?.days : 0) || 0),
    0
  );

  const total = {
    bankAmt,
    cashAmt,
    interestAmount,
    charge,
    day,
    payAmt,
    otherAmt
  };

  useEffect(() => {
    const updatedData = otherInterestEntryReports?.map((item, index) => ({
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
  }, [otherInterestEntryReports]);

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

  if (otherInterestEntryReportsLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Other Interest Entry Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Interest Entry Reports' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <OtherInterestEntryReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            total={total}
            options={options}
          />
          {canReset && (
            <OtherInterestEntryReportsTableFiltersResult
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
                  ?.map((row, index) => (
                    <OtherInterestEntryReportsTableRow key={row?._id} index={index} row={row} />
                  ))}
                <TableNoData notFound={notFound} />

                <TableRow
                  sx={{ backgroundColor: '#F4F6F8', bottom: 0, position: 'sticky', zIndex: 1000 }}
                >
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    TOTAL
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {day}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {otherAmt}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {((Number(interestAmount) || 0) - (Number(charge) || 0)).toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {charge.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(payAmt).toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                  </TableCell><TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {cashAmt}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {bankAmt}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
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
    inputData = inputData.filter((item) =>
      item.otherLoan.otherLoanNumber.toLowerCase().includes(username.toLowerCase()) ||
      ((Number(item?.payAfterAdjust) || 0) + (Number(item?.charge) || 0)) === Number(username) ||
    item.otherLoan.otherNumber.toLowerCase().includes(username.toLowerCase()) ||
      item.otherLoan.loan?.loanNo.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) =>
      isBetween(new Date(item?.to), startDate, endDate)
    );
  }

  return inputData;
}
