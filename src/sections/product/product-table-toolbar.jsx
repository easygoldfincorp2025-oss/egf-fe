import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import OutlinedInput from '@mui/material/OutlinedInput';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function ProductTableToolbar({
  filters,
  onFilters,
  //
  stockOptions,
  publishOptions,
}) {
  const popover = usePopover();

  const [stock, setStock] = useState(filters.stock);

  const [publish, setPublish] = useState(filters.publish);

  const handleChangeStock = useCallback((event, newValue) => {
    setStock(newValue);
    onFilters('stock', newValue);
  }, [onFilters]);

  const handleChangePublish = useCallback((event, newValue) => {
    setPublish(newValue);
    onFilters('publish', newValue);
  }, [onFilters]);

  return (
    <>
      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Stock</InputLabel>
        <Autocomplete
          multiple
          value={stock}
          onChange={handleChangeStock}
          options={stockOptions.map(option => option.value)}
          getOptionLabel={(option) => stockOptions.find(opt => opt.value === option)?.label || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Stock"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
          ListboxProps={{
            sx: {
              maxHeight: 240,
              '&::-webkit-scrollbar': {
                width: '5px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            },
          }}
        />
      </FormControl>

      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Publish</InputLabel>
        <Autocomplete
          multiple
          value={publish}
          onChange={handleChangePublish}
          options={publishOptions.map(option => option.value)}
          getOptionLabel={(option) => publishOptions.find(opt => opt.value === option)?.label || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Publish"
              sx={{ textTransform: 'capitalize' }}
            />
          )}
          ListboxProps={{
            sx: {
              maxHeight: 240,
              '&::-webkit-scrollbar': {
                width: '5px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              },
            },
          }}
        />
      </FormControl>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

ProductTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  publishOptions: PropTypes.array,
  stockOptions: PropTypes.array,
};
