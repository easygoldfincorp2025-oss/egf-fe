import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CustomPopover, { usePopover } from '../../components/custom-popover';
import { getResponsibilityValue } from '../../permission/permission';
import { useGetConfigs } from '../../api/config';
import { useAuthContext } from '../../auth/hooks';
import RHFExportExcel from '../../components/hook-form/rhf-export-excel';
import { PDFViewer } from '@react-pdf/renderer';
import InqiryPdf from './view/inqiry-pdf.jsx';
import { useBoolean } from '../../hooks/use-boolean.js';

export default function InquiryTableToolbar({
  filters,
  onFilters,
  options,
  roleOptions,
  dateError,
  inquiries,
  inquiriesDate,
}) {
  const popover = usePopover();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [startRecallingDateOpen, setStartRecallingDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endRecallingDateOpen, setEndRecallingDateOpen] = useState(false);
  const view = useBoolean();

  const filterData = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    startRecallingDate: filters.startRecallingDate,
    endRecallingDate: filters.endRecallingDate,
    assignTo: filters.assignTo,
    inquiryFor: filters.inquiryFor,
  };

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      onFilters('startDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      onFilters('endDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterStartRecallingDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      onFilters('startRecallingDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterEndRecallingDate = useCallback(
    (newValue) => {
      const date = moment(newValue);
      onFilters('endRecallingDate', date.isValid() ? date.toDate() : null);
    },
    [onFilters]
  );

  const handleFilterAssignTo = useCallback(
    (_, newValue) => {
      onFilters('assignTo', newValue);
    },
    [onFilters]
  );

  const handleFilterInquiryFor = useCallback(
    (_, newValue) => {
      onFilters('inquiryFor', newValue);
    },
    [onFilters]
  );

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
            options={options}
            getOptionLabel={(option) => option?.name || ''}
            value={filters.assignTo || null}
            onChange={handleFilterAssignTo}
            renderInput={(params) => (
              <TextField {...params} label="Assign To" className="custom-textfield" />
            )}
            isOptionEqualToValue={(option, value) => option?.name === value?.name}
            sx={{ maxWidth: 200 }}
          />
          <Autocomplete
            fullWidth
            options={options[0]?.inquiryFor || []}
            value={filters.inquiryFor || null}
            onChange={handleFilterInquiryFor}
            renderInput={(params) => (
              <TextField {...params} label="Inquiry For" className="custom-textfield" />
            )}
            sx={{ maxWidth: 200 }}
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
            sx={{ maxWidth: { md: 200 } }}
            className="custom-textfield"
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
            sx={{ maxWidth: { md: 200 } }}
            className="custom-textfield"
          />
          <DatePicker
            label="Start recalling date"
            value={filters.startRecallingDate ? moment(filters.startRecallingDate).toDate() : null}
            open={startRecallingDateOpen}
            onClose={() => setStartRecallingDateOpen(false)}
            onChange={handleFilterStartRecallingDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setStartRecallingDateOpen(true),
                fullWidth: true,
              },
            }}
            sx={{ maxWidth: { md: 200 } }}
            className="custom-textfield"
          />
          <DatePicker
            label="End recalling date"
            value={filters.endRecallingDate}
            open={endRecallingDateOpen}
            onClose={() => setEndRecallingDateOpen(false)}
            onChange={handleFilterEndRecallingDate}
            format="dd/MM/yyyy"
            slotProps={{
              textField: {
                onClick: () => setEndRecallingDateOpen(true),
                fullWidth: true,
                error: dateError,
                helperText: dateError && 'End date must be later than start date',
              },
            }}
            sx={{ maxWidth: { md: 200 } }}
            className="custom-textfield"
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
          {getResponsibilityValue('print_inquiry_detail', configs, user) && (
            <>
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
                  data={inquiries}
                  fileName="InquiryData"
                  sheetName="InquiryDetails"
                />
              </MenuItem>
            </>
          )}
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
              <InqiryPdf inquiries={inquiriesDate} configs={configs} filterData={filterData} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

InquiryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  options: PropTypes.array,
  dateError: PropTypes.bool,
  inquiries: PropTypes.array,
  inquiriesDate: PropTypes.array,
};
