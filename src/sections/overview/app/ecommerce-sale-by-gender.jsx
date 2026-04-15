import PropTypes from 'prop-types';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Chart, { useChart } from 'src/components/chart/index.js';
import React from 'react';

const CHART_HEIGHT = 300;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
}));

const formatCurrency = (value) =>
  `₹ ${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function EcommerceSaleByGender({
                                                title,
                                                subheader,
                                                chart,
                                                banks = [],
                                                ...other
                                              }) {
  const theme = useTheme();

  const {
    series = [],
    options,
  } = chart || {};

  const rawValues = series.map((i) => i.value);
  const totalValue = rawValues.reduce((sum, val) => sum + val, 0);

  const chartSeries =
    totalValue > 0 ? rawValues.map((val) => (val / totalValue) * 100) : [0, 0];
  const labels = series.map((i) => i.label);

  const cashIndex = labels.findIndex(label => label.toLowerCase() === 'cash');
  const bankIndex = labels.findIndex(label => label.toLowerCase() === 'bank');

  const cash = rawValues[cashIndex] || 0;
  const bank = rawValues[bankIndex] || 0;
  const total = Number((cash + bank).toFixed(2));

  // Assign colors based on label
  const labelColorMap = {
    Cash: [theme.palette.warning.light, theme.palette.warning.main],
    Bank: [theme.palette.primary.light, theme.palette.primary.main],
  };
  const colors = labels.map((label) => labelColorMap[label] || ['#ccc', '#999']);

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[1]),
    chart: {
      sparkline: { enabled: true },
    },
    labels,
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: colors.map((colr) => [
          { offset: 0, color: colr[0], opacity: 1 },
          { offset: 100, color: colr[1], opacity: 1 },
        ]),
      },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 500,
            offsetY: -10,
            formatter: () => 'Total',
          },
          value: {
            offsetY: 0,
            fontSize: '16px',
            fontWeight: 600,
            formatter: (val) => `${val.toFixed(1)}%`,
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '16px',
            fontWeight: 600,
            formatter: () => formatCurrency(bank + cash),
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, w }) => {
        const label = w.config.labels[seriesIndex];
        const color = w.config.colors[seriesIndex];
        const percentage = series[seriesIndex].toFixed(1);
        const rawValue = rawValues[seriesIndex] || 0;
        return `
          <div style='padding:8px; display:flex; align-items:center; font-weight:600; font-size:14px;'>
            <span style='width:12px; height:12px; border-radius:50%; background:${color}; display:inline-block; margin-right:8px;'></span>
            <span>${label}: ${percentage}% (${formatCurrency(rawValue)})</span>
          </div>
        `;
      },
    },
    legend: { show: false },
    ...options,
  });

  const isChartEmpty =
    !chartSeries.length || chartSeries.every((val) => !val);
  const isBanksEmpty = !Array.isArray(banks) || banks.length === 0;

  return (
    <Card {...other} sx={{ p: 3 }}>
      {isChartEmpty && isBanksEmpty ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant='h6' color='text.secondary'>
            No data available
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledChart
              dir='ltr'
              type='radialBar'
              series={chartSeries}
              options={chartOptions}
              width='100%'
              height={CHART_HEIGHT}
            />
            <Typography variant='subtitle2' align='center' sx={{ mt: 2 }}>
              <Box
                component='span'
                sx={{ color: labelColorMap['Cash'][1], fontWeight: 'bold' }}
              >
                {formatCurrency(cash)}
              </Box>
              {' + '}
              <Box
                component='span'
                sx={{ color: labelColorMap['Bank'][1], fontWeight: 'bold' }}
              >
                {formatCurrency(bank)}
              </Box>
              {' = '}
              <Box
                component='span'
                sx={{ color: 'text.primary', fontWeight: 'bold' }}
              >
                {formatCurrency(total)}
              </Box>
              {' Total (Cash + Bank)'}
            </Typography>
            <Stack
              direction='row'
              justifyContent='center'
              spacing={3}
              sx={{ mt: 2 }}
            >
              {series.map((item, index) => (
                <Stack
                  key={index}
                  direction='row'
                  alignItems='center'
                  spacing={1}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: colors[index][1],
                    }}
                  />
                  <Typography variant='body2'>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {banks.map((bank, index) => (
                <Grid key={index} item xs={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      bgcolor: 'background.paper',
                    }}
                  >
                    {/* Optional Avatar if logos are available */}
                    {/* <Avatar alt={bank.name} src={bank.logo} sx={{ mr: 2 }} /> */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant='subtitle2'
                        sx={{
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                        }}
                      >
                        {`${bank.name}(${bank.bankHolderName})`}
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        fontWeight='bold'
                        whiteSpace='nowrap'
                      >
                        {formatCurrency(bank.amount)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Card>
  );
}

EcommerceSaleByGender.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  banks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      amount: PropTypes.number,
      color: PropTypes.string,
      logo: PropTypes.string,
    })
  ),
};
