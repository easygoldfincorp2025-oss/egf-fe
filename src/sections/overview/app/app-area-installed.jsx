import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function AppAreaInstalled({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const { series, options } = chart;

  if (!series || series.length === 0) {
    return (
      <Card {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box sx={{ p: 3, textAlign: 'center' }}>No data available</Box>
      </Card>
    );
  }

  const popover = usePopover();
  const [seriesData, setSeriesData] = useState('Week');
  const selectedSeries = series.find((item) => item.type === seriesData);

  const formatCurrency = (value) =>
    `₹ ${Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const chartOptions = useChart({
    colors: selectedSeries?.data.map((_, index) => {
      const palette = [
        theme.palette.success.main,
        theme.palette.error.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.primary.main,
        theme.palette.secondary.main,
      ];
      return palette[index % palette.length];
    }),
    xaxis: {
      categories: selectedSeries?.categories || [],
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    legend: {
      show: true,
      fontSize: '14px',
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        radius: 12,
      },
    },
    tooltip: {
      y: {
        formatter: formatCurrency,
      },
    },
    yaxis: {
      labels: {
        formatter: formatCurrency,
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
        {selectedSeries && (
          <Box sx={{ mt: 3, mx: 3 }}>
            <Chart
              dir='ltr'
              type='line'
              series={selectedSeries.data}
              options={chartOptions}
              width='100%'
              height={364}
            />
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

AppAreaInstalled.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
