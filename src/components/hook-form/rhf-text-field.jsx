import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export default function RHFTextField({ name, helperText, type, req, sx, ...other }) {
  const { control } = useFormContext();

  const customStyle = req ? { borderLeft: `2px solid ${req}`, borderRadius: '8px' } : {};

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
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
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}

RHFTextField.propTypes = {
  helperText: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  req: PropTypes.string,
};
