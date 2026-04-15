import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import ReminderTableToolbar from '../reminder-table-toolbar';
import ReminderTableFiltersResult from '../reminder-table-filters-result';
import ReminderTableRow from '../reminder-table-row';
import { fDate, isAfter, isBetween, isBetweenDay } from '../../../utils/format-time';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetLoanissue } from '../../../api/loanissue';
import { useGetReminder } from '../../../api/reminder';
import * as XLSX from 'xlsx';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label/index.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '#' },
  { id: 'loanNo', label: 'Loan no.' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'otpNo.', label: 'OTP no.' },
  { id: 'loanAmount', label: 'Loan amt' },
  { id: 'intloanAmount', label: 'Int. loan amt' },
  { id: 'days', label: 'Days' },
  { id: 'nextInterestPaydate', label: 'Next int. pay date' },
  { id: 'issueDate', label: 'Issue date' },
  { id: 'lastInterestDate', label: 'Last int. date' },
  { id: 'lastRecallingDate', label: 'Last recalling date' },
  { id: '' },
];

const defaultFilters = {
  name: '',
  day: '',
  status: 'All',
  startDate: null,
  endDate: null,
  nextInstallmentDay: [],
  startDay: '',
  endDay: '',
};

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Disbursed', label: 'Disbursed' },
  {
    value: 'Overdue',
    label: 'Overdue',
  },
  { value: 'Regular', label: 'Regular' },
];

// ----------------------------------------------------------------------

export default function ReminderListView() {
  const { reminder, mutate } = useGetReminder();
  const { Loanissue, LoanissueLoading } = useGetLoanissue(false, true);
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const [filters, setFilters] = useState(defaultFilters);
  const [srData, setSrData] = useState([]);

  useEffect(() => {
    const updatedData = Loanissue.map((item, index) => ({
      ...item,
      srNo: index + 1,
    }));
    setSrData(updatedData);
  }, [Loanissue]);

  const calculateDateDifference = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to get the latest nextRecallingDate for a loan
  const getLatestRecallingDate = (loanId) => {
    const loanReminders = reminder.filter((r) => r?.loan?._id === loanId);
    if (loanReminders.length === 0) return null;
    
    // Sort by nextRecallingDate descending to get the latest
    const sortedReminders = loanReminders
      .filter((r) => r?.nextRecallingDate)
      .sort((a, b) => new Date(b.nextRecallingDate) - new Date(a.nextRecallingDate));
    
    return sortedReminders.length > 0 ? sortedReminders[0].nextRecallingDate : null;
  };

  const dataFiltered = applyFilter({
    inputData: srData,
    comparator: getComparator(table.order, table.orderBy),
    calculateDateDifference: calculateDateDifference,
    filters,
  });

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

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({ ...defaultFilters, day: '' });
  }, []);

  const handleClick = useCallback(
    (id) => {
      router.push(paths.dashboard.reminder_details.list(id));
    },
    [router]
  );

  if (LoanissueLoading) {
    return <LoadingScreen />;
  }

  const exportToExcel = () => {
    const groupedData = dataFiltered.reduce((acc, loan) => {
      const customerId = loan?.customer?._id;
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: loan?.customer,
          loans: [],
        };
      }
      acc[customerId].loans.push(loan);
      return acc;
    }, {});

    const exportData = Object.values(groupedData).flatMap((group, customerIndex) => {
      const { customer, loans } = group;

      return loans.flatMap((loan, loanIndex) => {
        const baseRow = {
          '#': loanIndex === 0 ? customerIndex + 1 : '',
          'Customer Name':
            loanIndex === 0
              ? `${customer?.firstName} ${customer?.middleName || ''} ${customer?.lastName}`
              : '',
          'Customer Contact': loanIndex === 0 ? customer?.contact || '' : '',
          'Loan No.': loan?.loanNo || '',
          'Loan Amount': loan?.loanAmount || '',
          'Next Interest Pay Date': fDate(loan?.nextInstallmentDate) || '',
          'Issue Date': fDate(loan?.issueDate) || '',
          'Last Interest Date': fDate(loan?.lastInstallmentDate) || '',
          Days:
            calculateDateDifference(new Date(), loan.lastInstallmentDate || loan.issueDate) || '',
          'Next Recalling Date': '',
          Remark: '',
        };

        const relatedReminders = reminder.filter(
          (r) => r?.loan?.customer?._id === loan?.customer?._id && r?.loan?._id === loan?._id
        );

        const reminderRows = relatedReminders.map((reminderData, idx) => {
          if (idx === 0) {
            baseRow['Next Recalling Date'] = fDate(reminderData?.nextRecallingDate) || '';
            baseRow.Remark = reminderData?.remark || '';
            return null;
          }
          return {
            '#': '',
            'Customer Name': '',
            'Customer Contact': '',
            'Loan No.': '',
            'Loan Amount': '',
            'Next Interest Pay Date': '',
            'Issue Date': '',
            'Last Interest Date': '',
            Days: '',
            'Next Recalling Date': fDate(reminderData?.nextRecallingDate) || '',
            Remark: reminderData?.remark || '',
          };
        });

        const filteredReminderRows = reminderRows.filter((row) => row !== null);
        return [baseRow, ...filteredReminderRows];
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reminders');
    XLSX.writeFile(workbook, 'Reminders.xlsx');
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Reminders"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reminder', href: paths.dashboard.reminder.list },
            { name: 'List' },
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
                        (tab.value === 'Disbursed' && 'info') ||
                        'default'
                      }
                    >
                      {['Disbursed', 'Overdue', 'Regular'].includes(tab.value)
                        ? Loanissue.filter((item) => item.status === tab.value).length
                        : Loanissue.length}
                    </Label>
                  </>
                }
              />
            ))}
          </Tabs>
          <ReminderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            exportToExcel={exportToExcel}
          />
          {canReset && (
            <ReminderTableFiltersResult
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
                }}
              />
              <TableBody>
                <>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <ReminderTableRow
                        index={row.srNo}
                        key={row._id}
                        row={row}
                        handleClick={() => handleClick(row._id)}
                        mutate={mutate}
                        latestRecallingDate={getLatestRecallingDate(row._id)}
                      />
                    ))}
                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                  <TableNoData notFound={notFound} />
                </>
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
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError, calculateDateDifference }) {
  const { startDate, endDate, name, day, status, startDay, endDay } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (rem) =>
        (rem.customer.firstName + ' ' + rem.customer.middleName + ' ' + rem.customer.lastName)
          .toLowerCase()
          .includes(name.toLowerCase()) ||
        rem.customer.firstName.toLowerCase().includes(name.toLowerCase()) ||
        rem.customer.middleName.toLowerCase().includes(name.toLowerCase()) ||
        rem.customer.lastName.toLowerCase().includes(name.toLowerCase()) ||
        rem.loanNo.includes(name.toLowerCase()) ||
        rem.customer.contact.includes(name)
    );
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((order) =>
      isBetween(new Date(order?.nextInstallmentDate), startDate, endDate)
    );
  }

  if (startDay && endDay) {
    inputData = inputData.filter((item) =>
      isBetweenDay(
        calculateDateDifference(new Date(), item.lastInstallmentDate || item.issueDate),
        startDay,
        endDay
      )
    );
  }

  if (day) {
    inputData = inputData.filter(
      (item) =>
        calculateDateDifference(new Date(), item.lastInstallmentDate || item.issueDate) >= day
    );
  }

  if (status && status !== 'All') {
    inputData = inputData.filter((item) => item.status === status);
  }

  return inputData;
}
