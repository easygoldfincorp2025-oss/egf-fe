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
import { fNumber } from 'src/utils/format-number.js';
import Chart, { useChart } from 'src/components/chart/index.js';

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

export default function AnalyticsCurrentVisits({
                                                 title,
                                                 subheader,
                                                 chart,
                                                 onTimeRangeChange,
                                                 timeRangeOptions = [],
                                                 ...other
                                               }) {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('this_month');

  const handleChange = (event) => {
    setTimeRange(event.target.value);
    if (onTimeRangeChange) {
      onTimeRangeChange(event.target.value);
    }
  };

  const colors = chart?.colors || [];
  const series = Array.isArray(chart?.series) ? chart.series : [];
  const chartSeries = series.map((i) => i?.value ?? 0);
  const chartLabels = series.map((i) => i?.label ?? '');

  const isEmpty = !series.length || chartSeries.every((v) => v === 0);

  const chartOptions = useChart({
    chart: {
      sparkline: { enabled: true },
      background: '#fff',
    },
    colors,
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value) => fNumber(value),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: { labels: { show: false } },
      },
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: theme.palette.text.secondary,
        fontSize: '16px',
      },
    },
    ...(chart?.options || {}),
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
              onChange={handleChange}
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
      {isEmpty ? (
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
          type='pie'
          series={chartSeries}
          options={chartOptions}
          width='100%'
          height={280}
        />
      )}
    </Card>
  );
}

AnalyticsCurrentVisits.propTypes = {
  chart: PropTypes.shape({
    colors: PropTypes.array,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.number,
      }),
    ),
    options: PropTypes.object,
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

AnalyticsCurrentVisits.defaultProps = {
  chart: {
    colors: [],
    series: [],
    options: {},
  },
};
