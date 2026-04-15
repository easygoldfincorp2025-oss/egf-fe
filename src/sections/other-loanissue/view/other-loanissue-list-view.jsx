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
import { RouterLink } from 'src/routes/components';
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
import OtherLoanissueTableRow from '../other-loanissue-table-row';
import OtherLoanissueTableToolbar from '../other-loanissue-table-toolbar';
import OtherLoanissueTableFiltersResult from '../other-loanissue-table-filters-result';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetConfigs } from '../../../api/config';
import { getResponsibilityValue } from '../../../permission/permission';
import { useGetOtherLoanissue } from '../../../api/other-loan-issue.js';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import OtherLoanIssueDetails from './other-loan-issue-details';
import { Box } from '@mui/system';
import { useGetChargeInOut } from '../../../api/charge-in-out.js';
import Tabs from '@mui/material/Tabs';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label/index.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '#', label: '#' },
  { id: 'code', label: 'Code' },
  { id: 'LoanNo', label: 'Loan No.' },
  { id: 'CustomerName', label: 'Customer name' },
  { id: 'otherName', label: 'Other name' },
  { id: 'otherNo', label: 'Other no' },
  { id: 'openDate', label: 'Open date' },
  { id: 'createdAt', label: 'Entry date' },
  { id: 'ContactNo', label: 'Contact' },
  { id: 'InterestLoanAmount', label: 'Int. loan amt' },
  { id: 'InterestRate', label: 'Int. rate' },
  { id: 'cashAmount', label: 'Cash amt' },
  { id: 'bankAmount', label: 'Bank amt' },
  { id: 'status', label: 'Status' },
  { id: '', width: 88 },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Overdue', label: 'Overdue' },
];

const defaultFilters = {
  username: '',
  status: 'All',
};

// ----------------------------------------------------------------------

export default function OtherLoanissueListView() {
  const { ChargeInOut } = useGetChargeInOut();
  const { otherLoanissue, otherLoanissueLoading, mutate } = useGetOtherLoanissue();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(otherLoanissue);
  const [filters, setFilters] = useState(defaultFilters);
  const [srData, setSrData] = useState([]);
  const [openOverview, setOpenOverview] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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
    if (!getResponsibilityValue('delete_other_loan_issue', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }

    try {
      const currentLoan = otherLoanissue?.find((item) => item?._id === id);
      const loanNo = currentLoan?.loan?.loanNo;

      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loan/${id}`
      );

      let chargesDeleted = 0;

      if (loanNo) {
        const relatedCharges = ChargeInOut?.filter(
          (charge) =>
            charge?.status === 'Payment Out' &&
            charge?.category === loanNo &&
            charge?.chargeType === 'APPROVAL CHARGE'
        );

        if (relatedCharges?.length) {
          await Promise.all(
            relatedCharges.map((c) =>
              axios.delete(`${import.meta.env.VITE_BASE_URL}/${user?.company}/charge/${c._id}`)
            )
          );
          chargesDeleted = relatedCharges.length;
        }
      }

      enqueueSnackbar(
        `${res.data.message} (Deleted ${chargesDeleted} related charge${chargesDeleted !== 1 ? 's' : ''})`,
        { variant: 'success' }
      );

      confirm.onFalse();
      mutate();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to delete loan or related charges', { variant: 'error' });
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
      router.push(paths.dashboard.other_loanissue.edit(id));
    },
    [router]
  );

  const handleClick = useCallback(
    (id) => {
      router.push(paths.dashboard.disburse.new(id));
    },
    [router]
  );

  const handleViewRow = (row) => {
    const found = srData.find((item) => item._id === row._id);
    setSelectedRow(found || null);
    setOpenOverview(true);
  };

  if (otherLoanissueLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Other Issued Loans"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Other Loan Issue', href: paths.dashboard.other_loanissue.root },
            { name: ' List' },
          ]}
          action={
            getResponsibilityValue('create_other_loan_issue', configs, user) && (
              <>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.other_loanissue.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Add Other Loan issue
                </Button>
              </>
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
              const count =
                tab.value === 'All'
                  ? otherLoanissue.length
                  : otherLoanissue.filter((item) => item.status === tab.value).length;

              return (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  iconPosition="end"
                  icon={
                    <Label
                      sx={{ ml: 0.5 }}
                      variant={filters.status === tab.value ? 'filled' : 'soft'}
                      color={
                        (tab.value === 'Regular' && 'success') ||
                        (tab.value === 'Issued' && 'info') ||
                        (tab.value === 'Closed' && 'warning') ||
                        (tab.value === 'Overdue' && 'error') ||
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
          <OtherLoanissueTableToolbar filters={filters} onFilters={handleFilters} />
          {canReset && (
            <OtherLoanissueTableFiltersResult
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
                    <OtherLoanissueTableRow
                      key={row._id}
                      row={row}
                      handleClick={() => handleClick(row._id)}
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
            Other Loan Overview
          </DialogTitle>
          <IconButton color="error" onClick={() => setOpenOverview(false)} sx={{ p: 2 }}>
            <Iconify icon="oui:cross-in-circle-filled" />
          </IconButton>
        </Box>
        <DialogContent>
          {selectedRow && <OtherLoanIssueDetails selectedRow={selectedRow} configs={configs} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters }) {
  const { username, status } = filters;

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
          item?.loan?.customer?.firstName +
          ' ' +
          item?.loan?.customer?.middleName +
          ' ' +
          item?.loan?.customer?.lastName
        )
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item?.loan?.customer?.firstName.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer?.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer?.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.loanNo?.toLowerCase().includes(username.toLowerCase()) ||
        item?.loan?.customer?.contact.toLowerCase().includes(username.toLowerCase()) ||
        item?.otherNumber.includes(username)
    );
  }

  if (status && status !== 'All') {
    inputData = inputData.filter((item) => item.status === status);
  }

  return inputData;
}
