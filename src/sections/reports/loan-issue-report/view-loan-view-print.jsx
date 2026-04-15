import React, { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Iconify from '../../../components/iconify';

function ViewLoanViewPrint({ selectedRow, onBack }) {
  const [showPropertyImage, setShowPropertyImage] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!selectedRow) return null;

  const {
    loanNo,
    status,
    customer,
    scheme,
    issueDate,
    loanAmount,
    consultingCharge,
    approvalCharge,
    jewellerName,
    propertyDetails,
    propertyImage,
    nextInstallmentDate,
    loanType,
    issuedBy,
    closedBy,
    uchakInterestAmount,
    interestLoanAmount,
    amountPaid,
    bankAmount,
    cashAmount,
    pendingBankAmount,
    pendingCashAmount,
    paymentMode,
  } = selectedRow;

  const totalNetAmount = useMemo(
    () => propertyDetails?.reduce((sum, item) => sum + Number(item?.netAmount || 0), 0),
    [propertyDetails]
  );

  const formatCurrency = (num) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'N/A';

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight="bold">
            Loan #{loanNo}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={status}
              color={
                status === 'Issued'
                  ? 'success'
                  : status === 'Pending'
                    ? 'warning'
                    : status === 'Closed'
                      ? 'info'
                      : 'default'
              }
              sx={{ fontWeight: 'bold' }}
            />
            <Tooltip title="Copy Loan No">
              <IconButton size="small" onClick={() => handleCopy(loanNo)}>
                <Iconify icon="mdi:content-copy" width={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} mt={{ xs: 2, md: 0 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:printer" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
        </Stack>
      </Paper>
      <Grid container spacing={3} mb={3}>
        {[
          {
            label: 'Loan Amount',
            value: formatCurrency(loanAmount),
            color: 'primary',
            icon: 'mdi:cash',
          },
          {
            label: 'Amount Paid',
            value: formatCurrency(amountPaid),
            color: 'success',
            icon: 'mdi:check-decagram',
          },
          {
            label: 'Pending',
            value: formatCurrency(pendingBankAmount + pendingCashAmount),
            color: pendingBankAmount + pendingCashAmount > 0 ? 'error' : 'success',
            icon: 'mdi:clock-alert',
          },
          {
            label: 'Next Installment',
            value: formatDate(issueDate),
            color: 'warning',
            icon: 'mdi:calendar',
          },
        ].map((item, idx) => (
          <Grid item xs={12} md={3} key={idx}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                borderLeft: `5px solid ${
                  item.color === 'error'
                    ? '#d32f2f'
                    : item.color === 'success'
                      ? '#2e7d32'
                      : item.color === 'primary'
                        ? '#1976d2'
                        : '#ed6c02'
                }`,
              }}
            >
              <Iconify icon={item.icon} width={28} color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={item.color}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader title="👤 Customer Info" />
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={customer?.avatar_url} sx={{ width: 72, height: 72 }}>
                  {customer?.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {customer?.firstName} {customer?.middleName} {customer?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {customer?.customerCode}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography>
                  <Iconify icon="mdi:phone" width={16} /> {customer?.contact}
                </Typography>
                <Typography>
                  <Iconify icon="mdi:email-outline" width={16} /> {customer?.email || 'N/A'}
                </Typography>
                <Typography>
                  <Iconify icon="mdi:account-heart" width={16} /> Nominee: {customer?.nominee?.name}{' '}
                  {customer?.nominee?.relation && `(${customer?.nominee?.relation})`}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Permanent Address
                </Typography>
                <Typography color="text.secondary">
                  {customer?.permanentAddress?.street}, {customer?.permanentAddress?.area},{' '}
                  {customer?.permanentAddress?.city}, {customer?.permanentAddress?.state} -{' '}
                  {customer?.permanentAddress?.zipcode}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, mt: 1 }}>
            <CardHeader title="📑 KYC Details" />
            <CardContent>
              <Stack spacing={1}>
                <Typography>
                  <b>PAN:</b> {customer?.panCard || 'N/A'}
                </Typography>
                <Typography>
                  <b>Aadhar:</b> {customer?.aadharCard || 'N/A'}
                </Typography>
                <Typography>
                  <b>DL:</b> {customer?.drivingLicense || 'N/A'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader title="🏦 Bank Details" />
              <CardContent>
                {customer?.bankDetails?.length > 0 ? (
                  <Stack spacing={2}>
                    {customer.bankDetails.map((bank, index) => (
                      <Box key={index} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                        <Typography>
                          <b>Holder Name:</b> {bank.accountHolderName}
                        </Typography>
                        <Typography>
                          <b>Bank:</b> {bank.bankName}
                        </Typography>
                        <Typography>
                          <b>Account:</b> {bank.accountNumber}{' '}
                          <Tooltip title="Copy Account No">
                            <IconButton size="small" onClick={() => handleCopy(bank.accountNumber)}>
                              <Iconify icon="mdi:content-copy" width={16} />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <Typography>
                          <b>IFSC:</b> {bank.IFSC}
                        </Typography>
                        <Typography>
                          <b>Branch:</b> {bank.branchName}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No bank details available</Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardHeader title="💰 Loan Details & Charges" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <b>Scheme:</b> {scheme?.name} ({scheme?.interestRate}% {scheme?.interestPeriod})
              </Typography>
              <Typography>
                <b>Jeweller:</b> {jewellerName}
              </Typography>
              <Typography>
                <b>Loan Type:</b> {loanType}
              </Typography>
              <Typography>
                <b>Interest Loan Amt:</b> {interestLoanAmount}
              </Typography>
              <Typography>
                <b>Payment Mode:</b> {paymentMode}
              </Typography>
              <Typography>
                <b>Issued By:</b> {issuedBy || 'N/A'}
              </Typography>
              <Typography>
                <b>Closed By:</b> {closedBy || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <b>Consulting Charge:</b> {formatCurrency(consultingCharge)}
              </Typography>
              <Typography>
                <b>Approval Charge:</b> {formatCurrency(approvalCharge)}
              </Typography><Typography>
                <b>Close Charge:</b> {formatCurrency(approvalCharge)}
              </Typography>
              <Typography>
                <b>Uchak Interest:</b> {formatCurrency(uchakInterestAmount)}
              </Typography>
              <Typography>
                <b>Interest Loan Amount:</b> {formatCurrency(interestLoanAmount)}
              </Typography>
              <Typography>
                <b>Bank Amount:</b> {formatCurrency(bankAmount)}
              </Typography>
              <Typography>
                <b>Cash Amount:</b> {formatCurrency(cashAmount)}
              </Typography>

            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardHeader title="📦 Property Details" />
        <CardContent>
          <Box overflow="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '8px' }}>Type</th>
                  <th>Carat</th>
                  <th>Pcs</th>
                  <th>Total Wt.</th>
                  <th>Net Wt.</th>
                  <th align="right">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {propertyDetails?.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee',textAlign:'center' }}>
                    <td>{p.type}</td>
                    <td>{p.carat}</td>
                    <td>{p.pcs}</td>
                    <td>{p.totalWeight}</td>
                    <td>{p.netWeight}</td>
                    <td align="right">{formatCurrency(p.netAmount)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <td colSpan={5} align="right">
                    <b>Total</b>
                  </td>
                  <td align="right">
                    <b>{formatCurrency(totalNetAmount)}</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
          {propertyImage && (
            <Box textAlign="center" mt={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <Iconify icon={showPropertyImage ? 'mdi:eye-off' : 'mdi:eye'} width={18} />
                }
                onClick={() => setShowPropertyImage((prev) => !prev)}
              >
                {showPropertyImage ? 'Hide Image' : 'View Image'}
              </Button>
              <Collapse in={showPropertyImage}>
                <Box mt={2}>
                  <img
                    src={propertyImage}
                    alt="Property"
                    style={{
                      maxWidth: '100%',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setOpenImageDialog(true)}
                  />
                </Box>
              </Collapse>
            </Box>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Copied to clipboard!
        </Alert>
      </Snackbar>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent>
          <img
            src={propertyImage}
            alt="Full Property"
            style={{ width: '100%', borderRadius: 12 }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ViewLoanViewPrint;
