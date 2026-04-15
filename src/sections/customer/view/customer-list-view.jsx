import isEqual from 'lodash/isEqual';
import React, { useCallback, useState } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { _roles } from 'src/_mock';
import Label from 'src/components/label';
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
import CustomerTableFiltersResult from '../customer-table-filters-result';
import CustomerTableToolbar from '../customer-table-toolbar';
import CustomerTableRow from '../customer-table-row';
import { useGetCustomer } from '../../../api/customer';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { fDate, isBetween } from '../../../utils/format-time';
import { getResponsibilityValue } from '../../../permission/permission';
import { useGetConfigs } from '../../../api/config';
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/system';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CustomerDetails from './customer-details.jsx';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'In Active', label: 'In Active' },
  { value: 'Blocked', label: 'Blocked' },
  { value: 'true', label: 'Loan Active Cus.' },
  { value: 'false', label: 'Loan Inactive Cus.' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'branch', label: 'Branch' },
  { id: 'isAadharVerified', label: 'Aadhar verified', width: 180 },
  { id: 'contact', label: 'Contact', width: 180 },
  { id: 'customerCode', label: 'Customer code', width: 220 },
  { id: 'joiningDate', label: 'Joining date', width: 220 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'isLoan', label: 'IsLoan', width: 100 },
  { id: '', width: 120 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
  isAadharVerified: '',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function CustomerListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { customer, mutate, customerLoading } = useGetCustomer();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(customer);
  const [filters, setFilters] = useState(defaultFilters);
  const [openOverview, setOpenOverview] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const dataFiltered = applyFilter({
    inputData: customer,
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
    if (!getResponsibilityValue('delete_customer', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user.data?.company}/customer`,
        {
          data: { ids: id },
        }
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Customer');
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      handleDelete([id]);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = customer.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    handleDelete(deleteIds);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.customer.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const customers = customer.map((item) => ({
    'Customer code': item.customerCode,
    Name: item.firstName + ' ' + item.middleName + ' ' + item.lastName,
    Contact: item.contact,
    'OTP contact': item.otpContact,
    Email: item.email,
    DOB: fDate(item.dob),
    'Aadhar card': item.aadharCard,
    'Aadhar Verified': item.isAadharVerified === true ? 'Verified' : 'UnVerified',
    'Pan card': item.panCard,
    'Driving license': item.drivingLicense,
    'Joining date': fDate(item.joiningDate),
    'Nominee Name': item?.nominee?.name,
    'Nominee Relation': item?.nominee?.relation,
    'Nominee DoB': item?.nominee?.dob,
    Branch: item.branch.name,
    'Temporary address': `${item.temporaryAddress.street} ${item.temporaryAddress.landmark} ${item.temporaryAddress.city} , ${item.temporaryAddress.state} ${item.temporaryAddress.zipcode}`,
    'Reference By': item.referenceBy,
    Remark: item.remark,
    Status: item.status,
    IsLoan: item.isLoan === true ? 'Active' : 'InActive',
  }));

  if (customerLoading) {
    return <LoadingScreen />;
  }

  const handleViewRow = (row) => {
    const found = dataFiltered.find((item) => item._id === row._id);
    setSelectedRow(found || null);
    setOpenOverview(true);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customers"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Customer', href: paths.dashboard.customer.root },
            { name: 'List' },
          ]}
          action={
            getResponsibilityValue('create_customer', configs, user) && (
              <Button
                component={RouterLink}
                href={paths.dashboard.customer.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add Customer
              </Button>
            )
          }
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
            {STATUS_OPTIONS.map((tab) => {
              let count;
              if (tab.value === 'true') {
                count = customer.filter((user) => user.isLoan === true).length;
              } else if (tab.value === 'false') {
                count = customer.filter((user) => user.isLoan === false).length;
              } else if (['Active', 'In Active', 'Blocked', true, false].includes(tab.value)) {
                count = customer.filter(
                  (user) => user.status === tab.value || user.isLoan === tab.value
                ).length;
              } else {
                count = customer.length;
              }

              return (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        tab.value === 'all' || tab.value === filters.status ? 'filled' : 'soft'
                      }
                      color={
                        (tab.value === 'Active' && 'success') ||
                        (tab.value === 'In Active' && 'warning') ||
                        (tab.value === 'Blocked' && 'error') ||
                        (tab.value === 'true' && 'info') ||
                        (tab.value === 'false' && 'secondary') ||
                        'default'
                      }
                    >
                      {count}
                    </Label>
                  }
                />
              );
            })}
          </Tabs>
          <CustomerTableToolbar
            filters={filters}
            onFilters={handleFilters}
            customers={customers}
            customerData={dataFiltered}
            roleOptions={_roles}
          />
          {canReset && (
            <CustomerTableFiltersResult
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row._id)
                  )
                }
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
                  .map((row) => (
                    <CustomerTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                      onViewRow={handleViewRow}
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
      <Dialog open={openOverview} onClose={() => setOpenOverview(false)} maxWidth="md" fullWidth>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <DialogTitle sx={{ fontSize: '24px !important', fontWeight: '700' }}>
            Customer Overview
          </DialogTitle>
          <IconButton color="error" onClick={() => setOpenOverview(false)} sx={{ p: 2 }}>
            <Iconify icon="oui:cross-in-circle-filled" />
          </IconButton>
        </Box>
        <DialogContent>
          {selectedRow && <CustomerDetails selectedRow={selectedRow} configs={configs} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, role, isAadharVerified, startDate, endDate } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) =>
        (item.firstName && item.firstName + ' ' + item.middleName + ' ' + item.lastName)
          .toLowerCase()
          .indexOf(name.toLowerCase()) !== -1 || item.contact.trim().includes(name)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter(
      (item) => item.status === status || (item.isLoan === true ? 'true' : 'false') === status
    );
  }

  if (isAadharVerified) {
    inputData = inputData.filter(
      (item) => item.isAadharVerified === (isAadharVerified === 'Verified' ? true : false)
    );
  }

  if (role.length) {
    inputData = inputData.filter((item) => role.includes(item.role));
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((loan) =>
      isBetween(new Date(loan.joiningDate), startDate, endDate)
    );
  }

  return inputData;
}
