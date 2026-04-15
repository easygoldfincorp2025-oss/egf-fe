import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { Dialog, IconButton, MenuItem } from '@mui/material';
import CustomPopover, { usePopover } from '../../../components/custom-popover';
import { getResponsibilityValue } from '../../../permission/permission';
import { useAuthContext } from '../../../auth/hooks';
import { useGetConfigs } from '../../../api/config';
import moment from 'moment/moment.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useBoolean } from '../../../hooks/use-boolean.js';
import CustomerRefReportPdf from '../pdf/customer-ref-report-pdf.jsx';
import { PDFViewer } from '@react-pdf/renderer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import RHFExportExcel from '../../../components/hook-form/rhf-export-excel';
import { fDate } from '../../../utils/format-time';
import { useGetBranch } from '../../../api/branch.js';

// ----------------------------------------------------------------------

const INQUIRY_REFERENCE_BY = [
  { value: 'Google', label: 'Google' },
  {
    value: 'Just Dial',
    label: 'Just Dial',
  },
  { value: 'Social Media', label: 'Social Media' },
  {
    value: 'Board Banner',
    label: 'Board Banner',
  },
  { value: 'Brochure', label: 'Brochure' },
  { value: 'Other', label: 'Other' },
];

export default function CustomerRefReportTableToolbar({
  filters,
  onFilters,
  data,
  dateError,
  options,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const view = useBoolean();
  const { branch } = useGetBranch();
  const selectedBranch =  sessionStorage.getItem('selectedBranch');
  const branchName = branch?.find((b) => b._id === selectedBranch)?.name || 'All Branch';

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    area: filters.area,
    ref: filters.ref,
    branch: branchName,
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

  const handleFilterArea = useCallback(
    (event, newValue) => {
      onFilters('area', newValue || '');
    },
    [onFilters]
  );

  const handleFilterRef = useCallback(
    (event, newValue) => {
      onFilters('ref', newValue || '');
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
          <Autocomplete
            options={options?.area || []}
            value={filters.area || ''}
            onChange={handleFilterArea}
            sx={{ width: { xs: 1, sm: 350 } }}
            renderInput={(params) => (
              <TextField {...params} label="Area" className={'custom-textfield'} />
            )}
          />
          <Autocomplete
            options={INQUIRY_REFERENCE_BY?.map((e) => e.value) || []}
            value={filters.ref || ''}
            onChange={handleFilterRef}
            sx={{ width: { xs: 1, sm: 350 } }}
            renderInput={(params) => (
              <TextField {...params} label="Ref" className={'custom-textfield'} />
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
          {getResponsibilityValue('print_customer_refrance_statement', configs, user) && (
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
              data={data.map((row) => {
                const matchedReference = INQUIRY_REFERENCE_BY.find(
                  (item) => item.value === row.referenceBy
                );
                const getReferenceLabel = () => matchedReference?.label || 'Other';
                const getOtherReferenceLabel = () =>
                  row.referenceBy === 'Other'
                    ? row.referenceBy || '-'
                    : matchedReference
                      ? '-'
                      : row.referenceBy;

                return {
                  'Sr No': row.srNo,
                  'Customer Name': `${row.firstName} ${row.middleName} ${row.lastName}`,
                  'Contact': row.contact,
                  'Joining Date': fDate(row.joiningDate) || '-',
                  'Reference By': getReferenceLabel(),
                  'Other Reference': getOtherReferenceLabel(),
                  'Area': row.permanentAddress?.area || '-',
                };
              })}
              fileName="CustomerRefReport"
              sheetName="CustomerRefReportSheet"
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
              <CustomerRefReportPdf data={data} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

CustomerRefReportTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  data: PropTypes.any,
  dateError: PropTypes.bool,
  options: PropTypes.shape({
    area: PropTypes.array,
    ref: PropTypes.array,
  }),
};
