import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Iconify from 'src/components/iconify';
import { Box, Button, Dialog, DialogActions, FormControl, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../../components/custom-popover';
import RHFMultiSheetExportExcel from '../../../../components/hook-form/rhf-multi-sheet-export-excel.jsx';
import { useAuthContext } from '../../../../auth/hooks';
import { getResponsibilityValue } from '../../../../permission/permission';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetBranch } from '../../../../api/branch';
import { useBoolean } from '../../../../hooks/use-boolean';
import { PDFViewer } from '@react-pdf/renderer';
import { useGetLoanissue } from '../../../../api/loanissue';
import LoanDetailsPdf from '../../pdf/loan-details-pdf.jsx';
import Autocomplete from '@mui/material/Autocomplete';
import { fDate } from '../../../../utils/format-time.js';

// ----------------------------------------------------------------------

export default function LoanDetailTableToolbarTableToolbar({
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
  const { Loanissue } = useGetLoanissue();
  const { branch } = useGetBranch();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  const selectedBranch = branch?.find((b) => b._id === storedBranch) || 'All Branch';

  const view = useBoolean();

  const filterData = {
    loan: filters.loan,
    startDate: filters.startDate,
    endDate: filters.endDate,
    branch: selectedBranch,
  };
  console.log(filterData);

  const handleFilterStartDate = useCallback(
    (newValue) => {
      if (!newValue) return onFilters('startDate', null);
      const date = moment(newValue);
      onFilters('startDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      if (!newValue) return onFilters('endDate', null);
      const date = moment(newValue);
      onFilters('endDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterBranch = useCallback(
    (event, newValue) => {
      const selectedIds = newValue.map((option) => option._id);
      onFilters('branch', selectedIds);
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 355 },
    label: {
      mt: -0.8,
      fontSize: '14px',
    },
    '& .MuiInputLabel-shrink': {
      mt: 0,
    },
    input: { height: 7 },
  };

  const selectedBranchId = sessionStorage.getItem("selectedBranch");

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
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, sm: 355 } }}>

            <Autocomplete
              options={
                selectedBranchId !== "all"
                  ? Loanissue.filter(
                    (item) => String(item?.customer?.branch?._id) === String(selectedBranchId)
                  )
                  : Loanissue
              }
              getOptionLabel={(option) => option?.loanNo || ""}
              value={
                Loanissue.find(
                  (item) => String(item._id) === String(filters.loan)
                ) || null
              }
              onChange={(event, newValue) =>
                onFilters("loan", newValue ? newValue._id : null)
              }
              renderInput={(params) => <TextField {...params} label="Loan" />}
              sx={customStyle}
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
            sx={customStyle}
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
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={customStyle}
          />
          {getResponsibilityValue('print_loan_details', configs, user) && (
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
                    data.loanCloseDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No.': row.loan.loanNo,
                      'Total Loan Amount': Number(row.totalLoanAmount).toFixed(2),
                      'Interest Loan Amount': Number(row.loan.interestLoanAmount).toFixed(2),
                      'Paid Loan Amount': Number(row.totalLoanAmount - row.netAmount).toFixed(2),
                      'Pay Date': fDate(row.date),
                      'Pending Loan Amount': Number(row.netAmount - row.closingCharge).toFixed(2),
                      'Closing Charge': Number(row.closingCharge).toFixed(2),
                      'Net Amount': Number(row.netAmount).toFixed(2),
                      'Entry Date': fDate(row.createdAt),
                      'Entry By': row.entryBy,
                    })) || [],
                  sheetName: 'LoanCloseDetails',
                },
                {
                  data:
                    data.intDetails?.map((row, index) => ({
                      '#': index + 1,
                      'From Date': fDate(row.from),
                      'To Date': fDate(row.to),
                      'Loan Amount': Number(row.loan?.loanAmount).toFixed(2),
                      'Interest Rate (%)':
                        row.loan.scheme?.interestRate > 1.5 ? 1.5 : row.loan.scheme?.interestRate,
                      'Consulting Charge (%)': row.loan.consultingCharge,
                      'Total Interest': Number(
                        row.interestAmount + row.loan.consultingCharge
                      ).toFixed(2),
                      'Penalty': row.penalty,
                      'CR/DR Amount': Number(row.old_cr_dr).toFixed(2),
                      'Uchak Amount': row.uchakInterestAmount,
                      'Entry Date': fDate(row.createdAt),
                      'Days': row.days,
                      'Pay after Adjust': row.payAfterAdjust,
                      'Total Pay Amount': row.amountPaid,
                      'Entry By': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'LoanInterestDetails',
                },
                {
                  data:
                    data.uchakPayDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Date': fDate(row.date),
                      'Amount Paid': Number(row.amountPaid).toFixed(2),
                      'Remark': row.remark || '-',
                    })) || [],
                  sheetName: 'LoanUchakPayDetails',
                },
                {
                  data:
                    data.partPaymentDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Paid Date': fDate(row.date),
                      'Loan Amount': Number(row.loan?.loanAmount).toFixed(2),
                      'Interest Loan Amount': Number(row.loan?.interestLoanAmount).toFixed(2),
                      'Paid Loan Amount': Number(row.paidAmount).toFixed(2),
                      'Pending Loan Amount': Number(row.pendingAmount).toFixed(2),
                      'Entry Date': fDate(row.createdAt),
                      'Remark': row.remark || '-',
                      'Entry By': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'PartPayment',
                },
                {
                  data:
                    data.partReleaseDetails?.map((row, index) => ({
                      '#': index + 1,
                      'Loan No': row.loan.loanNo,
                      'Loan Amount': Number(row.loan.loanAmount).toFixed(2),
                      'Interest Loan Amount': Number(row.loan.interestLoanAmount).toFixed(2),
                      'Release Loan Amount': Number(row.adjustedAmount).toFixed(2),
                      'Pending Loan Amount': Number(row.pendingLoanAmount).toFixed(2),
                      'Release Date': fDate(row.date),
                      'Entry Date': fDate(row.createdAt),
                      'Remark': row.remark || '-',
                      'Entry By': `${row.entryBy?.firstName || ''} ${row.entryBy?.middleName || ''} ${row.entryBy?.lastName || ''}`,
                    })) || [],
                  sheetName: 'PartReleaseDetails',
                },
              ]}
              fileName="LoanDetails"
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
              <LoanDetailsPdf data={data} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

LoanDetailTableToolbarTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
