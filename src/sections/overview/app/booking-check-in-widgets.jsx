import PropTypes from 'prop-types';
import { useState } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { useResponsive } from 'src/hooks/use-responsive';
import Iconify from 'src/components/iconify';

const formatNumberWithCommas = (number) => {
  if (number == null || isNaN(number)) return '—';
  const [whole, decimal] = number.toString().split('.');
  const lastThree = whole.slice(-3);
  const otherNumbers = whole.slice(0, -3);
  const formattedWhole =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherNumbers ? ',' : '') + lastThree;
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
};

// ----------------------------------------------------------------------

export default function BookingCheckInWidgets({
  chart,
  title,
  subheader,
  onTimeRangeChange,
  timeRangeOptions,
  chartTitle,
  loading = false,
  onExport,
  ...other
}) {
  const theme = useTheme();
  const smUp = useResponsive('up', 'sm');
  const [timeRange, setTimeRange] = useState('this_month');

  const { series = [] } = chart;

  const handleChange = (event) => {
    setTimeRange(event.target.value);
    if (onTimeRangeChange) {
      onTimeRangeChange(event.target.value);
    }
  };

  return (
    <Card
      {...other}
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[6],
        overflow: 'hidden',
      }}
    >
      <CardHeader
        disableTypography
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {chartTitle || title}
          </Typography>
        }
        subheader={
          subheader && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {subheader}
            </Typography>
          )
        }
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {timeRangeOptions && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="time-range-select">Range</InputLabel>
                <Select
                  labelId="time-range-select"
                  id="time-range"
                  value={timeRange}
                  label="Range"
                  onChange={handleChange}
                >
                  {timeRangeOptions.length > 0 ? (
                    timeRangeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            {onExport && (
              <Tooltip title="Export data">
                <IconButton onClick={onExport}>
                  <Iconify icon="solar:export-bold" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
        sx={{
          px: 3,
          py: 2,
          bgcolor: theme.palette.grey[50],
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        divider={
          <Divider
            orientation={smUp ? 'vertical' : 'horizontal'}
            flexItem
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ px: 2, py: 3 }}
      >
        {loading ? (
          [1, 2, 3].map((i) => (
            <Stack key={i} spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={60} />
              <Skeleton variant="text" width={100} />
            </Stack>
          ))
        ) : series.length > 0 ? (
          series.map((item) => (
            <Stack
              key={item.label}
              spacing={1.5}
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{
                flex: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ color: theme.palette.primary.main, fontSize: 32 }}>{item.icon}</Box>
              <Box>
                <Tooltip title={`Total ${item.label}`} arrow placement="top">
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {item.total ? formatNumberWithCommas(item.total) : '—'}
                  </Typography>
                </Tooltip>

                {item.trend !== undefined && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify
                      icon={item.trend >= 0 ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'}
                      width={16}
                      color={
                        item.trend >= 0 ? theme.palette.success.main : theme.palette.error.main
                      }
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          item.trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        fontWeight: 500,
                      }}
                    >
                      {Math.abs(item.trend)}%
                    </Typography>
                  </Stack>
                )}

                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {item.label}
                </Typography>
              </Box>
            </Stack>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}
          >
            No data available
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

BookingCheckInWidgets.propTypes = {
  chart: PropTypes.shape({
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        total: PropTypes.number,
        icon: PropTypes.node,
        trend: PropTypes.number,
      })
    ),
  }),
  title: PropTypes.string,
  subheader: PropTypes.string,
  onTimeRangeChange: PropTypes.func,
  timeRangeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  chartTitle: PropTypes.string,
  loading: PropTypes.bool,
  onExport: PropTypes.func,
};
