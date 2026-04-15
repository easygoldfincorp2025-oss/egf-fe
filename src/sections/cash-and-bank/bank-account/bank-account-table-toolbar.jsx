import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import { useAuthContext } from '../../../auth/hooks/index.js';
import { useGetConfigs } from '../../../api/config.js';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Button, Dialog, DialogActions, Menu, Typography } from '@mui/material';
import { PDFViewer } from '@react-pdf/renderer';
import BankAccountPdf from './view/bank-account-pdf.jsx';
import { useBoolean } from '../../../hooks/use-boolean.js';
import Autocomplete from '@mui/material/Autocomplete';
import { getResponsibilityValue } from '../../../permission/permission.js';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel.jsx';

export default function BankAccountTableToolbar({
  filters,
  onFilters,
  excelData,
  dateError,
  accountDetails,
  options = [],
  onTransferTypeSelect,
  bankData,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const view = useBoolean();
  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    status: filters.status,
    bank: filters.account.bankName,
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTransferTypeSelect = (value) => {
    onTransferTypeSelect(value);
    handleMenuClose();
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
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

  const handleFilterCategory = useCallback(
    (event) => {
      onFilters('category', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const customStyle = {
    maxWidth: { md: 150 },
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
      <Box
        sx={{
          p: 2.5,
          pb: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-',
        }}
      >
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }} component="p">
            Bank Name : {filters.account.bankName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }} component="p">
            Account Number : {filters.account.accountNumber}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }} component="p">
            Account Holder : {filters.account.accountHolderName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }} component="p">
            Branch : {filters.account.branchName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }} component="p">
            IFSC Code : {filters.account.IFSC}
          </Typography>
        </Box>
        <Box>
          {getResponsibilityValue('create_transfer', configs, user) &&
            <Button variant='contained' onClick={handleMenuOpen} sx={{ height: 40 }}>
            {'Transfer Type'}
            </Button>}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleTransferTypeSelect('Bank To Bank')}>
              <Iconify icon="mdi:bank-transfer" width={20} sx={{ mr: 1 }} />
              Bank To Bank Transfer
            </MenuItem>
            <MenuItem onClick={() => handleTransferTypeSelect('Bank To Cash')}>
              <Iconify icon="mdi:bank-transfer-out" width={20} sx={{ mr: 1 }} />
              Bank To Cash Transfer
            </MenuItem>
            <MenuItem onClick={() => handleTransferTypeSelect('Cash To Bank')}>
              <Iconify icon="mdi:bank-transfer-in" width={20} sx={{ mr: 1 }} />
              Cash To Bank Transfer
            </MenuItem>
            <MenuItem onClick={() => handleTransferTypeSelect('Adjust Bank Balance')}>
              <Iconify icon="mdi:bank-check" width={20} sx={{ mr: 1 }} />
              Adjust Bank Balance
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            sx={{ input: { height: 7 } }}
            fullWidth
            value={filters.name}
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
            fullWidth
            options={['Payment In', 'Payment Out']}
            value={filters.category || null}
            onChange={(event, newValue) => {
              onFilters('category', newValue || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                sx={{
                  input: { height: 7 },
                  label: { mt: -0.8 },
                  '& .MuiInputLabel-shrink': { mt: 0 },
                }}
              />
            )}
          />
          <Autocomplete
            fullWidth
            options={options || []}
            value={filters.status || null}
            onChange={(event, newValue) => {
              onFilters('status', newValue || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Type"
                sx={{
                  input: { height: 7 },
                  label: { mt: -0.8 },
                  '& .MuiInputLabel-shrink': { mt: 0 },
                }}
              />
            )}
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
        </Stack>
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
        {getResponsibilityValue('print_bank_account_in', configs, user) && (
          <>
            <MenuItem
              onClick={() => {
                view.onTrue();
                popover.onClose();
              }}
            >
              <Iconify icon='solar:printer-minimalistic-bold' />
              Print
            </MenuItem>
            <MenuItem>
              <RHFExportExcel data={excelData} fileName='bankTransactions' sheetName='bankTransactionsSheet' />
            </MenuItem>
          </>
        )}
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
              <BankAccountPdf bankData={bankData} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

BankAccountTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  schemes: PropTypes.array,
  dateError: PropTypes.bool,
  accountDetails: PropTypes.object,
  options: PropTypes.array,
  onTransferTypeSelect: PropTypes.func,
};
