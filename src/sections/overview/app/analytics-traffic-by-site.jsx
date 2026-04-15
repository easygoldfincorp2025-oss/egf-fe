import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Iconify from 'src/components/iconify/index.js';

// ----------------------------------------------------------------------

const formatCurrency = (value) =>
  `₹ ${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AnalyticsTrafficBySite({ title, list = [] }) {
  const [totalItem, ...averages] = list;

  if (list.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant='h6' color='text.secondary' align='center'>
          No data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: '#eceaea',
          p: 2,
          mb: 2,
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <Iconify icon='eva:trending-up-fill' width={24} />
            </Avatar>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                {totalItem.label}
              </Typography>
              <Typography variant='h6'>
                {formatCurrency(totalItem.value)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Box display='grid' gridTemplateColumns='repeat(2, 1fr)' gap={2}>
        {averages.map((item, index) => (
          <Paper
            key={index}
            variant='outlined'
            sx={{ borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='body2'>{item.label}</Typography>
            </Stack>
            <Typography variant='h6'>
              {formatCurrency(item.value)}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Card>
  );
}

AnalyticsTrafficBySite.propTypes = {
  title: PropTypes.string,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      change: PropTypes.number,
      positive: PropTypes.bool,
    }),
  ),
};
