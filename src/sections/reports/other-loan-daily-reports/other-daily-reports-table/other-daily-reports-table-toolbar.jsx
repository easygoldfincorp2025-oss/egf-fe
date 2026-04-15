import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { Box, Dialog, DialogActions, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../../components/custom-popover';
import { useAuthContext } from '../../../../auth/hooks';
import { getResponsibilityValue } from '../../../../permission/permission';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetBranch } from '../../../../api/branch';
import { useBoolean } from '../../../../hooks/use-boolean';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import OtherDailyReportPdf from '../../pdf/other-loan-daily-report-pdf';
import { fDate } from '../../../../utils/format-time.js';
import RHFMultiSheetExportExcel from '../../../../components/hook-form/rhf-multi-sheet-export-excel.jsx';

// ----------------------------------------------------------------------

export default function OtherDailyReportsTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  data,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const selectedBranchId =  sessionStorage.getItem('selectedBranch');
  const selectedBranch = branch?.find((b) => b._id === selectedBranchId) || 'All Branch';  const view = useBoolean();
  const filterData = {
    date: filters.startDate,
    branch:selectedBranch
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

  const customStyle = {
    maxWidth: { md: 200 },
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
            label="Date"
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
          {getResponsibilityValue('print_other_loan_daily_reports', configs, user) && (
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
            <RHFMultiSheetExportExcel
              sheets={[
                {
                  data:
                    data.LoanIssue?.map((row, index) => ({
                      '#': index + 1,
                      code: row.code || 0,
                      'Open Date': fDate(row.date),
                      'Loan no.': row.loan?.loanNo,
                      'Customer name': `${row.loan?.customer?.firstName || ''} ${row.loan?.customer?.middleName || ''} ${row.loan?.customer?.lastName || ''}`,
                      'Other name': row.otherName,
                      'Other loan no': row.otherNumber,
                      Rate: row.percentage,
                      'Gross Wt.': row.grossWt,
                      'Net Wt.': row.netWt,
                      Charge: row.otherCharge,
                      'Cash Amt.': row.cashAmount,
                      'Bank Amt.': row.bankAmount,
                      'Other Amt.': row.amount,
                      'Entry date': fDate(row.createdAt),
                    })) || [],
                  sheetName: 'NewOtherGoldLoans',
                },
                {
                  data:
                    data.interestDetail?.map((row, index) => {
                      const { from, to, days, otherLoan, interestAmount } = row;
                      const {
                        date,
                        otherName,
                        loan,
                        otherNumber,
                        percentage,
                        cashAmount,
                        bankAmount,
                        amount,
                        createdAt,
                      } = otherLoan;
                      const { loanNo, customer } = loan;
                      return {
                        '#': index + 1,
                        code: row.otherLoan.code || 0,
                        'Open Date': fDate(date),
                        'Loan no.': loanNo,
                        'Customer name': `${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`,
                        'Other name': otherName,
                        'Other loan no': otherNumber,
                        'Other Amt.': amount,
                        Rate: percentage,
                        'From date': fDate(from),
                        'To date': fDate(to),
                        Day: days,
                        'Cash Amt.': cashAmount,
                        'Bank Amt.': bankAmount,
                        'Int. amt': interestAmount,
                        'Entry date': fDate(createdAt),
                      };
                    }) || [],
                  sheetName: 'InterestDetails',
                },
                {
                  data:
                    data.partPayment?.map((row, index) => {
                      const {
                        date,
                        otherName,
                        loan,
                        otherNumber,
                        percentage,
                        otherCharge,
                        cashAmount,
                        bankAmount,
                        amount,
                        createdAt,
                        closeDate,
                        closingAmount,
                      } = row.otherLoan;
                      return {
                        '#': index + 1,
                        code: row.otherLoan.code || 0,
                        'Open Date': fDate(date),
                        'Loan no.': loan?.loanNo,
                        'Customer name': `${loan?.customer?.firstName || ''} ${loan?.customer?.middleName || ''} ${loan?.customer?.lastName || ''}`,
                        'Other name': otherName,
                        'Other loan no': otherNumber,
                        'Other amount': amount,
                        Rate: percentage,
                        Charge: otherCharge,
                        'Cash Amt.': cashAmount,
                        'Bank Amt.': bankAmount,
                        'Pay Amt.': closingAmount,
                        'Close date': fDate(closeDate),
                        'Entry date': fDate(createdAt),
                      };
                    }) || [],
                  sheetName: 'ClosedOtherGoldLoans',
                },
              ]}
              fileName="OtherLoanDailyReport"
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
              <OtherDailyReportPdf
                data={data}
                selectedBranch={selectedBranch}
                configs={configs}
                filterData={filterData}
              />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

OtherDailyReportsTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
