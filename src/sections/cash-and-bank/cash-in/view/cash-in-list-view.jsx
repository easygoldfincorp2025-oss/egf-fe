import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { paths } from 'src/routes/paths.js';
import { useBoolean } from 'src/hooks/use-boolean.js';
import Iconify from 'src/components/iconify/index.js';
import { useSnackbar } from 'src/components/snackbar/index.js';
import { ConfirmDialog } from 'src/components/custom-dialog/index.js';
import { useSettingsContext } from 'src/components/settings/index.js';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/index.js';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table/index.js';
import CashInTableToolbar from '../cash-in-table-toolbar.jsx';
import CashInTableFiltersResult from '../cash-in-table-filters-result.jsx';
import CashInTableRow from '../cash-in-table-row.jsx';
import axios from 'axios';
import { useAuthContext } from '../../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../../api/config.js';
import { LoadingScreen } from '../../../../components/loading-screen/index.js';
import { getResponsibilityValue } from '../../../../permission/permission.js';
import { useGetCashTransactions } from '../../../../api/cash-transactions.js';
import { isBetween } from '../../../../utils/format-time.js';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider.jsx';
import RHFTextField from 'src/components/hook-form/rhf-text-field.jsx';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker.jsx';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete.jsx';
import { useGetTransfer } from '../../../../api/transfer.js';
import { useGetBranch } from '../../../../api/branch.js';
import moment from 'moment/moment.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '' },
  { id: 'type', label: 'Type' },
  { id: 'detail', label: 'Detail' },
  { id: 'category', label: 'Category' },
  { id: 'date', label: 'Date' },
  { id: 'Amount', label: 'Amount' },
  { id: '', width: 88 },
];
const getCurrentMonthDates = () => {
  const now = moment();
  const startDate = now.clone().startOf('month').toDate();
  const endDate = now.clone().endOf('month').toDate();
  return { startDate, endDate };
};
const { startDate: defaultStartDate, endDate: defaultEndDate } = getCurrentMonthDates();

const defaultFilters = {
  name: '',
  startDate: defaultStartDate,
  endDate: defaultEndDate,
  category: '',
  status: '',
};

// ----------------------------------------------------------------------

