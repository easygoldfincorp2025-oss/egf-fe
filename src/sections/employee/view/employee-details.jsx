import React, { useCallback, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from '../../../routes/hooks/index.js';
import { paths } from '../../../routes/paths.js';
import { useSnackbar } from 'notistack';
import { fDate } from '../../../utils/format-time.js';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Iconify from '../../../components/iconify/index.js';

export default function EmployeeDetails({ selectedRow }) {
  if (!selectedRow) return null;

  const normalizedStatus = (selectedRow?.status || '').toLowerCase();
  const statusMap = {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'warning' },
    block: { label: 'Blocked', color: 'error' },
  };

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const employee = selectedRow?.user || {};
  const branch = employee?.branch || {};
  const company = selectedRow?.company || {};
  const bankDetails = company?.bankAccounts || [];
  const reportingTo = selectedRow?.reportingTo || {};
  const documents = {
    PAN: selectedRow?.panCard,
    Aadhaar: selectedRow?.aadharCard,
    DrivingLicense: selectedRow?.drivingLicense,
    VoterID: selectedRow?.voterCard,
  };

  const employeeFullName =
    `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`.trim();

  const employeeBankDetails = [
    ...(bankDetails.filter(
      (bank) => bank.accountHolderName?.toLowerCase() === employeeFullName.toLowerCase()
    ) || []),
    ...(selectedRow.bankDetails ? [selectedRow.bankDetails] : []),
  ];

  const [tabValue, setTabValue] = useState(0);

  const handleCopy = (value, label) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      enqueueSnackbar(`Copied ${label}: ${value}`, { variant: 'success' });
    });
  };

  const handleQuickContact = (type, value) => {
    if (!value) return;
    if (type === 'phone') window.open(`tel:${value}`);
    if (type === 'email') window.open(`mailto:${value}`);
    if (type === 'whatsapp') window.open(`https://wa.me/${value}`);
  };

  const handleEditRow = useCallback(
    (id) => router.push(paths.dashboard.employee.edit(id)),
    [router]
  );

  return (
    <Box p={isSmDown ? 1 : 3}>
      <Stack
        direction={isSmDown ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isSmDown ? 'flex-start' : 'center'}
        mb={3}
        spacing={1}
      >
        <Typography variant="h4" fontWeight="bold">
          Employee Profile
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon icon="solar:pen-bold" />}
            onClick={() => handleEditRow(employee?._id)}
          >
            Edit
          </Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={employee?.avatar_url}
              alt={employeeFullName}
              sx={{
                width: 100,
                height: 100,
                border: '2px solid #ddd',
                cursor: employee?.avatar_url ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': { transform: employee?.avatar_url ? 'scale(1.05)' : 'none' },
              }}
              onClick={() => employee?.avatar_url && window.open(employee.avatar_url, '_blank')}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold" noWrap>
              {employeeFullName || '—'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={1}>
              Role: <strong>{employee?.role || 'Employee'}</strong>
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
              <Chip
                label={statusMap[normalizedStatus]?.label || '—'}
                color={statusMap[normalizedStatus]?.color || 'default'}
                size="small"
              />
              <Chip label={`Branch: ${branch?.name || '—'}`} color="info" size="small" />
            </Stack>
            <Stack direction="row" spacing={1}>
              {employee.contact && (
                <Tooltip title="Call">
                  <IconButton
                    color="primary"
                    onClick={() => handleQuickContact('phone', employee.contact)}
                  >
                    <Icon icon="mdi:phone" />
                  </IconButton>
                </Tooltip>
              )}
              {employee.email && (
                <Tooltip title="Email">
                  <IconButton
                    color="primary"
                    onClick={() => handleQuickContact('email', employee.email)}
                  >
                    <Icon icon="mdi:email" />
                  </IconButton>
                </Tooltip>
              )}
              {employee.contact && (
                <Tooltip title="WhatsApp">
                  <IconButton
                    color="success"
                    onClick={() => handleQuickContact('whatsapp', employee.contact)}
                  >
                    <Icon icon="mdi:whatsapp" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ borderRadius: 3, mb: 3, boxShadow: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab icon={<Icon icon="mdi:account" />} iconPosition="start" label="Personal Info" />
          <Tab
            icon={<Icon icon="mdi:office-building" />}
            iconPosition="start"
            label="Branch Info"
          />
          <Tab icon={<Icon icon="mdi:bank" />} iconPosition="start" label="Bank Details" />
          <Tab icon={<Icon icon="mdi:file-document" />} iconPosition="start" label="Documents" />
          <Tab icon={<Icon icon="mdi:account-tie" />} iconPosition="start" label="Manager" />
        </Tabs>
      </Paper>
      {tabValue === 0 && (
        <SectionCard title="Personal Information">
          <Grid container spacing={2}>
            <InfoItem
              icon="mdi:phone"
              label="Mobile No."
              value={employee?.contact}
              onCopy={() => handleCopy(employee?.contact, 'Mobile')}
            />
            <InfoItem
              icon="mdi:phone"
              label="Father Mobile No."
              value={selectedRow?.user?.fatherContact}
              onCopy={() => handleCopy(selectedRow?.user?.fatherContact, 'Mobile')}
            />
            <InfoItem
              icon="mdi:email"
              label="Email"
              value={employee?.email}
              onCopy={() => handleCopy(employee?.email, 'Email')}
            />
            <InfoItem
              icon="mdi:calendar-start"
              label="Joining Date"
              value={employee?.createdAt ? fDate(employee.createdAt) : '—'}
            />
            <InfoItem
              icon="mdi:calendar"
              label="Date of Birth"
              value={selectedRow?.dob ? fDate(selectedRow.dob) : '—'}
            />
            <InfoItem icon="mdi:note" label="Remark" value={selectedRow?.remark || '—'} />
          </Grid>
        </SectionCard>
      )}
      {tabValue === 1 && (
        <SectionCard title="Branch Information">
          <Grid container spacing={2}>
            <InfoItem label="Branch Name" value={branch?.name} />
            <InfoItem label="Branch Code" value={branch?.branchCode} />
            <InfoItem label="Branch Contact" value={branch?.contact} />
            <AddressBlock title="Branch Address" data={branch?.address || {}} />
          </Grid>
        </SectionCard>
      )}
      {tabValue === 2 && (
        <SectionCard title="Bank Details">
          {employeeBankDetails.length ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bank</TableCell>
                    <TableCell>Account Holder</TableCell>
                    <TableCell>Account No</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell>IFSC</TableCell>
                    <TableCell>Branch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeBankDetails.map((bank) => (
                    <TableRow key={bank._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {bank.bankLogo ? (
                            <Avatar
                              src={bank.bankLogo}
                              alt={bank.bankName}
                              sx={{ width: 24, height: 24 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                              {bank.bankName?.charAt(0)}
                            </Avatar>
                          )}
                          <Typography variant="body2">{bank.bankName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{bank.accountHolderName}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">{bank.accountNumber}</Typography>
                          <Tooltip title="Copy Account Number">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(bank.accountNumber, 'Account No')}
                            >
                              <Iconify icon="ic:round-content-copy" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>{bank.accountType}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">{bank.IFSC}</Typography>
                          <Tooltip title="Copy IFSC">
                            <IconButton size="small" onClick={() => handleCopy(bank.IFSC, 'IFSC')}>
                              <Iconify icon="ic:round-content-copy" width={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>{bank.branchName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No bank details available
            </Typography>
          )}
        </SectionCard>
      )}
      {tabValue === 3 && (
        <SectionCard title="Documents">
          <Grid container spacing={2}>
            {Object.entries(documents).map(([key, value]) => (
              <InfoItem
                key={key}
                label={key}
                value={value || '—'}
                onCopy={value ? () => handleCopy(value, key) : undefined}
              />
            ))}
          </Grid>
        </SectionCard>
      )}
      {tabValue === 4 && (
        <SectionCard title="Reporting Manager">
          {reportingTo?._id ? (
            <Grid container spacing={2}>
              <InfoItem
                icon="mdi:account"
                label="Name"
                value={`${reportingTo.firstName} ${reportingTo.middleName || ''} ${reportingTo.lastName}`}
              />
              <InfoItem label="Role" value={reportingTo.role} />
              <InfoItem
                icon="mdi:email"
                label="Email"
                value={reportingTo.email}
                onCopy={() => handleCopy(reportingTo.email, 'Manager Email')}
              />
              <InfoItem
                icon="mdi:phone"
                label="Contact"
                value={reportingTo.contact}
                onCopy={() => handleCopy(reportingTo.contact, 'Manager Contact')}
              />
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No reporting manager assigned
            </Typography>
          )}
        </SectionCard>
      )}
    </Box>
  );
}

function SectionCard({ title, children }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: 1 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}

function InfoItem({ icon, label, value, onCopy }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && <Icon icon={icon} width={18} height={18} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body1"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {value || '—'}
            </Typography>
            {value && onCopy && (
              <Tooltip title="Copy">
                <IconButton size="small" onClick={onCopy}>
                  <Icon icon="mdi:content-copy" width={16} height={16} />
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
  if (!data) return null;
  const fullAddress = [
    data.street,
    data.landmark,
    data.area,
    data.city,
    data.state,
    data.country,
    data.zipcode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Grid item xs={12}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body1">{fullAddress || '—'}</Typography>
    </Grid>
  );
}
