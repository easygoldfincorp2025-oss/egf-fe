import PropTypes from 'prop-types';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { fNumber } from 'src/utils/format-number';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;
const LEGEND_HEIGHT = 72;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function AppCurrentDownload({
                                             title,
                                             subheader,
                                             chart,
                                             onTimeRangeChange,
                                             timeRangeOptions = [],
                                             ...other
                                           }) {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('this_month');

  const handleTimeRangeChange = (event) => {
    const value = event.target.value;
    setTimeRange(value);
    if (onTimeRangeChange) {
      onTimeRangeChange(value);
    }
  };

  const colors = chart?.colors || [];
  const series = chart?.series || [];
  const options = chart?.options || {};
  const total = chart?.total || 0;

  const chartSeries = series.map((i) => i?.value ?? 0);
  const isEmpty = !series.length || chartSeries.every((value) => value === 0);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series.map((i) => i?.label ?? ''),
    stroke: { colors: [theme.palette.background.paper] },
    legend: {
      offsetY: 0,
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: (seriesName) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            value: {
              formatter: (value) => fNumber(value),
            },
            total: {
              show: true,
              label: 'Total',
              formatter: () => fNumber(total || 0),
            },
          },
        },
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 5 }}
        action={
          <FormControl size='small'>
            <InputLabel id='time-range-select'>Range</InputLabel>
            <Select
              labelId='time-range-select'
              id='time-range'
              value={timeRange}
              label='Range'
              onChange={handleTimeRangeChange}
            >
              {timeRangeOptions.length > 0 ? (
                timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value=''>No options available</MenuItem>
              )}
            </Select>
          </FormControl>
        }
      />

      {/* Handle loading or empty data */}
      {!chart || !chart.series ? (
        <Box
          height={280}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <CircularProgress size={32} />
        </Box>
      ) : isEmpty ? (
        <Box
          height={280}
          display='flex'
          alignItems='center'
          justifyContent='center'
          sx={{ typography: 'body2', color: 'text.disabled' }}
        >
          No data available
        </Box>
      ) : (
        <StyledChart
          dir='ltr'
          type='donut'
          series={chartSeries}
          options={chartOptions}
          width='100%'
          height={280}
        />
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

AppCurrentDownload.propTypes = {
  chart: PropTypes.shape({
    colors: PropTypes.array,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.number,
      }),
    ),
    options: PropTypes.object,
    total: PropTypes.number,
  }),
  subheader: PropTypes.string,
  title: PropTypes.string,
  onTimeRangeChange: PropTypes.func,
  timeRangeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
};

AppCurrentDownload.defaultProps = {
  chart: {
    colors: [],
    series: [],
    options: {},
    total: 0,
  },
};
