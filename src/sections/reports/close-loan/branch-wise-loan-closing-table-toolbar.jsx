import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  MenuItem,
} from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import { useAuthContext } from '../../../auth/hooks';
import { useGetBranch } from '../../../api/branch';
import { useBoolean } from '../../../hooks/use-boolean';
import { PDFViewer } from '@react-pdf/renderer';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BranchWiseLoanClosingPdf from '../pdf/branch-wise-loan-closing-pdf.jsx';
import { getResponsibilityValue } from '../../../permission/permission';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { fDate } from '../../../utils/format-time';
import InputAdornment from '@mui/material/InputAdornment';

export default function BranchWiseLoanClosingTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  options,
  total,
}) {
  const popover = usePopover();
  const view = useBoolean();
  const { user } = useAuthContext();
  const { branch } = useGetBranch();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startCloseDateOpen, setStartCloseDateOpen] = useState(false);
  const [endCloseDateOpen, setEndCloseDateOpen] = useState(false);
  const selectedBranch = sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    startCloseDate: filters.startCloseDate,
    endCloseDate: filters.endCloseDate,
    closedBy: filters.closedBy,
    branch: branchName,
  };
  const handleFilterName = useCallback(
    (event) => {
      onFilters('username', event.target.value);
    },
    [onFilters]
  );

  const handleFilterIssuedBy = useCallback(
    (event, newValue) => {
      onFilters('closedBy', newValue);
    },
    [onFilters]
  );

  const handleFilterBranch = useCallback(
    (event, newValue) => {
      onFilters('branch', newValue);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue ? moment(newValue).toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue ? moment(newValue).toDate() : null);
    },
    [onFilters]
  );

  const handleFilterStartCloseDate = useCallback(
    (newValue) => {
      onFilters('startCloseDate', newValue ? moment(newValue).toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndCloseDate = useCallback(
    (newValue) => {
      onFilters('endCloseDate', newValue ? moment(newValue).toDate() : null);
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 160 },
    label: {
      mt: -0.8,
      fontSize: '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: { height: 7 },
  };

  const cutoffDate = moment('2025-08-01').toDate();

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
            options={options}
            getOptionLabel={(option) => option?.name || ''}
            value={filters.closedBy || null}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={handleFilterIssuedBy}
            renderInput={(params) => (
              <TextField {...params} label="Closed By" className={'custom-textfield'} />
            )}
            sx={{ width: 500 }}
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
            value={filters.endDate ? moment(filters.endDate).toDate() : null}
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
          <DatePicker
            label="Start close date"
            value={filters.startCloseDate ? moment(filters.startCloseDate).toDate() : null}
            open={startCloseDateOpen}
            onClose={() => setStartCloseDateOpen(false)}
            onChange={handleFilterStartCloseDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setStartCloseDateOpen(true),
              },
            }}
            sx={{ ...customStyle }}
          />
          <DatePicker
            label="End close date"
            value={filters.endCloseDate ? moment(filters.endCloseDate).toDate() : null}
            open={endCloseDateOpen}
            onClose={() => setEndCloseDateOpen(false)}
            onChange={handleFilterEndCloseDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setEndCloseDateOpen(true),
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_branch_vise_loan_closing_report', configs, user) && (
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
                'Loan No.': row.loanNo,
                'Customer Name': `${row.customer?.firstName || ''} ${row.customer?.middleName || ''} ${row.customer?.lastName || ''}`,
                Contact: row.customer?.contact,
                'Interest Rate (%)':
                  new Date(row?.issueDate) < cutoffDate
                    ? Number(
                        row?.scheme?.interestRate > 1.5
                          ? 1.5
                          : row?.scheme?.interestRate
                      ).toFixed(2)
                    : 1,
                'Consulting Charge': Number(row.consultingCharge).toFixed(2),
                'Issue Date': fDate(row.issueDate),
                'Loan Amount': row.loanAmount,
                'Last Interest Pay Date': fDate(row.lastInstallmentDate) || '-',
                'Total Interest Pay': Number(row.totalPaidInterest).toFixed(2),
                Days: row.day > 0 ? row.day : 0,
                'Close Date': fDate(row.closedDate) || '-',
                'Approval Charge': row.approvalCharge || 0,
                'Close Charge': row.closeCharge || 0,
                'Close Amount': row.loanAmount.toFixed(2),
                'Payment Mode': row.paymentMode,
                'Cash Amt': row.cashAmount,
                'Bank Amt': row.bankAmount,
                'Bank Name': row?.companyBankDetail?.account?.bankName || '-',
                'Close By': `${row.closedBy?.firstName || ''} ${row.closedBy?.middleName || ''} ${row.closedBy?.lastName || ''}`,
                Status: row.status,
              }))}
              fileName="loan closin report"
              sheetName="LoanClosingReportSheet"
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
              <BranchWiseLoanClosingPdf
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

BranchWiseLoanClosingTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  dateError: PropTypes.bool,
  dataFilter: PropTypes.array,
  configs: PropTypes.object,
  options: PropTypes.array,
  total: PropTypes.number,
};
