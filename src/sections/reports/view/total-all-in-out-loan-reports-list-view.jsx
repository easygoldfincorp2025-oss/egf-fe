import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState, useMemo } from 'react';
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
import { fDate, isBetween } from '../../../utils/format-time';
import { useGetConfigs } from '../../../api/config';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label';
import TotalAllInOutLoanReportsTableToolbar from '../total-all-in-out-loan-reports/total-all-in-out-loan-reports-table-toolbar.jsx';
import TotalAllInOutLoanReportsTableFiltersResult from '../total-all-in-out-loan-reports/total-all-in-out-loan-reports-table-filters-result.jsx';
import { useGetTotalAllInoutLoanReports } from '../../../api/total-all-in-out-loan-reports.js';
import { TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'index', label: '#', width: 40 },
  { id: `loan.LoanNo`, label: 'Loan no.', width: 90 },
  { id: 'issueDate', label: 'Issue date', width: 80 },
  { id: 'firstName', label: 'Customer name', width: 130 },
  { id: 'amount', label: 'total loan amt', width: 90 },
  { id: 'interestLoanAmount', label: 'Int. loan amt', width: 90 },
  { id: 'toralwt', label: 'Total wt', width: 70 },
  { id: 'netwt', label: 'net wt', width: 70 },
  { id: 'intrate', label: 'Int. rate', width: 70 },
  { id: 'totalInterestAmount', label: 'Total int.amt', width: 90 },
  { id: 'code', label: 'code', width: 40 },
  { id: 'otherNumber', label: 'Other no', width: 80 },
  { id: 'date', label: 'Date', width: 80 },
  { id: 'otherName', label: 'Other name', width: 100 },
  { id: 'otherloanamt', label: 'Other Loan amt', width: 90 },
  { id: 'otherloanintamt', label: 'Other Loan Int Amt', width: 90 },
  { id: 'grossWt', label: 'Gross wt', width: 70 },
  { id: 'netWt', label: 'Net wt', width: 70 },
  { id: 'otherint', label: 'Other int(%)', width: 80 },
  { id: 'otherintamt', label: 'Other int amt', width: 90 },
  { id: 'diffloanamt', label: 'Diff loan amt', width: 90 },
  { id: 'diffintamt', label: 'Diff int amt', width: 90 },
  { id: 'status', label: 'Status', width: 80 },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Regular', label: 'Regular' },
  {
    value: 'Overdue',
    label: 'Overdue',
  },
  {
    value: 'Closed',
    label: 'Closed',
  },
];

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  startOtherDate: null,
  endOtherDate: null,
  code: '',
};

// ----------------------------------------------------------------------

