import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import { Box, Dialog, DialogActions, IconButton, MenuItem, Autocomplete } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { useAuthContext } from '../../../auth/hooks';
import { getResponsibilityValue } from '../../../permission/permission';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useBoolean } from '../../../hooks/use-boolean';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import TotalInOutLoanReports from '../pdf/total-in-out-loan-reports.jsx';
import { fDate } from '../../../utils/format-time.js';
import { useGetBranch } from '../../../api/branch.js';

// ----------------------------------------------------------------------

export default function TotalAllInOutLoanReportsTableToolbar({
  filters,
  onFilters,
  dateError,
  dataFilter,
  configs,
  total,
  codeOptions,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startOtherDateOpen, setStartOtherDateOpen] = useState(false);
  const [endOtherDateOpen, setEndOtherDateOpen] = useState(false);
  const { user } = useAuthContext();
  const view = useBoolean();
  const { branch } = useGetBranch();

  const selectedBranchId =  sessionStorage.getItem('selectedBranch');
  const selectedBranch = branch?.find((b) => b._id === selectedBranchId) || 'All Branch';


  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    startOtherDate: filters.startOtherDate,
    endOtherDate: filters.endOtherDate,
    code: filters.code,
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
  const handleFilterStartOtherDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('startOtherDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('startOtherDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('startOtherDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterEndOtherDate = useCallback(
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        onFilters('endOtherDate', null);
        return;
      }
      const date = moment(newValue);
      if (date.isValid()) {
        onFilters('endOtherDate', date.toDate());
      } else {
        console.warn('Invalid date selected');
        onFilters('endOtherDate', null);
      }
    },
    [onFilters]
  );

  const handleFilterCode = useCallback(
    (event, newValue) => {
      onFilters('code', newValue);
    },
    [onFilters]
  );

  const customStyle = {
    minWidth: { md: 140 },
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
          <Autocomplete
            value={filters.code || null}
            onChange={handleFilterCode}
            options={codeOptions || []}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={(option, value) => option?.code === value?.code}
            renderInput={(params) => (
              <TextField {...params} label="Code" className={'custom-textfield'} />
            )}
            sx={{ width: 200 }}
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
            label="Start Other Date"
            value={filters.startOtherDate ? moment(filters.startOtherDate).toDate() : null}
            open={startOtherDateOpen}
            onClose={() => setStartOtherDateOpen(false)}
            onChange={handleFilterStartOtherDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setStartOtherDateOpen(true),
              },
            }}
            sx={{ ...customStyle }}
          />
          <DatePicker
            label="End Other Date"
            value={filters.endOtherDate ? moment(filters.endOtherDate).toDate() : null}
            open={endOtherDateOpen}
            onClose={() => setEndOtherDateOpen(false)}
            onChange={handleFilterEndOtherDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setEndOtherDateOpen(true),
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ ...customStyle }}
          />
          {getResponsibilityValue('print_total_all_in_out_loan_reports', configs, user) && (
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
          <>
            {' '}
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
                data={Object.values(dataFilter)
                  .flat()
                  .map((row, index) => {
                    const {
                      loan,
                      otherNumber,
                      otherName,
                      renewalDate,
                      status,
                      totalInterestAmount,
                      amount,
                      grossWt,
                      netWt,
                      percentage,
                      totalOtherInterestAmount,
                    } = row;
                    const { loanNo, customer, loanAmount, scheme, issueDate, interestLoanAmount } =
                      loan;

                    const totalOtherAmount =
                      dataFilter[loanNo]?.reduce(
                        (sum, item) => sum + Number(item.amount || 0),
                        0
                      ) || 0;
                    const diffAmount = totalOtherAmount - loanAmount;

                    const totalOtherInterest =
                      dataFilter[loanNo]?.reduce(
                        (sum, item) => sum + Number(item.totalOtherInterestAmount || 0),
                        0
                      ) || 0;
                    const diffInterest = totalOtherInterest - totalInterestAmount;

                    return {
                      '#': index + 1,
                      code: row.code || 0,
                      'Loan no.': loanNo,
                      'Issue date': fDate(issueDate),
                      'Customer name': `${customer?.firstName || ''} ${customer?.middleName || ''} ${customer?.lastName || ''}`,
                      'Total loan amt': loanAmount,
                      'Part loan amt':
                        parseFloat((loanAmount - interestLoanAmount).toFixed(2)) || 0,
                      'Int. loan amt': interestLoanAmount,
                      'Total wt': loan.propertyDetails
                        .reduce((prev, next) => prev + (Number(next?.totalWeight) || 0), 0)
                        .toFixed(2),
                      'Net wt': loan.propertyDetails
                        .reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)
                        .toFixed(2),
                      'Int. rate': scheme.interestRate,
                      'Total int. amt': (totalInterestAmount || 0).toFixed(2),
                      'Other no': otherNumber,
                      Date: fDate(row.date),
                      'Other name': otherName,
                      'Other Loan amt': amount,
                      'Gross wt': grossWt,
                      'Net wt': netWt,
                      'Other int(%)': percentage,
                      'Other int amt': totalOtherInterestAmount.toFixed(2),
                      'Diff loan amt': diffAmount.toFixed(2),
                      'Diff int. amt': diffInterest.toFixed(2),
                      Status: status,
                    };
                  })}
                fileName="TotalAllInOutLoanReport"
                sheetName="TotalAllInOutLoanReportSheet"
              />
            </MenuItem>
          </>
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
              <TotalInOutLoanReports
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

TotalAllInOutLoanReportsTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  dateError: PropTypes.bool,
  dataFilter: PropTypes.object,
  configs: PropTypes.object,
  total: PropTypes.object,
  codeOptions: PropTypes.array,
};
