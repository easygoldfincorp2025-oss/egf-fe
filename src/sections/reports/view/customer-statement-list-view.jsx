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
import InterestReportsTableFiltersResult from '../interest-reports/interest-reports-table-filters-result.jsx';
import CustomerStatementTableToolbar from '../customer-statement/customer-statement-table-toolbar.jsx';
import CustomerStatementTableRow from '../customer-statement/customer-statement-table-row.jsx';
import axios from 'axios';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { isBetween } from '../../../utils/format-time.js';
import { useGetLoanissue } from '../../../api/loanissue.js';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: '', label: '#' },
  { id: 'loanNo', label: 'Loan no.' },
  { id: 'date', label: 'Date' },
  { id: 'credit', label: 'Credit' },
  { id: 'debit', label: 'Debit' },
];

const defaultFilters = {
  username: '',
  customer: '',
  startDate: null,
  endDate: null,
  loanNo: '',
};

// ----------------------------------------------------------------------

export default function CustomerStatementListView() {
  const table = useTable();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [srData, setSrData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [customerStatement, setCustomerStatement] = useState({});
  const [customerStatementLoading, setCustomerStatementLoading] = useState(false);
  const { Loanissue } = useGetLoanissue();

  const dataFiltered = applyFilter({
    inputData: srData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const loanAmount = dataFiltered.reduce((prev, next) => prev + (Number(next?.loanAmount) || 0), 0);
  const intLoanAmount = dataFiltered.reduce(
    (prev, next) => prev + (Number(next?.interestLoanAmount) || 0),
    0
  );

  const amt = dataFiltered.reduce((prev, next) => prev + (Number(next?.amount) || 0), 0);

  const fetchCustomerStatement = async () => {
    if (!filters.customer) return;

    try {
      setCustomerStatementLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer-statement/${filters.customer}`
      );

      const statementData = res.data.data;
      setCustomerStatement(Object.values(statementData));
      const statement = Object.values(statementData);

      const updatedData = statement?.map((item, index) => ({
        ...item,
        srNo: index + 1,
      }));
      setSrData(updatedData);
    } catch (error) {
      console.error('Error fetching customer statement:', error);
    } finally {
      setCustomerStatementLoading(false);
    }
  };

  const total = {
    loanAmount,
    amt,
    intLoanAmount,
  };

  useEffect(() => {
    fetchCustomerStatement();
  }, [filters.customer]);

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

  if (customerStatementLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer Statement"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Customer Statement' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <CustomerStatementTableToolbar
            filters={filters}
            onFilters={handleFilters}
            data={dataFiltered}
            total={total}
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
                    <CustomerStatementTableRow key={row?._id} index={index} row={row} />
                  ))}
                <TableNoData notFound={notFound} />
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
  const { username, startDate, endDate, loan } = filters;
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
        (item.customer.firstName + ' ' + item.customer.middleName + ' ' + item.customer.lastName)
          .toLowerCase()
          .includes(username.toLowerCase()) ||
        item.loanDetails.customer.firstName.toLowerCase().includes(username.toLowerCase()) ||
        item.loanDetails.customer.middleName.toLowerCase().includes(username.toLowerCase()) ||
        item.loanDetails.customer.lastName.toLowerCase().includes(username.toLowerCase()) ||
        item.loanDetails.loanNo.toLowerCase().includes(username.toLowerCase()) ||
        item.loanDetails.customer.contact.toLowerCase().includes(username.toLowerCase())
    );
  }

  if (filters.loanNo && filters.loanNo.length > 0) {
    inputData = inputData.filter((item) => filters.loanNo.includes(item.loanNo));
  }

  if (!dateError && startDate && endDate) {

    inputData = inputData
      .map((item) => {
        // filter statements inside each loan
        const filteredStatements = item.statements.filter((statement) =>
          isBetween(new Date(statement.date), startDate, endDate)
        );

        return {
          ...item,
          statements: filteredStatements
        };
      })
      // keep only loans that still have statements after filtering
      .filter((item) => item.statements.length > 0);
  }



  return inputData;
}
