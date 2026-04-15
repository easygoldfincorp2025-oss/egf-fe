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
import axios from 'axios';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetInquiry } from 'src/api/inquiry';
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
import { useAuthContext } from 'src/auth/hooks';
import InquiryTableRow from '../inquiry-table-row';
import InquiryTableToolbar from '../inquiry-table-toolbar';
import InquiryTableFiltersResult from '../inquiry-table-filters-result';
import { fDate, isAfter, isBetween } from '../../../utils/format-time';
import { LoadingScreen } from '../../../components/loading-screen';
import { Autocomplete, Box, FormControl, TextField } from '@mui/material';
import Iconify from '../../../components/iconify';
import { useGetEmployee } from '../../../api/employee';
import { useGetBranch } from '../../../api/branch';
import * as xlsx from 'xlsx';
import { getResponsibilityValue } from '../../../permission/permission';
import { useGetConfigs } from '../../../api/config';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Label from '../../../components/label';
import Tabs from '@mui/material/Tabs';

// ----------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  {
    value: 'Responded',
    label: 'Responded',
  },
  { value: 'Completed', label: 'Completed' },
  {
    value: 'Not Responded',
    label: 'Not Responded',
  },
];

const TABLE_HEAD = [
  { id: 'date', label: 'Date' },
  { id: 'recallingDate', label: 'Recalling date' },
  { id: 'assignTo', label: 'Assign to' },
  { id: 'name', label: 'Name' },
  { id: 'contact', label: 'Contact' },
  { id: 'inquiryFor', label: 'Inquiry for' },
  { id: 'remark', label: 'Remark' },
  { id: 'isActive', label: 'Status' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  startRecallingDate: null,
  endRecallingDate: null,
  assignTo: '',
  inquiryFor: '',
};

// ----------------------------------------------------------------------

export default function InquiryListView() {
  const { enqueueSnackbar } = useSnackbar();
  const { inquiry, mutate, inquiryLoading } = useGetInquiry();
  const { employee } = useGetEmployee();
  const { configs } = useGetConfigs();
  const { branch } = useGetBranch();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const table = useTable();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState(inquiry);
  const [filters, setFilters] = useState(defaultFilters);
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchStates();
  }, [inquiry]);

  const dataFiltered = applyFilter({
    inputData: inquiry,
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
  const dateError = isAfter(filters.startDate, filters.endDate);

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

  const handleDelete = (id) => {
    if (!getResponsibilityValue('delete_inquiry', configs, user)) {
      enqueueSnackbar('You do not have permission to delete.', { variant: 'error' });
      return;
    }

    axios
      .delete(`${import.meta.env.VITE_BASE_URL}/${user.data?.company}/inquiry`, {
        data: { ids: id },
      })
      .then((res) => {
        enqueueSnackbar(res.data.message);
        confirm.onFalse();
        mutate();
      })
      .catch(() => enqueueSnackbar('Failed to delete Inquiry'));
  };

  const handleDeleteRow = useCallback(
    (id) => {
      if (id) {
        handleDelete([id]);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(dataInPage.length);
      }
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = inquiry.filter((row) => table.selected.includes(row._id));
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
      router.push(paths.dashboard.inquiry.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('inquiry-file', file);

      const mainbranchid = branch?.find((e) => e?._id === selectedBranch);
      let parsedBranch = storedBranch;

      if (storedBranch !== 'all') {
        try {
          parsedBranch = JSON.parse(storedBranch);
        } catch (error) {
          console.error('Error parsing storedBranch:', error);
        }
      }

      const branchQuery =
        parsedBranch && parsedBranch === 'all'
          ? `branch=${mainbranchid?._id}`
          : `branch=${parsedBranch}`;

      const employeeQuery = user?.role === 'Admin' ? `&assignTo=${selectedEmployee}` : ``;

      const queryString = `${branchQuery}${employeeQuery}`;

      axios
        .post(
          `${import.meta.env.VITE_BASE_URL}/${user?.company}/bulk-inquiry?${queryString}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response) => {
          enqueueSnackbar('File uploaded successfully');
          document.getElementById('file-upload').value = '';
          setSelectedEmployee(null);
          setSelectedBranch(null);
          mutate();
        })
        .catch((error) => {
          enqueueSnackbar('Failed to upload the file');
        });
    } else {
      enqueueSnackbar('Please select a valid file');
    }
  };

  const handleDownload = () => {
    const sampleData = [
      {
        firstName: 'john',
        lastName: 'li',
        contact: '7845127845',
        email: 'john@gmail.com',
        date: '22-05-2024',
        recallingDate: '23-02-2024',
        inquiryFor: 'Gold loan ',
        remark: 'your remark',
        response: 'Active',
        address: 'your address',
      },
    ];
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, 'downloadSample.xlsx');
  };

  const inquiries = inquiry.map((item) => ({
    Date: fDate(item.date),
    'Assign To': `${item.assignTo.user.firstName} ${item.assignTo.user.middleName} ${item.assignTo.user.lastName}`,
    Name: item.firstName + ' ' + item.lastName,
    Contact: item.contact,
    Email: item.email,
    Branch: item.branch.name,
    'inquiry for': item.inquiryFor,
    'Recalling date': fDate(item.recallingDate),
    Address: item.address,
    Remark: item.remark,
    Status: item.status,
  }));

  if (inquiryLoading) {
    return <LoadingScreen />;
  }

  function fetchStates() {
    const updatedOptions = [];

    dataFiltered?.forEach((data) => {
      const userId = data?.assignTo?.user?._id;
      const inquiryFor = data?.inquiryFor;

      const existingIndex = updatedOptions.findIndex((opt) => opt.value === userId);

      if (existingIndex !== -1) {
        const existingOption = updatedOptions[existingIndex];
        if (!existingOption.inquiryFor.includes(inquiryFor)) {
          existingOption.inquiryFor.push(inquiryFor);
        }
      } else {
        updatedOptions.push({
          name: `${data?.assignTo?.user?.firstName} ${data?.assignTo?.user?.middleName} ${data?.assignTo?.user?.lastName}`,
          value: userId,
          inquiryFor: [inquiryFor],
        });
      }
    });

    setOptions(updatedOptions);
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Inquiries"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Inquiry', href: paths.dashboard.inquiry.root },
            { name: 'List' },
          ]}
          action={
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
              {user?.role === 'Admin' &&
                branch &&
                storedBranch === 'all' &&
                getResponsibilityValue('bulk_inquiry_detail', configs, user) && (
                  <FormControl
                    sx={{
                      flexShrink: 0,
                      width: { xs: '100%', md: 200 },
                      margin: '0px 10px',
                    }}
                  >
                    <Autocomplete
                      disablePortal
                      options={branch.map((option) => ({
                        label: option.name,
                        value: option._id,
                      }))}
                      value={
                        branch
                          ?.map((option) => ({
                            label: option.name,
                            value: option._id,
                          }))
                          ?.find((option) => option.value === selectedBranch) || null
                      }
                      onChange={(e, newValue) => {
                        setSelectedBranch(newValue?.value || '');
                        setSelectedEmployee('');
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Branch" className="custom-textfield" />
                      )}
                    />
                  </FormControl>
                )}
              {user?.role === 'Admin' && employee && (
                <FormControl
                  sx={{
                    flexShrink: 0,
                    width: { xs: '100%', md: 200 },
                    margin: '0px 10px',
                  }}
                  disabled={!selectedBranch}
                >
                  <Autocomplete
                    disablePortal
                    options={employee.map((item) => ({
                      label: `${item?.user?.firstName} ${item?.user?.lastName}`,
                      value: item._id,
                    }))}
                    value={
                      employee
                        ?.map((item) => ({
                          label: `${item?.user?.firstName} ${item?.user?.lastName}`,
                          value: item._id,
                        }))
                        ?.find((option) => option.value === selectedEmployee) || null
                    }
                    onChange={(e, newValue) => {
                      setSelectedEmployee(newValue?.value || '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Employee" className="custom-textfield" />
                    )}
                  />
                </FormControl>
              )}
              {getResponsibilityValue('bulk_inquiry_detail', configs, user) && (
                <>
                  <Box display="flex" alignItems="center" mx={1}>
                    <input
                      disabled={!selectedEmployee}
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        disabled={!selectedEmployee}
                        component="span"
                        startIcon={<Iconify icon="mdi:file-upload" />}
                      >
                        Select Excel File
                      </Button>
                    </label>
                  </Box>
                  <Button variant="contained" sx={{ mx: 1 }} onClick={handleDownload}>
                    Download Sample File
                  </Button>
                </>
              )}
              {getResponsibilityValue('create_inquiry', configs, user) && (
                <Button
                  component={RouterLink}
                  href={paths.dashboard.inquiry.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Add Inquiry
                </Button>
              )}
            </Box>
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
                        ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'Active' && 'info') ||
                        (tab.value === 'Responded' && 'warning') ||
                        (tab.value === 'Completed' && 'success') ||
                        (tab.value === 'Not Responded' && 'error') ||
                        'default'
                      }
                    >
                      {['Active', 'Responded', 'Completed', 'Not Responded'].includes(tab.value)
                        ? inquiry.filter((inq) => String(inq.status) === tab.value).length
                        : inquiry.length}
                    </Label>
                  </>
                }
              />
            ))}
          </Tabs>
          <InquiryTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dateError={dateError}
            inquiries={inquiries}
            inquiriesDate={inquiry}
            options={options}
          />
          {canReset && (
            <InquiryTableFiltersResult
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
                    <InquiryTableRow
                      key={row._id}
                      row={row}
                      mutate={mutate}
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
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const {
    status,
    name,
    startDate,
    endDate,
    assignTo,
    inquiryFor,
    endRecallingDate,
    startRecallingDate,
  } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (name && name.trim()) {
    inputData = inputData.filter(
      (item) =>
        (item.firstName && item.firstName + ' ' + item.lastName)
          .toLowerCase()
          .includes(name.toLowerCase()) ||
        item.remark.toLowerCase().includes(name.toLowerCase()) ||
        item.contact.trim().includes(name)
    );
  }

  if (assignTo) {
    inputData = inputData.filter((item) => item?.assignTo?.user?._id === assignTo?.value);
  }

  if (inquiryFor) {
    inputData = inputData.filter((item) => item?.inquiryFor === inquiryFor);
  }

  if (startDate && endDate) {
    inputData = inputData.filter((user) => isBetween(user.date, startDate, endDate));
  }

  if (startRecallingDate && endRecallingDate) {
    inputData = inputData.filter((user) =>
      isBetween(user.recallingDate, startRecallingDate, endRecallingDate)
    );
  }

  return inputData;
}
