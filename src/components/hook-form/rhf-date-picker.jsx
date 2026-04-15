import React from 'react';
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import enGB from 'date-fns/locale/en-GB'; // for UK style date formatting

const RhfDatePicker = ({ name, control, label, req, InputLabelShrink, sx, ...props }) => {
  const customStyle = req ? { borderLeft: `2px solid ${req}`, borderRadius: '8px' } : {};

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            format="dd/MM/yyyy"
            sx={{
              ':not(:focus-within) label ~ div:first-of-type': customStyle,
              label: {
                mt: -0.8,
                fontSize: '14px',
              },
              '& .MuiInputLabel-shrink': {
                mt: 0,
              },
              input: { height: 7 },
              ...sx,
            }}
            label={label || 'Date'}
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                InputLabelProps: { shrink: InputLabelShrink },
                helperText: error?.message,
              },
            }}
            {...props}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default RhfDatePicker;
