import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { Dialog, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import { useGetConfigs } from '../../../api/config';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetBranch } from '../../../api/branch.js';
import { useBoolean } from '../../../hooks/use-boolean.js';
import { PDFViewer } from '@react-pdf/renderer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import InterestEntryReportsPdf from '../pdf/interest-entry-reports-pdf.jsx';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { fDate } from '../../../utils/format-time.js';

// ----------------------------------------------------------------------

export default function InterestEntryReportsTableToolbar({
  filters,
  onFilters,
  data,
  dateError,
  total,
  options,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { branch } = useGetBranch();
  const view = useBoolean();
  const selectedBranch =  sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
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

  const customStyle = {
    maxWidth: { md: 350 },
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
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexGrow={1}
          sx={{ width: 1, pr: 1.5 }}
        >
          {' '}
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
          <DatePicker
            label="Start Entry date"
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
            label="End Entry date"
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
          {getResponsibilityValue('print_interest_entry_report', configs, user) && (
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
              data={data.map((row) => ({
                'Sr No': row.srNo,
                'Loan No.': row.loan.loanNo,
                'From Date': fDate(row.from),
                'To Date': fDate(row.to),
                'Loan Amount': Number(row.loan.loanAmount).toFixed(2),
                'Interest Loan Amount': Number(row.interestLoanAmount).toFixed(2),
                'Interest Rate (%)': row.loan.scheme.interestRate,
                'Interest Amount': Number(row?.interestAmount).toFixed(2) || 0,
                'Consulting Charge': Number(row?.consultingCharge).toFixed(2),
                'Penalty': row.penalty,
                'Total Interest': (row.interestAmount + row.penalty + row.consultingCharge).toFixed(2),
                'Uchak Interest Amount': row.uchakInterestAmount || 0,
                'Old CR/DR': row.old_cr_dr,
                'Adjusted Pay': row.adjustedPay,
                'Days': row.days,
                'Entry Date': fDate(row.createdAt),
                'Cash Amount': row.paymentDetail.cashAmount || 0,
                'Bank Amount': row.paymentDetail.bankAmount || 0,
                'Bank Name': row?.paymentDetail?.account?.bankName || '-',
                'Amount Paid': row.amountPaid,
                'Entry By': row.entryBy,
              }))}
              fileName="InterestEntryReport"
              sheetName="InterestEntryReportSheet"
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
              <InterestEntryReportsPdf
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

InterestEntryReportsTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
