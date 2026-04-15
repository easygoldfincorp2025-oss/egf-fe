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
import DailyReportPdf from '../../pdf/daily-report-pdf.jsx';
import { fDate } from '../../../../utils/format-time';
import RHFMultiSheetExportExcel from '../../../../components/hook-form/rhf-multi-sheet-export-excel.jsx';

export default function DailyReportsTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  data,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const view = useBoolean();
  const selectedBranchId = sessionStorage.getItem('selectedBranch');
  const selectedBranch = branch?.find((b) => b._id === selectedBranchId) || 'All Branch';

  const filterData = {
    branch: selectedBranch,
    date: filters.startDate,
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('username', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      if (!newValue) {
        onFilters('startDate', null);
        return;
      }
      const date = moment(newValue);
      onFilters('startDate', date.isValid() ? date.toDate() : null);
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
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
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
            sx={customStyle}
          />
          {getResponsibilityValue('print_daily_reports', configs, user) && (
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
                    data.loanDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No.': row.loanNo,
                      'Customer Name': `${row.customer?.firstName || ''} ${row.customer?.middleName || ''} ${row.customer?.lastName || ''}`,
                      'Loan Amt': Number(row.loanAmount).toFixed(2),
                      'Int. (%)': Number(
                        row.scheme?.interestRate > 1.5 ? 1.5 : row.scheme?.interestRate
                      ).toFixed(2),
                      'Con. (%)': Number(row.consultingCharge).toFixed(2),
                      'Approval Charge': Number(row.approvalCharge).toFixed(2),
                      'Issue Date': fDate(row.issueDate),
                      'Entry by': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'NewGoldLoan',
                },
                {
                  data:
                    data.loanIntDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No.': row.loan.loanNo,
                      'Customer Name': `${row.loan.customer?.firstName || ''} ${row.loan.customer?.middleName || ''} ${row.loan.customer?.lastName || ''}`,
                      'From Date': fDate(row.from),
                      'To Date': fDate(row.to),
                      'Loan Amount': Number(row.loan.loanAmount).toFixed(2),
                      'Int. (%)': Number(
                        row.loan.scheme?.interestRate > 1.5 ? 1.5 : row.loan.scheme?.interestRate
                      ).toFixed(2),
                      'Con. (%)': Number(row.loan.consultingCharge).toFixed(2),
                      'Int. Amt': Number(row.interestAmount).toFixed(2),
                      'Entry by': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'InterestDetails',
                },
                {
                  data:
                    data.partReleaseDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No': row.loan.loanNo,
                      'Customer Name': `${row.loan.customer?.firstName || ''} ${row.loan.customer?.middleName || ''} ${row.loan.customer?.lastName || ''}`,
                      'Release Date': fDate(row.releaseDate),
                      'Release Amount': Number(row.releaseAmount).toFixed(2),
                      'Release Weight': Number(row.releaseWeight).toFixed(3),
                      'Entry By': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'PartReleaseDetails',
                },
                {
                  data:
                    data.uchakIntDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No.': row.loan.loanNo,
                      'Customer Name': `${row.loan.customer?.firstName || ''} ${row.loan.customer?.middleName || ''} ${row.loan.customer?.lastName || ''}`,
                      'Amount Paid': Number(row.amountPaid).toFixed(2),
                      Remark: row.remark,
                      'Entry by': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'UchakInterest',
                },
                {
                  data:
                    data.partPaymentDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No': row.loan.loanNo,
                      'Customer Name': `${row.loan.customer?.firstName || ''} ${row.loan.customer?.middleName || ''} ${row.loan.customer?.lastName || ''}`,
                      'Paid Date': fDate(row.date),
                      'Paid Amount': Number(row.paidAmount).toFixed(2),
                      'Entry By': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'PartPayment',
                },
                {
                  data:
                    data.closedLoans?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No.': row.loan.loanNo,
                      'Customer Name': `${row.loan.customer?.firstName || ''} ${row.loan.customer?.middleName || ''} ${row.loan.customer?.lastName || ''}`,
                      'Close Date': fDate(row.date),
                      'Total Loan Amount': Number(row.totalLoanAmount).toFixed(2),
                      'Interest Loan Amount': Number(row.loan.interestLoanAmount).toFixed(2),
                      'Net Amount': Number(row.netAmount).toFixed(2),
                      'Closing Charge': Number(row.closingCharge).toFixed(2),
                      'Net Paid Amount': Number(row.netAmount - row.closingCharge).toFixed(2),
                      'Entry by': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'ClosedLoan',
                },
              ]}
              fileName="DailyReport"
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
              <DailyReportPdf
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

DailyReportsTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  dateError: PropTypes.bool,
  dataFilter: PropTypes.object,
  configs: PropTypes.object,
  data: PropTypes.array,
};
