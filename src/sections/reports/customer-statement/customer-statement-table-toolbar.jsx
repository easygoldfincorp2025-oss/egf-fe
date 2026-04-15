import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import { Box, Dialog, DialogActions, FormControl, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import { useGetConfigs } from '../../../api/config';
import Autocomplete from '@mui/material/Autocomplete';
import { useGetCustomer } from '../../../api/customer.js';
import { useBoolean } from '../../../hooks/use-boolean.js';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import CustomerStatementPdf from '../pdf/customer-statement-pdf.jsx';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment/moment.js';
import { useGetLoanissue } from '../../../api/loanissue.js';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function CustomerStatementTableToolbar({
  data,
  filters,
  onFilters,
  dateError,
  total,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { customer } = useGetCustomer();
  const view = useBoolean();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { Loanissue } = useGetLoanissue();
  const findCustomer = customer.find((item) => item?._id === filters.customer);
  const filteredLoanIssues = Loanissue.filter((loan) => loan.customer._id === filters.customer);

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    name: `${findCustomer?.firstName || ''} ${findCustomer?.middleName || ''} ${findCustomer?.lastName || ''}`.trim(),
    code: findCustomer?.customerCode,
    loanNo: filters.loanNo || '',
    branch:findCustomer?.branch
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('username', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCustomer = useCallback(
    (event, newValue) => {
      onFilters('customer', newValue?._id || '');
      onFilters('loanNo', '');
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('startDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('startDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('startDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('endDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('endDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('endDate', null);
      }
    },
    [onFilters]
  );

  const customStyle = {
    maxWidth: { md: 500 },
    label: {
      mt: -0.8,
      fontSize: '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: { height: 7 },
  };

  const handleExport = (data) => {
    const flattenedData = [];
    let srNo = 1;

    data.forEach((row) => {
      if (row.statements?.length > 0) {
        row.statements.forEach((item) => {
          flattenedData.push({
            'Sr No': srNo++,
            'Loan No': row.loanNo,
            'Detail': item.detail,
            'Date': fDate(item.date),
            'Credit': item.credit || 0,
            'Debit': item.debit || 0,
          });
        });

        const totals = row.statements.reduce(
          (acc, item) => {
            acc.credit += Number(item.credit) || 0;
            acc.debit += Number(item.debit) || 0;
            return acc;
          },
          { credit: 0, debit: 0 }
        );

        flattenedData.push({
          'Sr No': '',
          'Loan No': '',
          'Detail': 'Total',
          'Date': '',
          'Credit': totals.credit.toFixed(2),
          'Debit': totals.debit.toFixed(2),
        });

        flattenedData.push({
          'Sr No': '',
          'Loan No': '',
          'Detail': '',
          'Date': '',
          'Credit': '',
          'Debit': '',
        });
      }
    });

    return flattenedData;
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexGrow={1}
          sx={{ width: 1, pr: 1.5 }}
        >
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, sm: 500 },
            }}
          >
            <Autocomplete
              options={customer}
              getOptionLabel={(option) =>
                `${option?.firstName || ''} ${option?.middleName || ''} ${option?.lastName || ''}`.trim()
              }
              value={customer.find((c) => c._id === filters.customer) || null}
              onChange={handleFilterCustomer}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField {...params} label="Choose Customer" className={'custom-textfield'} />
              )}
              fullWidth
            />
          </FormControl>

          {/* Loan Number Autocomplete */}
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, sm: 300 },
            }}
          >
            <Autocomplete
              multiple
              options={filteredLoanIssues}
              getOptionLabel={(option) => option.loanNo || ''}
              value={filteredLoanIssues.filter((loan) =>
                (filters.loanNo || []).includes(loan.loanNo)
              )}
              onChange={(event, newValue) => {
                const selectedLoanNos = newValue.map((loan) => loan.loanNo);
                onFilters('loanNo', selectedLoanNos);
              }}
              isOptionEqualToValue={(option, value) => option.loanNo === value.loanNo}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Loan Number(s)"
                  className={'custom-textfield'}
                />
              )}
              fullWidth
              disabled={!filters.customer}
            />
          </FormControl>
          <DatePicker
            label="Start date"
            value={filters.startDate ? moment(filters.startDate).toDate() : null}
            open={startDateOpen}
            onClose={() => setStartDateOpen(false)}
            onChange={handleFilterStartDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setStartDateOpen(true),
                fullWidth: true,
              },
            }}
            sx={{ ...customStyle }}
          />
          <DatePicker
            label="End date"
            value={filters.endDate}
            open={endDateOpen}
            onClose={() => setEndDateOpen(false)}
            onChange={handleFilterEndDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setEndDateOpen(true),
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_customer_statement', configs, user) && (
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </Stack>
        <CustomPopover
          open={popover.open}
          onClose={popover.onClose}
          arrow="right-top"
          sx={{ width: 'auto' }}
        >
          <MenuItem
            onClick={() => {
              view.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:printer-minimalistic-bold" />
            Print
          </MenuItem>
          <MenuItem>
            <RHFExportExcel
              data={handleExport(data)}
              fileName="CustomerStatement"
              sheetName="CustomerStatementSheet"
            />
          </MenuItem>
        </CustomPopover>
      </Stack>

      <Dialog fullScreen open={view.value} onClose={view.onFalse}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>
          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <CustomerStatementPdf
                data={data}
                configs={configs}
                filterData={filterData}
                total={total}
              />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

CustomerStatementTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  loanIssue: PropTypes.array,
};
