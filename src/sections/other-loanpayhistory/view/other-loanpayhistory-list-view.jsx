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
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label';
import { LoadingScreen } from '../../../components/loading-screen';
import BulkInterestModel from '../bulk-interest-pay/bulk-interest-model';
import { useGetConfigs } from '../../../api/config';
import OtherLoanpayhistoryTableRow from '../other-loanpayhistory-table-row.jsx';
import OtherLoanpayhistoryTableToolbar from '../other-loanpayhistory-table-toolbar.jsx';
import OtherLoanpayhistoryTableFiltersResult from '../other-loanpayhistory-table-filters-result.jsx';
import { useGetOtherLoanissue } from '../../../api/other-loan-issue.js';
import { isBetween } from '../../../utils/format-time.js';
import { getResponsibilityValue } from '../../../permission/permission.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '#' },
  { id: 'code', label: 'Code' },
  { id: 'loanNo', label: 'Loan No.' },
  { id: 'customerName', label: 'Customer Name' },
  { id: 'otherName', label: 'Other Name ' },
  { id: 'otherNumber', label: 'Other No.' },
  { id: 'otherAmount', label: 'Other Amt.' },
  { id: 'percentage', label: 'Rate (%)' },
  { id: 'date', label: 'Date' },
  { id: 'rate', label: 'Rate' },
  { id: 'grossWt', label: 'Gross Wt' },
  { id: 'netWt', label: 'Net Wt' },
  { id: 'month', label: 'Month' },
  { id: 'cashAmt', label: 'Cash amt' },
  { id: 'bankAmt', label: 'Bank amt' },
  { id: 'closeAmount', label: 'Close Amt' },
  { id: 'renewalDate', label: 'Renew Date' },
  { id: 'status', label: 'Status' },
  { id: 'action', label: 'Actions' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Regular', label: 'Regular' },
  {
    value: 'Closed',
    label: 'Closed',
  },
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
  renewStartDate: null,
  renewEndDate: null,
};

// ----------------------------------------------------------------------

export default function LoanpayhistoryListView() {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const loanPayHistory = true;
  const { otherLoanissue, mutate, otherLoanissueLoading } = useGetOtherLoanissue();
  const table = useTable({ defaultRowsPerPage: otherLoanissue.length });
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(otherLoanissue);
  const [srData, setSrData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const updatedData = otherLoanissue.map((item, index) => ({
      ...item,
      srNo: index + 1,
    }));
    setSrData(updatedData);
  }, [otherLoanissue]);

  const dataFiltered = applyFilter({
    inputData: srData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

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
    if (!getResponsibilityValue('delete_other_loan', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loan/${id}`
      );
      confirm.onFalse();
      mutate();
      enqueueSnackbar(res.data.message);
    } catch (err) {
      enqueueSnackbar('Loan cannot be deleted because it is not latest one.', { variant: 'error' });
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
    const deleteRows = srData.filter((row) => table.selected.includes(row._id));
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
      router.push(paths.dashboard.loanPayHistory.edit(id));
    },
    [router]
  );

  if (otherLoanissueLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Other Loan pay history"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Other Loan Pay History', href: paths.dashboard.other_loanPayHistory.root },
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
                        (tab.value === 'Closed' && 'warning') ||
                        (tab.value === 'Overdue' && 'error') ||
                        'default'
                      }
                    >
                      {['Regular', 'Closed', 'Overdue'].includes(tab.value)
                        ? otherLoanissue.filter((item) => item.status === tab.value).length
                        : otherLoanissue.length}
                    </Label>
                  </>
                }
              />
            ))}
          </Tabs>
          <OtherLoanpayhistoryTableToolbar filters={filters} onFilters={handleFilters} />
          {canReset && (
            <OtherLoanpayhistoryTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <TableContainer
            sx={{
              maxHeight: '500px',
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
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                sx={{
                  ' th': { padding: '8px' },
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
                    <OtherLoanpayhistoryTableRow
                      key={row._id}
                      index={index}
                      row={row}
                      loanStatus={filters.status}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
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
      </Container>
      <BulkInterestModel open={open} setOpen={() => setOpen(false)} />
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
  const { username, status, startDate, endDate, renewStartDate, renewEndDate } = filters;
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
        item.otherName.toLowerCase().includes(username.toLowerCase()) ||
        item.code.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.firstName.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.loanNo.toLowerCase().includes(username.toLowerCase()) ||
        item.otherNumber.toLowerCase().includes(username.toLowerCase()) ||
        item.loan.customer.contact.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (status && status !== 'All') {
    inputData = inputData.filter((item) => item.status === status);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((order) => isBetween(new Date(order.date), startDate, endDate));
  }

  if (!dateError && renewStartDate && renewEndDate) {
    inputData = inputData.filter((order) =>
      isBetween(new Date(order.renewalDate), renewStartDate, renewEndDate)
    );
  }

  return inputData;
}
