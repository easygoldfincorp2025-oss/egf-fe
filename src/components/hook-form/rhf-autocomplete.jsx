import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import Iconify from 'src/components/iconify';
import { countries } from 'src/assets/data';
import { Paper } from '@mui/material';

// ----------------------------------------------------------------------

export default function RHFAutocomplete({ name, label, type, helperText, placeholder, options,req,...other }) {
  const { control, setValue } = useFormContext();
  const { multiple } = other;
  const customStyle = req  ? { borderLeft: `2px solid ${req}`,borderRadius:'8px'} : {};

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        if (type === 'country') {
          return (
            <Autocomplete
              {...field}
              id={`autocomplete-${name}`}
              autoHighlight={!multiple}
              disableCloseOnSelect={multiple}
              onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
              options={countries}
              getOptionLabel={(option) => option.label || ''}
              renderOption={(props, option) => {
                const country = getCountry(option.label);

                if (!country.label) {
                  return null;
                }
                return (
                  <li {...props} key={country.label}>
                    <Iconify
                      key={country.label}
                      icon={`circle-flags:${country.code?.toLowerCase()}`}
                      sx={{ mr: 1 }}
                    />
                    {country.label} ({country.code}) +{country.phone}
                  </li>
                );
              }}
              renderInput={(params) => {
                const country = getCountry(params.inputProps.value);

                const baseField = {
                  ...params,
                  label,
                  placeholder,
                  error: !!error,
                  helperText: error ? error?.message : helperText,
                  inputProps: {
                    ...params.inputProps,
                    autoComplete: 'new-password',
                  },
                };

                if (multiple) {
                  return <TextField {...baseField} />;
                }

                return (
                  <TextField
                    {...baseField}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{
                            ...(!country.code && {
                              display: 'none',
                            }),
                          }}
                        >
                          <Iconify
                            icon={`circle-flags:${country.code?.toLowerCase()}`}
                            sx={{ mr: -0.5, ml: 0.5 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                );
              }}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => {
                  const country = getCountry(option.label);

                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={country.label}
                      label={country.label}
                      icon={<Iconify icon={`circle-flags:${country.code?.toLowerCase()}`} />}
                      size="small"
                      variant="soft"
                    />
                  );
                })
              }
              {...other}
            />
          );
        };

        return (
          <Autocomplete
            {...field}
            id={`autocomplete-${name}`}
            onChange={(event, newValue) => setValue(name, newValue, { shouldValidate: true })}
            options={options}
            PaperComponent={(props) => (
              <Paper
                {...props}
                sx={{
                  '& .MuiAutocomplete-listbox': {
                    maxHeight: 200, // adjust max height for scrolling
                    overflow: 'auto',
                    '::-webkit-scrollbar': {
                      width: '5px',
                    },
                    '::-webkit-scrollbar-thumb': {
                      backgroundColor: '#888',
                      opacity:0.1,
                      borderRadius: '4px',
                    },
                    '::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                sx={{
                  ':not(:focus-within) label ~ div:first-of-type': customStyle,
                  "label": {
                    mt: -0.8,
                    fontSize: "14px",
                  },
                  "& .MuiInputLabel-shrink": {
                    mt: 0,
                  },
                  "input": { height: 7 },
                }}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error?.message : helperText}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
            {...other}
          />
        );
      }}
    />
  );
}

RHFAutocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
  placeholder: PropTypes.string,
  options: PropTypes.array.isRequired,
};

// ----------------------------------------------------------------------

export function getCountry(inputValue) {
  const option = countries.find((country) => country.label === inputValue);
  return option || {};
}
