import React, { useCallback, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { fDate } from '../../../utils/format-time.js';
import Iconify from '../../../components/iconify';
import { paths } from '../../../routes/paths.js';
import { useRouter } from '../../../routes/hooks/index.js';
import { Icon } from '@iconify/react';

export default function OtherLoanIssueDetails({ selectedRow }) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    property: true,
    customer: true,
    loan: true,
    otherLoan: true,
    payment: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  if (!selectedRow) return null;

  const loan = selectedRow?.loan || {};
  const customer = loan?.customer || {};
  const address = customer.permanentAddress || {};
  const bank = selectedRow.bankDetails || {};
  const propertyDetails = loan?.propertyDetails || [];

  const cutOffDate = new Date('2025-08-01');
  const interestRate =
    new Date(loan?.issueDate) > cutOffDate
      ? loan?.scheme?.interestRate > 1
        ? 1
        : loan?.scheme?.interestRate
      : loan?.scheme?.interestRate > 1.5
        ? 1.5
        : loan?.scheme?.interestRate;

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    setSnackbar({ open: true, message: `${value} copied to clipboard!` });
  };

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.other_loanissue.edit(id));
    },
    [router]
  );

  const Section = ({ title, icon, sectionKey, badge, children }) => (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: 3,
        transition: '0.3s',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ cursor: 'pointer', mb: 1 }}
          onClick={() => toggleSection(sectionKey)}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography variant="h6" color="primary" fontWeight="bold">
              {title}
            </Typography>
            {badge && (
              <Chip
                size="small"
                label={badge}
                color="secondary"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Stack>
          <IconButton size="small">
            <Iconify
              icon="mdi:chevron-down"
              style={{
                transform: openSections[sectionKey] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          </IconButton>
        </Box>
        <Collapse in={openSections[sectionKey]}>{children}</Collapse>
      </CardContent>
    </Card>
  );

  return (
    <Box p={2}>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="mdi:currency-inr" color="primary" width={28} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Other Loan AMT
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ₹ {selectedRow?.otherLoanAmount}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="mdi:percent" color="error" width={28} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Other Loan Int.Rate
                </Typography>
                <Chip label={`${selectedRow?.percentage}%`} color="error" size="small" />
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="mdi:diamond-stone" color="success" width={28} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Ornaments
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {selectedRow.totalOrnament || propertyDetails.length}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Box
        display="flex"
        gap={3}
        alignItems="center"
        mb={3}
        p={3}
        borderRadius={3}
        boxShadow="0 4px 12px rgba(0,0,0,0.05)"
        bgcolor="background.paper"
      >
        <Avatar
          src={customer.avatar_url}
          alt="Customer"
          sx={{
            width: 90,
            height: 90,
            border: '2px solid #eee',
            bgcolor: 'primary.light',
            fontSize: 28,
            fontWeight: 'bold',
          }}
        >
          {customer.firstName?.[0]}
        </Avatar>
        {loan.propertyImage && (
          <Avatar
            src={loan.propertyImage}
            alt="Property"
            variant="rounded"
            sx={{ width: 90, height: 90, border: '2px solid #eee' }}
          />
        )}
        <Box flexGrow={1}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {customer.firstName} {customer.lastName}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            <Chip
              label={selectedRow?.loan?.status || 'Active'}
              color={
                selectedRow?.loan?.status === 'Inactive'
                  ? 'error'
                  : selectedRow?.loan?.status === 'Blocked'
                    ? 'warning'
                    : selectedRow?.loan?.status === 'Overdue'
                      ? 'error'
                      : selectedRow?.loan?.status === 'Closed'
                        ? 'default'
                        : selectedRow?.loan?.status === 'Disbursed'
                          ? 'info'
                          : selectedRow?.loan?.status === 'Regular'
                            ? 'success'
                            : 'success'
              }
              size="small"
              variant="filled"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Loan No: <b>{loan.loanNo}</b> • {loan.loanType}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Edit Loan">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon icon="solar:pen-bold" />}
              onClick={() => handleEditRow(selectedRow?._id)}
            >
              Edit
            </Button>
          </Tooltip>
        </Stack>
      </Box>
      <Section
        title="Customer Details"
        icon={<Iconify icon="mdi:account-circle-outline" />}
        sectionKey="customer"
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6} md={4}>
            <b>Customer Code:</b> {customer.customerCode}{' '}
            <Tooltip title="Copy Code">
              <IconButton size="small" onClick={() => copyToClipboard(customer.customerCode)}>
                <Iconify icon="mdi:content-copy" width={16} />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Name:</b> {customer.firstName} {customer.middleName} {customer.lastName}
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <b>Address:</b>{' '}
            {`${address.street || ''}, ${address.landmark || ''}, ${address.city || ''}, ${
              address.zipcode || ''
            }`}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Mobile No.:</b> {customer.contact}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>OTP Mobile No.:</b> {customer.otpContact}
          </Grid>
        </Grid>
      </Section>
      <Section
        title="Other Loan Details"
        icon={<Iconify icon="mdi:handshake-outline" />}
        sectionKey="otherLoan"
      >
        {Object.keys(selectedRow).length ? (
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6} md={4}>
              <b>Code:</b> {selectedRow.code}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Other Name:</b> {selectedRow.otherName}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Other Number:</b> {selectedRow.otherNumber}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Amount:</b>{' '}
              <Typography fontWeight="bold" color="primary">
                ₹ {selectedRow.amount}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Percentage:</b> {selectedRow.percentage} %
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Date:</b> {fDate(selectedRow.date)}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Renewal Date:</b> {fDate(selectedRow.renewalDate)}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Ornament Detail:</b> {selectedRow.ornamentDetail}
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <b>Remark:</b>{' '}
              <Tooltip title={selectedRow.remark || ''}>
                <span>{selectedRow.remark}</span>
              </Tooltip>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No other loan details available.
          </Typography>
        )}
      </Section>
      <Section
        title="Payment Details"
        icon={<Iconify icon="mdi:credit-card-outline" />}
        sectionKey="payment"
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6} md={4}>
            <b>Payment Mode:</b> <Chip label={selectedRow.paymentMode} color="info" size="small" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Cash Amount:</b> ₹ {selectedRow.cashAmount}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Bank Amount:</b> ₹ {selectedRow.bankAmount}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Account No.:</b> {bank.accountNumber}{' '}
            <Tooltip title="Copy Account No">
              <IconButton size="small" onClick={() => copyToClipboard(bank.accountNumber)}>
                <Iconify icon="mdi:content-copy" width={16} />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Bank Name:</b> {bank.bankName}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Branch:</b> {bank.branchName}
          </Grid>
        </Grid>
      </Section>
      <Section
        title="Loan Details"
        icon={<Iconify icon="mdi:file-document-outline" />}
        sectionKey="loan"
      >
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6} md={4}>
            <b>Loan No.:</b> {loan.loanNo}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Issue Date:</b> {fDate(loan.issueDate)}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Total Wt:</b>{' '}
            {loan.propertyDetails.reduce(
              (prev, next) => prev + (Number(next?.totalWeight) || 0),
              0
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Net Wt:</b>{' '}
            {loan.propertyDetails.reduce((prev, next) => prev + (Number(next?.netWeight) || 0), 0)}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Total Loan Amount:</b>{' '}
            <Typography component="span" color="primary" fontWeight="bold">
              ₹ {loan.loanAmount}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Jeweller Name:</b> {loan.jewellerName}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Loan Type:</b>{' '}
            <Chip label={loan.loanType} color="primary" size="small" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <b>Loan Interest:</b>{' '}
            <Chip label={interestRate} color="primary" size="small" variant="outlined" />
          </Grid>
        </Grid>
      </Section>
      <Section
        title="Property Details"
        icon={<Iconify icon="mdi:diamond-stone" />}
        sectionKey="property"
        badge={propertyDetails.length}
      >
        {propertyDetails.length ? (
          <TableContainer component={Paper} sx={{ maxHeight: 300, borderRadius: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    'Property Name',
                    'Carat',
                    'Qty',
                    'Total Wt',
                    'Loss Wt',
                    'Gross Wt',
                    'Net Wt',
                    'Gross Amt',
                    'Net Amt',
                  ].map((header, idx) => (
                    <TableCell key={idx} align={idx >= 2 ? 'right' : 'left'}>
                      <b>{header}</b>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {propertyDetails.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{ bgcolor: idx % 2 === 0 ? 'background.default' : 'background.paper' }}
                  >
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.carat}</TableCell>
                    <TableCell align="right">{row.pcs}</TableCell>
                    <TableCell align="right">{Number(row.totalWeight || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(row.lossWeight || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(row.grossWeight || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(row.netWeight || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(row.grossAmount || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(row.netAmount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell colSpan={2}>
                    <b>Totals</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>{propertyDetails.reduce((a, b) => a + (Number(b.pcs) || 0), 0)}</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.totalWeight) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.lossWeight) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.grossWeight) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.netWeight) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.grossAmount) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {propertyDetails
                        .reduce((a, b) => a + (Number(b.netAmount) || 0), 0)
                        .toFixed(2)}
                    </b>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No property details available.
          </Typography>
        )}
      </Section>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