export default function CashInListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const { cashTransactions, mutate, cashTransactionsLoading } = useGetCashTransactions();
  const { configs } = useGetConfigs();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(cashTransactions);
  const [filters, setFilters] = useState(defaultFilters);
  const [options, setOptions] = useState([]);
  const [openAdjustDialog, setOpenAdjustDialog] = useState(false);
  const { transfer, mutate: transferMutate } = useGetTransfer();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const [currentTransfer, setCurrentTransfer] = useState(null);
  const { branch } = useGetBranch();

  const dataFiltered = applyFilter({
    inputData: cashTransactions,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  useEffect(() => {
    fetchStates();
  }, [dataFiltered]);

  const amount =
    dataFiltered
      .filter((e) => e.category === 'Payment In')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0) -
    dataFiltered
      .filter((e) => e.category === 'Payment Out')
      .reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

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
    if (!getResponsibilityValue('delete_scheme', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/transfer/${id}`
      );
      enqueueSnackbar(res.data.message);
      confirm.onFalse();
      mutate();
    } catch (err) {
      enqueueSnackbar('Failed to delete Scheme');
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
    const deleteRows = scheme.filter((row) => table.selected.includes(row._id));
    const deleteIds = deleteRows.map((row) => row._id);
    handleDelete(deleteIds);
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = (id) => {
    const currentTransfer = transfer?.find((item) => item?._id === id);
    setCurrentTransfer(currentTransfer);
    setOpenAdjustDialog(true);
  };

  useEffect(() => {
    if (currentTransfer && openAdjustDialog) {
      const newValues = {
        branch: currentTransfer?.branch
          ? {
              label: currentTransfer?.branch?.name,
              value: currentTransfer?.branch?._id,
            }
          : null,
        adjustmentType: currentTransfer?.paymentDetail?.adjustmentType || null,
        amount: currentTransfer?.paymentDetail?.amount || '',
        adjustmentDate: currentTransfer?.adjustmentDate || new Date(),
        desc: currentTransfer?.desc || '',
      };
      resetAdjustForm(newValues);
    }
  }, [currentTransfer, openAdjustDialog]);

  const adjustDefaultValues = useMemo(
    () => ({
      branch: currentTransfer
        ? {
            label: currentTransfer?.branch?.name,
            value: currentTransfer?.branch?._id,
          }
        : null,
      adjustmentType: currentTransfer?.paymentDetail?.adjustmentType || null,
      amount: currentTransfer?.paymentDetail?.amount || '',
      adjustmentDate: currentTransfer?.adjustmentDate || new Date(),
      desc: currentTransfer?.desc || '',
    }),
    [currentTransfer]
  );

  const adjustSchema = Yup.object().shape({
    adjustmentType: Yup.string().required('Adjustment type is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be greater than 0'),
    adjustmentDate: Yup.date().required('Adjustment date is required'),
    branch: Yup.object().when([], {
      is: () => user?.role === 'Admin' && storedBranch === 'all',
      then: (schema) => schema.required('Branch is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const adjustForm = useForm({
    defaultValues: adjustDefaultValues,
    resolver: yupResolver(adjustSchema),
    mode: 'onTouched',
  });

  const { handleSubmit: handleAdjustSubmit, reset: resetAdjustForm, control } = adjustForm;

  const adjustmentTypeOptions = ['Add Cash', 'Reduce Cash'];

  const handleOpenAdjustDialog = () => {
    setOpenAdjustDialog(true);
    resetAdjustForm(adjustDefaultValues);
  };

  const handleCloseAdjustDialog = () => {
    setOpenAdjustDialog(false);
    resetAdjustForm(adjustDefaultValues);
  };

  const onAdjustCash = async (values) => {
    try {
      let parsedBranch = storedBranch;
      if (storedBranch !== 'all') {
        try {
          parsedBranch = storedBranch;
        } catch (error) {
          console.error('Error parsing storedBranch:', error);
        }
      }

      const selectedBranchId =
        parsedBranch === 'all' ? values?.branch?.value || branch?.[0]?._id : parsedBranch;

      const payload = {
        branch: selectedBranchId,
        transferType: 'Adjustment',
        desc: values.desc,
        paymentDetail: {
          amount: Number(values.amount),
          adjustmentType: values.adjustmentType,
        },
      };

      const apiUrl = currentTransfer
        ? `${import.meta.env.VITE_BASE_URL}/${user.company}/transfer/${currentTransfer._id}`
        : `${import.meta.env.VITE_BASE_URL}/${user.company}/transfer`;

      let res;

      if (currentTransfer) {
        res = await axios.put(apiUrl, payload);
        setCurrentTransfer(null);
      } else {
        res = await axios.post(apiUrl, payload);
      }

      transferMutate();
      mutate();
      setOpenAdjustDialog(false);
      enqueueSnackbar(res.data.message);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error?.message, {
        variant: 'error',
      });
    }
  };

  if (cashTransactionsLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    dataFiltered?.map((data) => {
      setOptions((item) => {
        if (!item.find((option) => option === data.status)) {
          return [...item, data.status];
        } else {
          return item;
        }
      });
    });
  }

  const excelData = cashTransactions.map((item, index) => ({
    Type: item.status,
    Detail: item.detail,
    Category: item.category,
    Date: item.date,
    amount: item.amount,
  }));

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            <Typography variant="h4" gutterBottom>
              Cash In Hand :{' '}
              <strong style={{ color: amount > 0 ? 'green' : 'red' }}>
                {Object.values(filters).some(Boolean)
                  ? Math.abs(amount).toFixed(2)
                  : amount.toFixed(2)}
              </strong>
            </Typography>
          }
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: `Cash in`, href: paths.dashboard.scheme.root },
            { name: 'List' },
          ]}
          action={
            <>
              {getResponsibilityValue('create_transfer', configs, user) && (
                <Button variant="contained" onClick={handleOpenAdjustDialog} sx={{ mb: 2 }}>
                  Adjust Cash
                </Button>
              )}
            </>
          }
          sx={{
            mb: { xs: 3, md: 1 },
          }}
        />
        <Card>
          <CashInTableToolbar
            filters={filters}
            onFilters={handleFilters}
            options={options}
            cashData={dataFiltered}
            excelData={excelData}
            totalAmount={
              <strong style={{ color: amount > 0 ? 'green' : 'red' }}>
                {Object.values(filters).some(Boolean)
                  ? Math.abs(amount).toFixed(2)
                  : amount.toFixed(2)}
              </strong>
            }
          />
          {canReset && (
            <CashInTableFiltersResult
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
                    <CashInTableRow
                      key={row._id}
                      row={row}
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
      <Dialog open={openAdjustDialog} onClose={handleCloseAdjustDialog} fullWidth maxWidth="xs">
        <DialogTitle>Cash In Hand</DialogTitle>
        <FormProvider methods={adjustForm} onSubmit={handleAdjustSubmit(onAdjustCash)}>
          <DialogContent>
            {user?.role === 'Admin' && storedBranch === 'all' && (
              <RHFAutocomplete
                sx={{ my: 2 }}
                name="branch"
                req={'red'}
                label="Branch"
                placeholder="Choose a Branch"
                options={
                  branch?.map((branchItem) => ({
                    label: branchItem?.name,
                    value: branchItem?._id,
                  })) || []
                }
                isOptionEqualToValue={(option, value) => option?.value === value?.value}
              />
            )}
            <RHFAutocomplete
              name="adjustmentType"
              label="Adjustment"
              options={adjustmentTypeOptions}
              req="red"
              fullWidth
              getOptionLabel={(option) => option || ''}
              renderOption={(props, option, { index }) => (
                <li {...props} key={index}>
                  {option}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option === value}
              sx={{ my: 2 }}
            />
            <RHFTextField
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              req="red"
            />
            <RHFDatePicker
              name="adjustmentDate"
              label="Enter Adjustment Date"
              sx={{ mb: 2 }}
              req="red"
            />
            <RHFTextField name="desc" label="Description" fullWidth sx={{ mb: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAdjustDialog} color="inherit" type="button">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {currentTransfer ? 'Save' : 'Submit'}
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, startDate, endDate, category, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (name && name.trim()) {
    inputData = inputData.filter(
      (item) =>
        item.detail.toLowerCase().includes(name.toLowerCase()) ||
        item.ref.toLowerCase().includes(name.toLowerCase()) ||
        (item?.amount).toString()?.includes(name)
    );
  }

  if (category) {
    inputData = inputData.filter((item) => item.category === category);
  }

  if (status) {
    inputData = inputData.filter((item) => item.status === status);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) => isBetween(new Date(item.date), startDate, endDate));
  }

  return inputData;
}
