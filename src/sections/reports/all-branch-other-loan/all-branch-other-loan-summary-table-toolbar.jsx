import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import { Autocomplete, Box, Dialog, DialogActions, IconButton, MenuItem } from '@mui/material';
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
import AllBranchOtherLoanSummaryPdf from '../pdf/all-branch-other-loan-summary-pdf.jsx';
import { fDate } from '../../../utils/format-time';

// ----------------------------------------------------------------------

export default function AllBranchOtherLoanSummaryTableToolbar({
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
  const [renewStartDateOpen, setRenewStartDateOpen] = useState(false);
  const [renewEndDateOpen, setRenewEndDateOpen] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const selectedBranch =  sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';  const view = useBoolean();
  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    renewStartDate: filters.renewStartDate,
    renewEndDate: filters.renewEndDate,
    otherName: filters.otherName,
    branch: branchName,
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

  const handleFilterRenewStartDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('renewStartDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('renewStartDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('renewStartDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterRenewEndDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('renewEndDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('renewEndDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('renewEndDate', null);
      }
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 180 },
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
        <Autocomplete
          options={options || []}
          value={filters.otherName || null}
          onChange={(event, newValue) => onFilters('otherName', newValue)}
          sx={{
            flexShrink: 0,
            width: { xs: 1, sm: 250 },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Other Name"
              variant="outlined"
              className={'custom-textfield'}
            />
          )}
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
            label="Renew Start date"
            value={filters.renewStartDate ? moment(filters.renewStartDate).toDate() : null}
            open={renewStartDateOpen}
            onClose={() => setRenewStartDateOpen(false)}
            onChange={handleFilterRenewStartDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setRenewStartDateOpen(true),
                fullWidth: true,
              },
            }}
            sx={{ ...customStyle }}
          />
          <DatePicker
            label="Renew End date"
            value={filters.renewEndDate}
            open={renewEndDateOpen}
            onClose={() => setRenewEndDateOpen(false)}
            onChange={handleFilterRenewEndDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setRenewEndDateOpen(true),
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_other_loan_all_branch_reports', configs, user) && (
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
                'Code': row.code || 0,
                'Loan No.': row.loan?.loanNo,
                'Customer Name': `${row.loan?.customer?.firstName || ''} ${row.loan?.customer?.middleName || ''} ${row.loan?.customer?.lastName || ''}`,
                'Other Name': row.otherName,
                'Other Number': row.otherNumber,
                'Interest Rate (%)': Number(row.percentage).toFixed(2) || 0,
                'Rate': Number(row.rate).toFixed(2) || 0,
                'Date': fDate(row.date),
                'Amount': row.amount,
                'Total Charge': row.totalCharge || 0,
                'Pending Days': row.pendingDay > 0 ? row.pendingDay : 0,
                'Pending Interest': Number(row.pendingInterest).toFixed(2) || 0,
                'Renewal Date': fDate(row.renewalDate) || '-',
                'Status': row.status,
              }))}
              fileName="AllBranchOtherLoanSummary"
              sheetName="AllBranchOtherLoanSummarySheet"
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
              <AllBranchOtherLoanSummaryPdf
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

AllBranchOtherLoanSummaryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
