import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify/index.js';
import Chart, { useChart } from 'src/components/chart/index.js';
import CustomPopover, { usePopover } from 'src/components/custom-popover/index.js';

// ----------------------------------------------------------------------

const formatCurrency = (value) =>
  `₹ ${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function BankingBalanceStatistics({ title, subheader, chart, ...other }) {
  if (!chart || !Array.isArray(chart.series) || chart.series.length === 0) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            No data available
          </Typography>
        </Box>
      </Card>
    );
  }

  const { colors, series, options } = chart;
  const popover = usePopover();
  const [seriesData, setSeriesData] = useState('Week');
  const selectedSeries = series.find((item) => item.type === seriesData);

  const chartOptions = useChart({
    colors,
    stroke: {
      show: true,
      width: 0.1,
      colors: ['transparent'],
    },
    xaxis: {
      categories: selectedSeries?.categories || [],
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value),
      },
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSeriesData(newValue);
    },
    [popover]
  );

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <ButtonBase
              onClick={popover.onOpen}
              sx={{
                pl: 1,
                py: 0.5,
                pr: 0.5,
                borderRadius: 1,
                typography: 'subtitle2',
                bgcolor: 'background.neutral',
              }}
            >
              {seriesData}
              <Iconify
                width={16}
                icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                sx={{ ml: 0.5 }}
              />
            </ButtonBase>
          }
        />
        {selectedSeries ? (
          <Box sx={{ mt: 3, mx: 3 }}>
            <Chart
              dir='ltr'
              type='bar'
              series={selectedSeries.data}
              options={chartOptions}
              width='100%'
              height={364}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              No data available
            </Typography>
          </Box>
        )}
      </Card>
      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {series.map((option) => (
          <MenuItem
            key={option.type}
            selected={option.type === seriesData}
            onClick={() => handleChangeSeries(option.type)}
          >
            {option.type}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

BankingBalanceStatistics.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
