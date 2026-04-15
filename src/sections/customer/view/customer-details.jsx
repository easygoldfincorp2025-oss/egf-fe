import React, { useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
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
import { Icon } from '@iconify/react';
import { paths } from '../../../routes/paths.js';
import { useRouter } from '../../../routes/hooks/index.js';
import { useGetLoanissue } from '../../../api/loanissue.js';
import { useSnackbar } from 'notistack';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Blocked', label: 'Blocked' },
];

export default function CustomerDetails({ selectedRow }) {
  if (!selectedRow) return null;

  const { Loanissue } = useGetLoanissue();
  const router = useRouter();
  const isLoan = Boolean(selectedRow?.loan);
  const loan = isLoan ? selectedRow?.loan : {};
  const customer = isLoan ? loan?.customer || {} : selectedRow;
  const { enqueueSnackbar } = useSnackbar();
  const address = customer?.permanentAddress || {};
  const tempAddress = customer?.temporaryAddress || {};
  const nominee = customer?.nominee || {};
  const bankDetails = customer?.bankDetails || [];
  const scheme = loan?.scheme || {};
  const [openBank, setOpenBank] = useState(true);
  const [openLoan, setOpenLoan] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const cutOffDate = new Date();
  const interestRate = loan?.issueDate
    ? new Date(loan.issueDate) > cutOffDate
      ? loan?.scheme?.interestRate > 1
        ? 1
        : loan?.scheme?.interestRate
      : loan?.scheme?.interestRate > 1.5
        ? 1.5
        : loan?.scheme?.interestRate
    : null;

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.customer.edit(id));
    },
    [router]
  );

  const handleCopy = (value) => {
    if (value) {
      navigator.clipboard.writeText(value);
      setSnackbar({ open: true, message: `Copied: ${value}` });
    }
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Customer Profile
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit Customer">
            <Button
              variant="contained"
              startIcon={<Icon icon="solar:pen-bold" />}
              onClick={() => handleEditRow(customer?._id)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="View All Loans">
            <Button
              variant="outlined"
              startIcon={<Icon icon="mdi:cash-multiple" />}
              onClick={() => {
                const loanNumbers =
                  Loanissue?.filter(
                    (l) => l?.customer?._id === customer?._id && l?.status !== 'Closed'
                  )?.map((l) => l.loanNo) || [];

                if (!loanNumbers.length) {
                  return enqueueSnackbar('No loan found for this customer.', { variant: 'error' });
                }

                sessionStorage.setItem(
                  'data',
                  JSON.stringify({ customer, filteredLoanNo: loanNumbers })
                );
                router.push(paths.dashboard.loanPayHistory.bulk);
              }}
            >
              Loans
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={customer?.avatar_url}
              alt="Customer"
              sx={{ width: 100, height: 100, border: '2px solid #ddd', cursor: 'pointer' }}
              onClick={() => window.open(customer?.avatar_url, '_blank')}
            />
          </Grid>
          {loan?.propertyImage && (
            <Grid item>
              <Avatar
                src={loan.propertyImage}
                alt="Property"
                sx={{ width: 100, height: 100, border: '2px solid #ddd', cursor: 'pointer' }}
                onClick={() => window.open(loan?.propertyImage, '_blank')}
              />
            </Grid>
          )}
          <Grid item xs>
            <Typography variant="h6" fontWeight="bold">
              {customer?.firstName} {customer?.middleName} {customer?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer Code: <strong>{customer?.customerCode || 'N/A'}</strong>
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              <Chip
                label={customer?.status || 'Active'}
                color={
                  customer?.status === 'Inactive'
                    ? 'error'
                    : customer?.status === 'Blocked'
                      ? 'warning'
                      : 'success'
                }
                size="small"
              />
              {customer?.isAadharVerified && (
                <Chip
                  icon={<Icon icon="mdi:check-decagram" />}
                  label="Aadhaar Verified"
                  color="primary"
                  size="small"
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <SectionCard title="Personal Information">
        <Grid container spacing={2}>
          <InfoItem
            icon="mdi:phone"
            label="Mobile No."
            value={customer?.contact}
            onCopy={handleCopy}
          />
          <InfoItem
            icon="mdi:phone-check"
            label="OTP Mobile No."
            value={customer?.otpContact}
            onCopy={handleCopy}
          />
          <InfoItem icon="mdi:email" label="Email" value={customer?.email} onCopy={handleCopy} />
          <InfoItem
            icon="mdi:cake-variant"
            label="DOB"
            value={customer?.dob ? fDate(customer?.dob) : ''}
          />
          <InfoItem
            icon="mdi:id-card"
            label="Aadhaar No."
            value={customer?.aadharCard}
            onCopy={handleCopy}
          />
          <InfoItem
            icon="mdi:card-account-details"
            label="PAN No."
            value={customer?.panCard}
            onCopy={handleCopy}
          />
          <InfoItem
            icon="mdi:card-account-details-outline"
            label="Driving License"
            value={customer?.drivingLicense}
          />
          <InfoItem icon="mdi:factory" label="Business" value={customer?.business} />
          <InfoItem icon="mdi:domain" label="Business Type" value={customer?.businessType} />
          <InfoItem icon="mdi:account-group" label="Reference By" value={customer?.referenceBy} />
          <InfoItem
            icon="mdi:calendar-start"
            label="Joining Date"
            value={customer?.joiningDate ? fDate(customer?.joiningDate) : ''}
          />
        </Grid>
      </SectionCard>
      <SectionCard title="Addresses">
        <Grid container spacing={2}>
          <AddressBlock title="Permanent Address" data={address} />
          <AddressBlock title="Temporary Address" data={tempAddress} />
        </Grid>
      </SectionCard>
      {nominee?.name && (
        <SectionCard title="Nominee Details">
          <Grid container spacing={2}>
            <InfoItem label="Name" value={nominee?.name} />
            <InfoItem label="DOB" value={nominee?.dob ? fDate(nominee?.dob) : ''} />
            <InfoItem label="Relation" value={nominee?.relation} />
          </Grid>
        </SectionCard>
      )}
      <SectionCard
        title="Bank Details"
        collapsible
        open={openBank}
        onToggle={() => setOpenBank(!openBank)}
      >
        {bankDetails.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account Holder</TableCell>
                  <TableCell>Account No</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>IFSC</TableCell>
                  <TableCell>Bank Name</TableCell>
                  <TableCell>Branch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bankDetails.map((bank, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{bank.accountHolderName || '—'}</TableCell>
                    <TableCell>{bank.accountNumber || '—'}</TableCell>
                    <TableCell>{bank.accountType || '—'}</TableCell>
                    <TableCell>{bank.IFSC || '—'}</TableCell>
                    <TableCell>{bank.bankName || '—'}</TableCell>
                    <TableCell>{bank.branchName || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" mt={2}>
            No bank details available
          </Typography>
        )}
      </SectionCard>
      {isLoan && (
        <SectionCard
          title="Loan Details"
          collapsible
          open={openLoan}
          onToggle={() => setOpenLoan(!openLoan)}
        >
          <Grid container spacing={2} mt={1}>
            <InfoItem label="Loan No" value={loan?.loanNo} />
            <InfoItem label="Issue Date" value={loan?.issueDate ? fDate(loan?.issueDate) : ''} />
            <InfoItem label="Interest Rate" value={interestRate ? `${interestRate}%` : '—'} />
          </Grid>
        </SectionCard>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

function SectionCard({ title, children, collapsible = false, open, onToggle }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="600">
          {title}
        </Typography>
        {collapsible && (
          <Tooltip title={open ? 'Collapse' : 'Expand'}>
            <IconButton onClick={onToggle}>
              <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Divider sx={{ my: 2 }} />
      {collapsible ? <Collapse in={open}>{children}</Collapse> : children}
    </Paper>
  );
}

function InfoItem({ icon, label, value, onCopy }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && <Icon icon={icon} width={18} height={18} />}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="subtitle2">{value || '—'}</Typography>
            {onCopy && value && (
              <Tooltip title="Copy">
                <IconButton size="small" onClick={() => onCopy(value)}>
                  <Icon icon="mdi:content-copy" width={14} height={14} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>
    </Grid>
  );
}

function AddressBlock({ title, data }) {
  const addressString =
    [data.street, data.landmark, data.area, data.city, data.state, data.country, data.zipcode]
      .filter(Boolean)
      .join(', ') || 'Not Provided';

  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle2" gutterBottom fontWeight="600">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {addressString}
      </Typography>
    </Grid>
  );
}
