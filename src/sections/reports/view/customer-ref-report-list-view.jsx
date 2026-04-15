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
import { isBetween } from '../../../utils/format-time.js';
import CustomerRefReportTableToolbar from '../custmoer-ref-report/customer-ref-report-table-toolbar.jsx';
import CustomerRefReportTableFiltersResult from '../custmoer-ref-report/customer-ref-report-table-filters-result.jsx';
import CustomerRefReportTableRow from '../custmoer-ref-report/customer-ref-report-table-row.jsx';
import { useGetCustomer } from '../../../api/customer.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '#' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'contact', label: 'Contact' },
  { id: 'joiningDate', label: 'joining date' },
  { id: 'refrance', label: 'Ref' },
  { id: 'Other Ref', label: 'Other Ref' },
  { id: 'area', label: 'area' },
];

const defaultFilters = {
  username: '',
  branch: '',
  startDate: null,
  endDate: null,
  area: '',
  ref: '',
};

const INQUIRY_REFERENCE_BY = [
  { value: 'Google', label: 'Google' },
  {
    value: 'Just Dial',
    label: 'Just Dial',
  },
  { value: 'Social Media', label: 'Social Media' },
  {
    value: 'Board Banner',
    label: 'Board Banner',
  },
  { value: 'Brochure', label: 'Brochure' },
  { value: 'Other', label: 'Other' },
];

// ----------------------------------------------------------------------

export default function CustomerRefReportListView() {
  const table = useTable();
  const { customer, customerLoading } = useGetCustomer();
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

  useEffect(() => {
    const updatedData = customer?.map((item, index) => ({
      ...item,
      srNo: index + 1,
    }));
    setSrData(updatedData);

    if (updatedData?.length > 0) {
      const areaSet = new Set();
      const referenceSet = new Set();

      updatedData.forEach((data) => {
        const area = data?.permanentAddress?.area;
        const referenceBy = data?.referenceBy;

        if (area) areaSet.add(area);
        if (referenceBy) referenceSet.add(referenceBy);
      });

      const newOptions = {
        area: Array.from(areaSet),
        ref: Array.from(referenceSet),
      };

      setOptions(newOptions);
    }
  }, [customer]);

  const denseHeight = table?.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

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

  if (customerLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer Refrance Rport"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports' },
            { name: 'Customer Refrance Rport' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <CustomerRefReportTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            options={options}
          />
          {canReset && (
            <CustomerRefReportTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered?.length}
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
              numSelected={table.selected?.length}
              rowCount={dataFiltered?.length}
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
                rowCount={dataFiltered?.length}
                numSelected={table.selected?.length}
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
                  ?.slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <CustomerRefReportTableRow key={row?._id} index={index} row={row} />
                  ))}
                <TableNoData notFound={notFound} />
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered?.length)}
                />
              </TableBody>
            </Table>
          </TableContainer>
          <TablePaginationCustom
            count={dataFiltered?.length}
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
            Are you sure want to delete <strong> {table.selected?.length} </strong> items?
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

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { username, startDate, endDate, area, ref } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (username && username.trim()) {
    inputData = inputData?.filter((item) => {
      const fullName =
        `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(username.toLowerCase()) ||
        item?.firstName.toLowerCase().includes(username.toLowerCase()) ||
        item?.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item?.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item?.contact.toLowerCase().includes(username.toLowerCase()) ||
        item?.referenceBy.toLowerCase().includes(username.toLowerCase())
      );
    });
  }

  if (area) {
    inputData = inputData.filter((item) => item.permanentAddress?.area === area);
  }

  if (ref) {
    const isPredefined = INQUIRY_REFERENCE_BY.some((r) => r.value === ref);

    inputData = inputData.filter((item) => {
      const matched = INQUIRY_REFERENCE_BY.find((r) => r.value === item.referenceBy);
      if (ref === 'Other') {
        return !matched;
      }
      return item.referenceBy === ref;
    });
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((item) =>
      isBetween(new Date(item?.joiningDate), startDate, endDate)
    );
  }

  return inputData;
}