export default function OtherLonaInterestListView() {
  const [codeOptions, setCodeOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { totalAllInoutLoanReports, totalAllInoutLoanReportsLoading } =
    useGetTotalAllInoutLoanReports();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(totalAllInoutLoanReports);
  const [filters, setFilters] = useState(defaultFilters);
  const [totals, setTotals] = useState({
    loanAmount: 0,
    partLoanAmount: 0,
    interestLoanAmount: 0,
    totalWeight: 0,
    netWeight: 0,
    otherNetWeight: 0,
    averageInterestRate: 0,
    totalInterestAmount: 0,
    otherLoanAmount: 0,
    amount: 0,
    grossWeight: 0,
    averagePercentage: 0,
    totalOtherInterestAmount: 0,
    diffLoanAmount: 0,
    diffInterestAmount: 0,
  });

  const dataFiltered = useMemo(() =>
    applyFilter({
      inputData: totalAllInoutLoanReports,
      comparator: getComparator(table.order, table.orderBy),
      filters,
    }),
    [totalAllInoutLoanReports, table.order, table.orderBy, filters]
  );

  const flattenedData = useMemo(() =>
    Object.values(dataFiltered).flat(),
    [dataFiltered]
  );
  const dataInPage = useMemo(() =>
    flattenedData.slice(
      table.page * table.rowsPerPage,
      table.page * table.rowsPerPage + table.rowsPerPage
    ),
    [flattenedData, table.page, table.rowsPerPage]
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!flattenedData.length && canReset) || !flattenedData.length;

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

  const handleDeleteRows = useCallback(() => {
    const deleteRows = totalAllInoutLoanReports.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    handleDelete(deleteIds);
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const calculatedTotals = useMemo(() => {
    const newTotals = {
      loanAmount: 0,
      partLoanAmount: 0,
      interestLoanAmount: 0,
      totalWeight: 0,
      averageInterestRate: 0,
      totalInterestAmount: 0,
      otherLoanAmount: 0,
      amount: 0,
      grossWeight: 0,
      netWeight: 0,
      otherNetWeight: 0,
      averagePercentage: 0,
      totalOtherInterestAmount: 0,
      diffLoanAmount: 0,
      diffInterestAmount: 0,
    };

    const uniqueLoans = new Set();
    let totalInterestRate = 0;
    let uniqueLoanCount = 0;

    Object.values(dataFiltered).forEach((otherLoans) => {
      otherLoans.forEach((item) => {
        const loanNo = item.loan.loanNo;

        if (!uniqueLoans.has(loanNo)) {
          uniqueLoans.add(loanNo);

          newTotals.loanAmount += Number(item.loan.loanAmount) || 0;
          newTotals.partLoanAmount +=
            Number(item.loan.loanAmount - item.loan.interestLoanAmount) || 0;
          newTotals.interestLoanAmount += Number(item.loan.interestLoanAmount) || 0;
          newTotals.totalInterestAmount += Number(item.totalInterestAmount) || 0;

          const propertyTotal =
            item.loan.propertyDetails?.reduce(
              (sum, detail) => sum + (Number(item.loan.status === "Closed" ? 0 : detail.totalWeight) || 0),
              0
            ) || 0;
          newTotals.totalWeight += propertyTotal;

          const propertyNet =
            item.loan.propertyDetails?.reduce(
              (sum, detail) => sum + (Number(item.loan.status === "Closed" ? 0 :detail.netWeight) || 0),
              0
            ) || 0;
          newTotals.netWeight += propertyNet;

          totalInterestRate += Number(item.loan.status === "Closed" ? 0 :item.loan.scheme.interestRate) || 0;
          uniqueLoanCount++;
        }
      });

      otherLoans.forEach((item) => {
        newTotals.otherLoanAmount += Number(item.otherLoanAmount) || 0;
        newTotals.amount += Number(item.amount) || 0;
        newTotals.grossWeight += Number(item.status === "Closed" ? 0 : item.grossWt) || 0;
        newTotals.otherNetWeight += Number(item.status === "Closed" ? 0 : item?.netWt) || 0;
        newTotals.totalOtherInterestAmount += Number( item.totalOtherInterestAmount) || 0;
      });
    });

    newTotals.averageInterestRate = uniqueLoanCount > 0 ? totalInterestRate / uniqueLoanCount : 0;
    newTotals.averagePercentage =
      Object.values(dataFiltered).reduce((sum, otherLoans) => sum + otherLoans.length, 0) > 0
        ? Object.values(dataFiltered).reduce(
            (sum, otherLoans) =>
              sum +
              otherLoans.reduce((loanSum, item) => loanSum + (Number(item.percentage) || 0), 0),
            0
          ) / Object.values(dataFiltered).reduce((sum, otherLoans) => sum + otherLoans.length, 0)
        : 0;

    newTotals.diffLoanAmount = newTotals.amount - newTotals.interestLoanAmount;
    newTotals.diffInterestAmount =
      newTotals.totalInterestAmount - newTotals.totalOtherInterestAmount;

    return newTotals;
  }, [dataFiltered]);

  useEffect(() => {
    setTotals(calculatedTotals);
  }, [calculatedTotals]);

  function fetchStates() {
    Object.values(totalAllInoutLoanReports).flat()?.map((data) => {
      // Populate code options
      setCodeOptions((item) => {
        if (!item.find((option) => option.code === data.code)) {
          return [
            ...item,
            {
              code: data.code,
              name: data.code,
            },
          ];
        } else {
          return item;
        }
      });
    });
  }

  useEffect(() => {
    fetchStates();
  }, [totalAllInoutLoanReports]);

  if (totalAllInoutLoanReportsLoading) {
    return <LoadingScreen />;
  }
  const statusColors = {
    Closed: (theme) => (theme.palette.mode === 'light' ? '#FFF1D6' : '#6f4f07'),
    // Overdue: (theme) => (theme.palette.mode === 'light' ? '#FFE4DE' : '#611706'),
    // Regular: (theme) => (theme.palette.mode === 'light' ? '#e4ffde' : '#0e4403'),
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Total All In Out Loan Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            {
              name: 'Total All In Out Loan Reports',
              href: paths.dashboard.reports['total-all-in-out-loan-reports'],
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
                        (tab.value === 'Closed' && 'warning') ||
                        (tab.value === 'Issued' && 'secondary') ||
                        'default'
                      }
                    >
                      {['Issued', 'Regular', 'Overdue', 'Closed'].includes(tab.value)
                        ? totalAllInoutLoanReports
                            .flat()
                            .filter((item) => item.status === tab.value).length
                        : totalAllInoutLoanReports.flat().length}
                    </Label>
                  </>
                }
              />
            ))}
          </Tabs>
          <TotalAllInOutLoanReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            total={totals}
            codeOptions={codeOptions}
          />
          {canReset && (
            <TotalAllInOutLoanReportsTableFiltersResult
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
              '& .MuiTableCell-root': {
                borderRight: '1px solid rgba(224, 224, 224, 1)',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                padding: '4px 6px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px',
              },
              '& .MuiTableRow-root': {
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              },
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: 0,
                border: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: '#F4F6F8',
                fontWeight: 600,
                color: '#637381',
                padding: '6px 4px',
              },
            }}
          >
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={flattenedData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  flattenedData.map((row) => row._id)
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
            <Table stickyHeader size="small">
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={flattenedData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  '& .MuiTableCell-root': {
                    fontWeight: 600,
                    color: '#637381',
                    backgroundColor: '#2f3944',
                    padding: '6px 4px',
                    fontSize: '11px',
                  },
                }}
              />
              <TableBody>
                {Object.entries(dataFiltered).map(([loanId, otherLoans], loanIndex) => {
                  const firstRow = otherLoans[0];
                  const rowSpan = otherLoans.length;

                  return otherLoans.map((row, index) => (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{
                        '&:last-child td': {
                          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      {index === 0 && (() => {
                        const bgColor =
                          statusColors[row.loan.status] ||
                          (index === 0 ? 'rgba(244, 246, 248, 0.5)' : 'inherit');

                        return (
                          <>
                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                textAlign: 'center',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[0].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {loanIndex + 1}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[1].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.loanNo}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                textAlign: 'center',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[2].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {fDate(row.loan.issueDate)}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[3].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {`${row.loan.customer.firstName || ''} ${row.loan.customer.middleName || ''} ${row.loan.customer.lastName || ''}`}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[4].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.loanAmount}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[6].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.interestLoanAmount}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[7].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.status === "Closed"
                                ? 0
                                : row.loan.propertyDetails
                                  .reduce((prev, next) => prev + (Number(next?.totalWeight) || 0), 0)
                                  .toFixed(2)}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[8].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.status === "Closed"
                                ? 0
                                : row.loan.propertyDetails
                                  .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
                                  .toFixed(2)}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[9].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {row.loan.status === "Closed" ? 0 : row.loan.scheme.interestRate}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                backgroundColor: bgColor,
                                width: TABLE_HEAD[10].width,
                              }}
                              rowSpan={rowSpan}
                            >
                              {(row.totalInterestAmount || 0).toFixed(2)}
                            </TableCell>
                          </>
                        );
                      })()}

                      {(() => {
                        const bgColor =
                          statusColors[row.status] ||
                          (index === 0 ? 'rgba(244, 246, 248, 0.5)' : 'inherit');

                        return (
                          <>
                            <TableCell
                              align="left"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[11].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.code || 0}
                            </TableCell>

                            <TableCell
                              align="left"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[12].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.otherNumber}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[13].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {fDate(row.date)}
                            </TableCell>

                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[14].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.otherName}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[15].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.otherLoanAmount}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[16].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.amount}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[17].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.status === "Closed" ? 0 : row.grossWt}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[18].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.status === "Closed" ? 0 : row.netWt}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[19].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.status === "Closed" ? 0 : row.percentage}
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                width: TABLE_HEAD[20].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              {row.totalOtherInterestAmount.toFixed(2)}
                            </TableCell>

                            {index === 0 && (
                              <>
                                <TableCell
                                  align="center"
                                  sx={{
                                    fontSize: '11px',
                                    padding: '4px 6px',
                                    width: TABLE_HEAD[21].width,
                                    backgroundColor: bgColor,
                                    color: (() => {
                                      const totalOtherAmount = otherLoans.reduce(
                                        (sum, loan) => sum + Number(loan.amount || 0),
                                        0
                                      );
                                      const diffAmount =
                                        totalOtherAmount - row.loan.interestLoanAmount;
                                      return diffAmount < 0 ? 'green' : 'red';
                                    })(),
                                  }}
                                  rowSpan={rowSpan}
                                >
                                  {(() => {
                                    const totalOtherAmount = otherLoans.reduce(
                                      (sum, loan) => sum + Number(loan.amount || 0),
                                      0
                                    );
                                    const diffAmount =
                                      totalOtherAmount - row.loan.interestLoanAmount;
                                    return diffAmount.toFixed(2);
                                  })()}
                                </TableCell>

                                <TableCell
                                  align="center"
                                  sx={{
                                    fontSize: '11px',
                                    padding: '4px 6px',
                                    width: TABLE_HEAD[22].width,
                                    backgroundColor: bgColor,
                                    color: (() => {
                                      const totalOtherInterest = otherLoans.reduce(
                                        (sum, loan) =>
                                          sum + Number(loan.totalOtherInterestAmount || 0),
                                        0
                                      );
                                      const diffInterest =
                                        row.totalInterestAmount - totalOtherInterest;
                                      return diffInterest < 0 ? 'red' : 'green';
                                    })(),
                                  }}
                                  rowSpan={rowSpan}
                                >
                                  {(() => {
                                    const totalOtherInterest = otherLoans.reduce(
                                      (sum, loan) =>
                                        sum + Number(loan.totalOtherInterestAmount || 0),
                                      0
                                    );
                                    const diffInterest =
                                      row.totalInterestAmount - totalOtherInterest;
                                    return diffInterest.toFixed(2);
                                  })()}
                                </TableCell>
                              </>
                            )}

                            <TableCell
                              sx={{
                                fontSize: '11px',
                                padding: '4px 6px',
                                textAlign: 'center',
                                width: TABLE_HEAD[22].width,
                                backgroundColor: bgColor,
                              }}
                            >
                              <Label
                                variant="soft"
                                color={
                                  (row.status === 'Disbursed' && 'info') ||
                                  (row.status === 'Issued' && 'secondary') ||
                                  (row.status === 'Closed' && 'warning') ||
                                  (row.status === 'Overdue' && 'error') ||
                                  (row.status === 'Regular' && 'success') ||
                                  'default'
                                }
                              >
                                {row.status}
                              </Label>
                            </TableCell>
                          </>
                        );
                      })()}

                    </TableRow>
                  ));
                })}
                <TableNoData notFound={notFound} />
                <TableRow
                  sx={{
                    backgroundColor: '#F4F6F8',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    boxShadow: '0px 2px 2px rgba(0,0,0,0.1)',
                    '& .MuiTableCell-root': {
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#637381',
                      py: 1,
                      px: 1,
                    },
                  }}
                >
                  <TableCell>TOTAL</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{totals.loanAmount.toFixed(0)}</TableCell>
                  <TableCell>{totals.interestLoanAmount.toFixed(0)}</TableCell>
                  <TableCell>{totals.totalWeight.toFixed(0)}</TableCell>
                  <TableCell>{totals.netWeight.toFixed(0)}</TableCell>
                  <TableCell>{totals.averageInterestRate.toFixed(2)}</TableCell>
                  <TableCell>{totals.totalInterestAmount.toFixed(0)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>{totals.otherLoanAmount.toFixed(0)}</TableCell>
                  <TableCell>{totals.amount.toFixed(0)}</TableCell>
                  <TableCell>{totals.grossWeight.toFixed(0)}</TableCell>
                  <TableCell>{totals.otherNetWeight?.toFixed(0)}</TableCell>
                  <TableCell>{totals.averagePercentage.toFixed(2)}</TableCell>
                  <TableCell>{totals.totalOtherInterestAmount.toFixed(0)}</TableCell>
                  <TableCell>{totals.diffLoanAmount.toFixed(0)}</TableCell>
                  <TableCell>{totals.diffInterestAmount.toFixed(0)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, flattenedData.length)}
                />
              </TableBody>
            </Table>
          </TableContainer>
          <TablePaginationCustom
            count={flattenedData.length}
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
  const { username, status, startDate, endDate, startOtherDate, endOtherDate, code } = filters;

  const dataArray = Array.isArray(inputData) ? inputData : Object.values(inputData);

  const flattenedData = dataArray.flatMap((loanGroup) =>
    Array.isArray(loanGroup) ? loanGroup : [loanGroup]
  );

  const stabilizedThis = flattenedData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  let filteredData = stabilizedThis.map((el) => el[0]);

  if (username && username.trim()) {
    filteredData = filteredData.filter(
      (item) =>
        (
          item?.loan?.customer?.firstName +
          ' ' +
          item?.loan?.customer?.middleName +
          ' ' +
          item?.loan?.customer?.lastName
        )
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item?.loan?.customer?.firstName?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer.lastName?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.loanNo.includes(username) ||
        item?.loan?.customer?.contact?.includes(username)
    );
  }

  if (status && status !== 'All') {
    filteredData = filteredData.filter((item) => item.status === status);
  }


  if (code) {
    filteredData = filteredData.filter((item) =>
      item.code === code.code
    );
  }

  if (!dateError && startDate && endDate) {
    filteredData = filteredData.filter((item) =>
      isBetween(new Date(item.loan.issueDate), startDate, endDate)
    );
  }

  if (!dateError && startOtherDate && endOtherDate) {
    filteredData = filteredData.filter((item) =>
      isBetween(new Date(item.date), startOtherDate, endOtherDate)
    );
  }

  const groupedData = filteredData.reduce((acc, item) => {
    const loanId = item.loan._id;
    if (!acc[loanId]) {
      acc[loanId] = [];
    }
    acc[loanId].push(item);
    return acc;
  }, {});

  return groupedData;
}
