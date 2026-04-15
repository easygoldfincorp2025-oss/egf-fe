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
import InterestReportsTableRow from '../interest-reports/interest-reports-table-row.jsx';
import InterestReportsTableFiltersResult from '../interest-reports/interest-reports-table-filters-result.jsx';
import InterestReportsTableToolbar from '../interest-reports/interest-reports-table-toolbar.jsx';
import { useGetInterestReports } from '../../../api/interest-reports.js';
import { isBetween } from '../../../utils/format-time.js';
import { TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '#' },
  { id: 'loanNo', label: 'Loan no.' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'issueDate', label: 'Issue date' },
  { id: 'loanAmount', label: 'Loan amt' },
  { id: 'interestLoanAmount', label: 'Int. loan amt' },
  { id: 'interestRate', label: 'Rate' },
  { id: 'consultingCharge', label: 'Consulting Charge' },
  { id: 'interestAmount', label: 'int. amt' },
  { id: 'consultingAmount', label: 'Con. amt' },
  { id: 'penaltyAmount', label: 'Penalty' },
  { id: 'Day', label: 'Day' },
  { id: 'totalPaidInterest', label: 'Total Int. amt' },
  { id: 'lastInterestPayDate', label: 'Last Int. pay date' },
  { id: 'pendingDay', label: 'Pending day' },
  { id: 'pendingIntAmt', label: 'Pending Int. amt' },
];

const defaultFilters = {
  username: '',
  branch: '',
  startDate: null,
  endDate: null,
  rate: '',
};

// ----------------------------------------------------------------------

export default function InterestReportsListView() {
  const table = useTable();
  const { interestReports, interestReportsLoading } = useGetInterestReports();
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

  const cutoffDate = new Date("2025-08-01");
  const loanAmt = dataFiltered.reduce((prev, next) => prev + (Number(next?.loanAmount) || 0), 0);
  const intLoanAmt = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.interestLoanAmount) || 0),
    0
  );

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

  const consultingCharge = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.consultingCharge) || 0),
    0
  );

  const interestAmount = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.interestAmount) || 0),
    0
  );

  const consultingAmount = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.consultingAmount) || 0),
    0
  );

  const penaltyAmount = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.penaltyAmount) || 0),
    0
  );

  const totalPaidInterest = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.totalPaidInterest) || 0),
    0
  );

  const day = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.day > 0 ? next.day : 0) || 0),
    0
  );

  const pendingDay = dataFiltered.reduce(
    (prev, next) => prev + Number(next?.pendingDays >= 0 ? next.pendingDays : 0),
    0
  );

  const pendingInterest = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.pendingInterest) || 0),
    0
  );

  const total = {
    int,
    intLoanAmt,
    consultingCharge,
    interestAmount,
    consultingAmount,
    penaltyAmount,
    totalPaidInterest,
    day,
    pendingDay,
    pendingInterest,
    loanAmt,
  };

  useEffect(() => {
    const updatedData = interestReports.map((item, index) => ({
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
  }, [interestReports]);

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

  if (interestReportsLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Interest Reports"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Interest Reports' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <InterestReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            total={total}
            options={options}
          />
          {canReset && (
            <InterestReportsTableFiltersResult
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
                    <InterestReportsTableRow key={row?._id} index={index} row={row} />
                  ))}
                <TableNoData notFound={notFound} />

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
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {loanAmt.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {intLoanAmt.toFixed(0)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(int / dataFiltered.length).toFixed(2)}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(consultingCharge / dataFiltered.length).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {interestAmount.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {consultingAmount.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {penaltyAmount.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(day / dataFiltered.length).toFixed()}
                  </TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {totalPaidInterest.toFixed(0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}></TableCell>{' '}
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {(pendingDay / dataFiltered.length).toFixed()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#637381', py: 1, px: 2 }}>
                    {pendingInterest.toFixed(0)}
                  </TableCell>
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
          item?.customer?.firstName &&
          item?.customer?.firstName +
            ' ' +
            item?.customer?.middleName +
            ' ' +
            item?.customer?.lastName
        )
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item.customer.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item.customer.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item.loanNo.toLowerCase().includes(username.toLowerCase()) ||
        item.customer.contact.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (branch) {
    inputData = inputData.filter((item) => item.customer.branch._id === branch);
  }

  if (rate) {
    inputData = inputData.filter((item) => item.scheme.interestRate === rate.rate);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) =>
      isBetween(new Date(item?.createdAt), startDate, endDate)
    );
  }

  return inputData;
}
