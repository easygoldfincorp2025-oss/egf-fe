import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import moment from 'moment';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import { fDate } from '../../../utils/format-time';
import { Box, Button, Dialog, DialogActions, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { useAuthContext } from '../../../auth/hooks';
import { getResponsibilityValue } from '../../../permission/permission';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetBranch } from '../../../api/branch';
import { useBoolean } from '../../../hooks/use-boolean';
import { PDFViewer } from '@react-pdf/renderer';
import AllBranchLoanSummaryPdf from '../pdf/all-branch-loan-summary-pdf.jsx';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

export default function AllBranchLoanSummaryTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  options,
  total,
}) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const view = useBoolean();
  const popover = usePopover();
  const selectedBranch = sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    issuedBy: filters.issuedBy,
    branch: branchName,
  };

  const cutoffDate = new Date('2025-08-01');

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

  const handleFilterEndDate = useCallback(
    (newValue) => {
      if (!newValue) {
        onFilters('endDate', null);
        return;
      }
      const date = moment(newValue);
      onFilters('endDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterIssuedBy = useCallback(
    (event) => {
      onFilters('issuedBy', event.target.value);
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 150 },
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
          sx={{ width: '100%', pr: 1.5 }}
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
            value={filters.issuedBy || null}
            onChange={(event, newValue) => handleFilterIssuedBy({ target: { value: newValue } })}
            options={options}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={(option, value) => option?.name === value?.name}
            renderInput={(params) => (
              <TextField {...params} label="Issued By" className={'custom-textfield'} />
            )}
            sx={{ width: { xs: '100%', sm: 450 } }}
          />
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
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_loan_report', configs, user) && (
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
              data={
                dataFilter?.map((row, index) => ({
                  'Sr No': index + 1,
                  'Loan No.': row.loanNo,
                  'Customer Name': `${row.customer?.firstName || ''} ${row.customer?.middleName || ''} ${row.customer?.lastName || ''}`,
                  Contact: row.customer?.contact,
                  'Interest Rate (%)':
                    new Date(row.issueDate) < cutoffDate
                      ? Number(
                          row.scheme?.interestRate > 1.5 ? 1.5 : row.scheme?.interestRate
                        ).toFixed(2)
                      : 1,

                  'Other Interest (%)': Number(row.consultingCharge).toFixed(2) || 0,
                  'Issue Date': fDate(row.issueDate),
                  'Loan Amount': row.loanAmount,
                  'Total Wt': row.propertyDetails
                    .reduce((prev, next) => prev + (Number(next?.totalWeight) || 0), 0)
                    .toFixed(2),
                  'Gross Wt': row.propertyDetails
                    .reduce((prev, next) => prev + (Number(next?.grossWeight) || 0), 0)
                    .toFixed(2),
                  'Net Wt': row.propertyDetails
                    .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
                    .toFixed(2),
                  'Last Amount Pay Date': fDate(row.lastAmtPayDate) || '-',
                  'Loan Amount Pay': parseFloat(
                    (row.loanAmount - row.interestLoanAmount).toFixed(2)
                  ),
                  'Interest Loan Amount': row.interestLoanAmount,
                  'Payment Mode': row.paymentMode,
                  'Cash Amt': row.cashAmount,
                  'Bank Amt': row.bankAmount,
                  'Bank Name': row?.companyBankDetail?.account?.bankName || '-',
                  'Approval Charge': row.approvalCharge || 0,
                  Status: row.status,
                })) || []
              }
              fileName="Loan Report"
              sheetName="LoanReportSheet"
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
              <AllBranchLoanSummaryPdf
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

AllBranchLoanSummaryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  dateError: PropTypes.bool,
  dataFilter: PropTypes.array,
  configs: PropTypes.object,
  options: PropTypes.array,
  total: PropTypes.number,
};
