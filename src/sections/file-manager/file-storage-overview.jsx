import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import Chart, { useChart } from 'src/components/chart';

export default function FileStorageOverview({ cash, bank, total, banks }) {
  const theme = useTheme();

  const remaining = Math.max(total - (cash + bank), 0);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { lineCap: 'round' },
    legend: { show: false },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { size: '60%' },
        track: { background: '#f0f0f0' },
        dataLabels: { show: false },
      },
    },
    colors: ['#FFA500', '#A020F0', '#E0E0E0'], // Orange, Purple, Light Gray
  });

  return (
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: 3, borderRadius: 3, boxShadow: 3 }}>
      {/* Left: Chart */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 200,
        }}
      >
        <Chart
          type='radialBar'
          series={[cash, bank, remaining]}
          options={chartOptions}
          height={200}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant='subtitle2'>
            <Box component='span' sx={{ color: '#FFA500', fontWeight: 600 }}>{cash}</Box> /
            <Box component='span' sx={{ color: '#A020F0', fontWeight: 600, mx: 0.5 }}>{bank}</Box> =
            <Box component='span' sx={{ color: '#00B050', fontWeight: 600, ml: 0.5 }}>{total}</Box>
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Total (Cash + Bank)
          </Typography>
        </Box>
      </Box>

      {/* Right: Bank Cards */}
    </Card>
  );
}

FileStorageOverview.propTypes = {
  cash: PropTypes.number.isRequired,
  bank: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  banks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      logo: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
