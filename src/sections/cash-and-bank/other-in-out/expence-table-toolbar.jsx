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
import { Autocomplete, Box, Dialog, Typography } from '@mui/material';
import { useBoolean } from '../../../hooks/use-boolean.js';
import { PDFViewer } from '@react-pdf/renderer';
import ExpencePdf from './view/expence-pdf.jsx';
import { useGetConfigs } from '../../../api/config.js';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { getResponsibilityValue } from '../../../permission/permission.js';
import { useAuthContext } from '../../../auth/hooks/index.js';

// ----------------------------------------------------------------------

export default function ExpenceTableToolbar({
  filters,
  onFilters,
  schemes,
  dateError,
  expenceDetails,
  options,
  categoryOptions,
  expenceData,
}) {
  const popover = usePopover();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const view = useBoolean();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    category: filters.category,
    expenceType: filters?.expenceType?.expenseType,
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
    (event) => {
      onFilters('transactions', typeof event.target.value === 'object' ? event.target.value : null);
    },
    [onFilters]
  );
  const handleFilterCategory = useCallback(
    (event) => {
      onFilters('category', event.target.value);
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
      <Box sx={{ p: 2.5 }}>
        <Typography sx={{ color: 'text.secondary' }} variant="subtitle1" component="p">
          Expence Type : {expenceDetails.chargeType}
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
          <Autocomplete
            fullWidth
            disableClearable
            size="medium"
            options={options || []}
            getOptionLabel={(option) =>
              option.bankName && option.accountHolderName
                ? `${option.bankName} (${option.accountHolderName})`
                : option.transactionsType || 'Unnamed Account'
            }
            value={filters.transactions || null}
            onChange={(_, newValue) => onFilters('transactions', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cash & Bank Transactions"
                sx={{ minWidth: 220 }}
                className={'custom-textfield'}
              />
            )}
          />
          <Autocomplete
            fullWidth
            disableClearable
            size="medium"
            options={categoryOptions || []}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || '')}
            value={filters.category || ''}
            onChange={(_, newValue) => onFilters('category', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                sx={{ minWidth: 220 }}
                className={'custom-textfield'}
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
        <>
          {getResponsibilityValue('print_expenses', configs, user) && <MenuItem
            onClick={() => {
              view.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon='solar:printer-minimalistic-bold' />
            Print
          </MenuItem>}
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
              <ExpencePdf expenceData={expenceData} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

ExpenceTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
