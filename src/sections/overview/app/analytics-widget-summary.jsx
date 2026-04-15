import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

function fShortenNumber(number) {
  if (number == null) return '';
  return number.toLocaleString('en-IN');
}

export default function AnalyticsWidgetSummary({
                                                 title,
                                                 total,
                                                 days,
                                                 icon,
                                                 filter = 'this_month',
                                                 filterOptions = [],
                                                 onFilterChange = () => {
                                                 },
                                                 color = 'success',
                                                 sx,
                                                 ...other
                                               }) {
  const theme = useTheme();

  const [selectedFilter, setSelectedFilter] = useState(filter);

  useEffect(() => {
    setSelectedFilter(filter);
  }, [filter]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedFilter(newValue);
    onFilterChange(newValue);
  };

  return (
    <Stack
      spacing={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette[color].light, 0.3),
        color: theme.palette[color].darker,
        ...sx,
      }}
      {...other}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Box sx={{ width: 30, height: 30 }}>{icon}</Box>
          <Typography variant='subtitle1' fontWeight='bold'>
            {title}
          </Typography>
        </Stack>
        <Select
          value={selectedFilter}
          size='small'
          onChange={handleChange}
          sx={{
            bgcolor: alpha(theme.palette[color].main, 0.1),
            fontSize: 12,
            height: 32,
            borderRadius: 1,
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Stack direction='row' spacing={2} alignItems='center' justifyContent='space-between'>
        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography variant='body2' sx={{ opacity: 0.7 }}>
            Total
          </Typography>
          <Typography
            variant='h4'
            sx={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
            }}
          >
            {fShortenNumber(total)}
          </Typography>
        </Box>
        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography variant='body2' sx={{ opacity: 0.7 }}>
            Day Average
          </Typography>
          <Typography
            variant='h4'
            sx={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
            }}
          >
            {fShortenNumber(days)}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}

AnalyticsWidgetSummary.propTypes = {
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  days: PropTypes.number.isRequired,
  icon: PropTypes.element,
  filter: PropTypes.string,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  onFilterChange: PropTypes.func,
  color: PropTypes.string,
  sx: PropTypes.object,
};
