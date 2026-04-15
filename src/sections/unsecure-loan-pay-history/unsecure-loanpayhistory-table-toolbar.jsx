import PropTypes from 'prop-types';
import { useCallback } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { useGetBranch } from '../../api/branch.js';
import { useGetConfigs } from '../../api/config.js';
import { useBoolean } from '../../hooks/use-boolean.js';
import CustomPopover, { usePopover } from '../../components/custom-popover/index.js';
import { Button, Dialog, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import DialogActions from '@mui/material/DialogActions';
import { PDFViewer } from '@react-pdf/renderer';
import { fDate } from '../../utils/format-time.js';
import UnsecureLoanPayHistoryPdf from './PDF/unsecure-loan-pay-history-pdf.jsx';
import MenuItem from '@mui/material/MenuItem';
import RHFExportExcel from '../../components/hook-form/rhf-export-excel.jsx';

// ----------------------------------------------------------------------

export default function UnsecureLoanpayhistoryTableToolbar({ filters,loans, onFilters }) {
  const { branch } = useGetBranch();
  const {configs} = useGetConfigs()
  const view = useBoolean();
  const popover = usePopover();
  const selectedBranch =  sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';

  const filterData = {
    branch : branchName
  };
  const handleFilterName = useCallback(
    (event) => {
      onFilters('username', event.target.value);
    },
    [onFilters],
  );

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
          direction='row'
          alignItems='center'
          spacing={2}
          flexGrow={1}
          sx={{ width: 1, pr: 1.5 }}
        >
          <TextField
            sx={{ 'input': { height: 7 } }}
            fullWidth
            value={filters.username}
            onChange={handleFilterName}
            placeholder='Search...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Iconify icon='eva:search-fill' sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
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
                loans?.map((row, index) => ({
                  'Loan No.': row.loanNo,
                  'Issue Date': fDate(row.issueDate),
                  'Customer Name': `${row.customer?.firstName || ''} ${row.customer?.middleName || ''} ${row.customer?.lastName || ''}`,
                  'Contact': row.customer?.contact || '-',
                  'Total Loan Amt' :row.loanAmount,
                  'Int. Loan Amt':row.interestLoanAmount,
                  'Part Loan Amt':parseFloat((row.loanAmount - row.interestLoanAmount).toFixed(2)),
                  'int. Rate': Number(row.scheme?.interestRate > 1 ? 1 : row.scheme?.interestRate),
                  'Cash Amt' : row.cashAmount,
                  'Bank Amt' : row.bankAmount,
                  'Approval Charge': row.approvalCharge,
                  'Status' :row.status,
                })) || []
              }
              fileName="unSecure Loan Report"
              sheetName="unSecureLoanReportSheet"
            />
          </MenuItem>
        </CustomPopover>
        <Dialog fullScreen open={view.value} onClose={view.onFalse}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="inherit" variant="contained" onClick={view.onFalse}>
                Close
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <UnsecureLoanPayHistoryPdf
                  loans={loans}
                  configs={configs}
                  filterData={filterData}
                  // total={total}
                />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>
      </Stack>
    </>
  );
}

UnsecureLoanpayhistoryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
