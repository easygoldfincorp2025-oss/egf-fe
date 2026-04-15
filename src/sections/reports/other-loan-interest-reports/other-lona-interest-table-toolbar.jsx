import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import { Box, Dialog, DialogActions, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { useAuthContext } from '../../../auth/hooks';
import { getResponsibilityValue } from '../../../permission/permission';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetBranch } from '../../../api/branch';
import { useBoolean } from '../../../hooks/use-boolean';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import OtherLoanInterestPdf from '../pdf/other-loan-interest-pdf.jsx';
import { fDate } from '../../../utils/format-time.js';

// ----------------------------------------------------------------------

export default function OtherLonaInterestTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  options,
  total,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startPayDateOpen, setStartPayDateOpen] = useState(false);
  const [endPayDateOpen, setEndPayDateOpen] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const selectedBranch =  sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';  const view = useBoolean();
  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    startPayDate: filters.startPayDate,
    endPayDate: filters.endPayDate,
    issuedBy: filters.issuedBy,
    branch:branchName,
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('username', event.target.value);
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
  const handleFilterStartPayDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('startPayDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('startPayDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('startPayDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterEndPayDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('endPayDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('endPayDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('endPayDate', null);
      }
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 200 },
    label: {
      mt: -0.8,
      fontSize: '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: { height: 7 },
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
        <TextField
          sx={{ input: { height: 7 } }}
          fullWidth
          value={filters.username}
          onChange={handleFilterName}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexGrow={1}
          sx={{ width: '100%', pr: 1.5 }}
        >
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
          <DatePicker
            label="Start Pay Date"
            value={filters.startPayDate ? moment(filters.startPayDate).toDate() : null}
            open={startPayDateOpen}
            onClose={() => setStartPayDateOpen(false)}
            onChange={handleFilterStartPayDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setStartPayDateOpen(true),
                fullWidth: true,
              },
            }}
            sx={{ ...customStyle }}
          />
          <DatePicker
            label="End Pay Date"
            value={filters.endPayDate}
            open={endPayDateOpen}
            onClose={() => setEndPayDateOpen(false)}
            onChange={handleFilterEndPayDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setEndPayDateOpen(true),
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_other_loan_interest', configs, user) && (
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
              popover.onClose();
              view.onTrue();
            }}
          >
            <Iconify icon="solar:printer-minimalistic-bold" />
            Print
          </MenuItem>
          <MenuItem>
            <RHFExportExcel
              data={dataFilter.map((row, index) => ({
                '#': index + 1,
                code: row.code || 0,
                'Loan No.': row.loan?.loanNo,
                'Customer Name': `${row.loan?.customer?.firstName || ''} ${row.loan?.customer?.middleName || ''} ${row.loan?.customer?.lastName || ''}`,
                'Other Name': row.otherName,
                'Other Number': row.otherNumber,
                'Interest Rate (%)': Number(row.percentage).toFixed(2) || 0,
                Date: fDate(row.date),
                Amount: row.amount,
                'Total Charge': (row.totalCharge || 0).toFixed(2),
                Days: row.day > 0 ? row.day : 0,
                'Net Interest Amount': (row.totalInterestAmt - row.totalCharge).toFixed(2),
                'Last Interest Pay Date': fDate(row.createdAt) || '-',
                'Pending Days': row.pendingDay > 0 ? row.pendingDay : 0,
                'Pending Interest': Number(row.pendingInterest).toFixed(2) || 0,
                'Renewal Date': fDate(row.renewalDate) || '-',
                Status: row.status,
              }))}
              fileName="OtherLoanInterest"
              sheetName="OtherLoanInterestSheet"
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
              <OtherLoanInterestPdf
                loans={dataFilter}
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

OtherLonaInterestTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
