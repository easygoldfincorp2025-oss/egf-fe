import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Dialog, FormControl, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PDFViewer } from '@react-pdf/renderer';
import { useBoolean } from '../../../hooks/use-boolean.js';
import { useGetConfigs } from '../../../api/config.js';
import ChargeInOutPdf from './view/charge-in-out-pdf.jsx';
import ChargeInOutListingPdf from './view/charge-in-out-listing-pdf.jsx';
import Autocomplete from '@mui/material/Autocomplete';
import { getResponsibilityValue } from '../../../permission/permission.js';
import { useAuthContext } from '../../../auth/hooks/index.js';

// ----------------------------------------------------------------------

export default function ChargeInOutTableToolbar({
  filters,
  onFilters,
  schemes,
  dateError,
  chargeDetails,
  options,
  chargeData,
  chargeTypeTotals,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const view = useBoolean();
  const [pdfMode, setPdfMode] = useState('detail'); // 'detail' | 'listing'
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  const filterData = {
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    category: filters?.category,
    chargeType: filters?.chargeType?.chargeType,
    transactions:
      filters?.transactions?.bankName && filters?.transactions?.accountHolderName
        ? `${filters.transactions.bankName} (${filters.transactions.accountHolderName})`
        : filters?.transactions?.transactionsType || '-',
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
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

  const handleFilterTransactions = useCallback(
    (event, newValue) => {
      onFilters('transactions', newValue || null);
    },
    [onFilters]
  );

  const handleFilterCategory = useCallback(
    (event, newValue) => {
      onFilters('category', newValue || null);
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
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ color: 'text.secondary' }} variant="subtitle1" component="p">
          Charge Name : {chargeDetails.chargeType}
        </Typography>
      </Box>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
        }}
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
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, sm: 220 },
            }}
          >
            <Autocomplete
              value={filters.transactions || null}
              onChange={handleFilterTransactions}
              options={options || []}
              getOptionLabel={(option) =>
                option.bankName && option.accountHolderName
                  ? `${option.bankName} (${option.accountHolderName})`
                  : option.transactionsType || 'Unnamed Account'
              }
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cash & Bank Transactions"
                  className={'custom-textfield'}
                />
              )}
            />
          </FormControl>
          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, sm: 150 },
            }}
          >
            <Autocomplete
              value={filters.category || null}
              onChange={handleFilterCategory}
              options={['Payment In', 'Payment Out']}
              getOptionLabel={(option) => option || ''}
              renderInput={(params) => (
                <TextField {...params} label="Status" className={'custom-textfield'} />
              )}
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
        <>
          {getResponsibilityValue('print_charge', configs, user) && (
            <>
              <MenuItem
                onClick={() => {
                  setPdfMode('detail');
                  view.onTrue();
                  popover.onClose();
                }}
              >
                <Iconify icon='solar:printer-minimalistic-bold' />
                Print Details
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setPdfMode('listing');
                  view.onTrue();
                  popover.onClose();
                }}
              >
                <Iconify icon='solar:printer-minimalistic-bold' />
                Print Charge Listing
              </MenuItem>
            </>
          )}
        </>
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
              {pdfMode === 'listing' ? (
                <ChargeInOutListingPdf
                  configs={configs}
                  chargeTypeTotals={chargeTypeTotals}
                />
              ) : (
                <ChargeInOutPdf chargeData={chargeData} configs={configs} filterData={filterData} />
              )}
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

ChargeInOutTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  schemes: PropTypes.array,
  dateError: PropTypes.bool,
  chargeDetails: PropTypes.object,
  options: PropTypes.array,
  chargeData: PropTypes.any,
  chargeTypeTotals: PropTypes.any,
};
