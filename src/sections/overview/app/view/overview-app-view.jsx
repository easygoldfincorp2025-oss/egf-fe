import React, { useState } from 'react';
import { Autocomplete, Box, Button, Container, Grid, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useRouter } from '../../../../routes/hooks';
import { paths } from '../../../../routes/paths';
import Iconify from '../../../../components/iconify';
import { useSettingsContext } from 'src/components/settings';
import {
  useGetAllInOutSummary,
  useGetAllLoanWt,
  useGetAllOtherLoanWt,
  useGetCombinedLoanStats,
  useGetInquirySummary,
  useGetLoanChart,
  useGetOtherLoanChart,
  useGetPaymentInOutSummary,
  useGetPortfolioSummary,
  useGetReferenceAreaSummary,
  useGetSchemeLoanSummary,
} from '../../../../api/dashboard';
import { useGetCustomer } from '../../../../api/customer';
import { useGetLoanissue } from '../../../../api/loanissue';
import { useGetCashTransactions } from '../../../../api/cash-transactions';
import { useGetBankTransactions } from '../../../../api/bank-transactions';
import { useAuthContext } from '../../../../auth/hooks';
import { useGetConfigs } from '../../../../api/config';
import { getResponsibilityValue } from '../../../../permission/permission';
import AppAreaInstalled from '../app-area-installed';
import AppCurrentDownload from '../app-current-download';
import AnalyticsCurrentVisits from '../analytics-current-visits';
import BankingBalanceStatistics from '../banking-balance-statistics';
import AnalyticsConversionRates from '../analytics-conversion-rates';
import BookingCheckInWidgets from '../booking-check-in-widgets';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTrafficBySite from '../analytics-traffic-by-site';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';

const timeRangeOptions = [
  { label: 'All', value: 'all' },
  { label: 'This Month', value: 'this_month' },
  { label: 'This Year', value: 'this_year' },
  { label: 'Last 2 Years', value: 'last_2_years' },
  { label: 'Last Year', value: 'last_year' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Week', value: 'this_week' },
];

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const { enqueueSnackbar } = useSnackbar();
  const { customer } = useGetCustomer();
  const { Loanissue } = useGetLoanissue();
  const settings = useSettingsContext();

  const [ranges, setRanges] = useState({
    customerRange: 'this_month',
    areaRange: 'this_month',
    referenceRange: 'this_month',
    inquiryRange: 'this_month',
    schemeLoanSummaryRange: 'this_month',
    chargeRange: 'this_month',
    interestRange: 'this_month',
    paymentInRange: 'this_month',
    paymentOutRange: 'this_month',
    expenseRange: 'this_month',
    differenceRange: 'this_month',
    totalLoanWt: 'this_month',
    otherTotalLoanWt: 'this_month',
  });

  const handleRangeChange = (key, value) => setRanges((p) => ({ ...p, [key]: value }));

  const { SchemeLoanSummary } = useGetSchemeLoanSummary(ranges.schemeLoanSummaryRange);
  const { InquirySummary } = useGetInquirySummary(ranges.inquiryRange);
  const { PortfolioSummary } = useGetPortfolioSummary();
  const { OtherLoanChart } = useGetOtherLoanChart();
  const { LoanChart } = useGetLoanChart();
  const { AllInOutSummary } = useGetAllInOutSummary();
  const { cashTransactions } = useGetCashTransactions();
  const { bankTransactions } = useGetBankTransactions();
  const { ReferenceAreaSummary: customerData } = useGetReferenceAreaSummary(
    ranges.customerRange,
    'customerstats'
  );
  const { ReferenceAreaSummary: areaData } = useGetReferenceAreaSummary(ranges.areaRange, 'areas');
  const { ReferenceAreaSummary: referenceData } = useGetReferenceAreaSummary(
    ranges.referenceRange,
    'references'
  );
  const { CombinedLoanStats: charges } = useGetCombinedLoanStats(ranges.chargeRange, 'charge');
  const { CombinedLoanStats: interest } = useGetCombinedLoanStats(ranges.interestRange, 'interest');
  const { PaymentInOutSummary: paymentIn } = useGetPaymentInOutSummary(
    ranges.paymentInRange,
    'receivableamt'
  );
  const { PaymentInOutSummary: paymentOut } = useGetPaymentInOutSummary(
    ranges.paymentOutRange,
    'payableamt'
  );
  const { PaymentInOutSummary: difference } = useGetPaymentInOutSummary(
    ranges.differenceRange,
    'receivablepayabledifference'
  );
  const { PaymentInOutSummary: expense } = useGetPaymentInOutSummary(
    ranges.expenseRange,
    'totalexpense'
  );
  const { loanWt: totalWt } = useGetAllLoanWt(ranges.totalLoanWt);
  const { otherLoanWt: otherTotalWt } = useGetAllOtherLoanWt(ranges.otherTotalLoanWt);

  let cashamount = 0,
    bankamount = 0;
  const bankMap = {};

  cashTransactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    cashamount += tx.category === 'Payment In' ? amt : -amt;
  });

  bankTransactions?.transactions?.forEach((tx) => {
    const amt = Number(tx.amount) || 0,
      sign = tx.category === 'Payment In' ? 1 : -1;
    bankamount += sign * amt;
    if (!bankMap[tx.bankName])
      bankMap[tx.bankName] = { amount: 0, bankHolderName: tx.bankHolderName || 'N/A' };
    bankMap[tx.bankName].amount += sign * amt;
  });

  const banks = Object.entries(bankMap)
    .filter(([n]) => n && n !== 'null' && n !== 'N/A')
    .map(([name, d]) => ({ name, amount: d.amount, bankHolderName: d.bankHolderName }));

  const analyticsData = [
    { label: 'Total Portfolio', value: PortfolioSummary?.data?.totalLoanPortfolio },
    { label: 'Total close Loan', value: PortfolioSummary?.data?.totalClosedLoanAmount },
    { label: 'This month Average', value: PortfolioSummary?.data?.monthlyAveragePortfolio },
  ];

  const filterByBranch = (list) => {
    const storedBranch = sessionStorage.getItem('selectedBranch');
    if (!storedBranch || storedBranch === 'all') return list;
    let parsed = storedBranch;
    try {
      parsed = JSON.parse(storedBranch);
    } catch {}
    return list.filter((i) => i?.branch?._id === parsed || i?.branch === parsed);
  };

  const customerOptions = customer.flatMap((c) =>
    [
      c.contact && { ...c, label: c.contact, uniqueKey: `${c._id}-contact` },
      c.otpContact &&
        c.otpContact !== c.contact && { ...c, label: c.otpContact, uniqueKey: `${c._id}-otp` },
    ].filter(Boolean)
  );

  const customStyle = {
    label: { mt: -0.8, fontSize: '14px' },
    '& .MuiInputLabel-shrink': { mt: 0 },
    input: { height: 7 },
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ bgcolor: '#eceaea', p: 5, borderRadius: '20px' }}
    >
      <Grid container spacing={3}>
        {getResponsibilityValue('select_customer', configs, user) && (
          <Grid item xs={12} md={6} lg={3}>
            <Autocomplete
              sx={customStyle}
              options={filterByBranch(customer)}
              getOptionLabel={(o) => `${o.firstName} ${o.lastName}`}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              onChange={(e, val) => {
                if (!val) return;
                const loanNumbers =
                  Loanissue?.filter(
                    (l) => l?.customer?._id === val._id && l?.status !== 'Closed'
                  )?.map((l) => l.loanNo) || [];
                if (!loanNumbers.length)
                  return enqueueSnackbar('No loan found for this customer.', { variant: 'error' });
                sessionStorage.setItem(
                  'data',
                  JSON.stringify({ customer: val, filteredLoanNo: loanNumbers })
                );
                router.push(paths.dashboard.loanPayHistory.bulk);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer" placeholder="Choose a customer" />
              )}
            />
          </Grid>
        )}
        {getResponsibilityValue('select_loan_no', configs, user) && (
          <Grid item xs={12} md={6} lg={3}>
            <Autocomplete
              sx={customStyle}
              options={filterByBranch(Loanissue)}
              getOptionLabel={(o) => o.loanNo}
              isOptionEqualToValue={(o, v) => o._id === v._id}
              onChange={(e, v) => v && router.push(paths.dashboard.loanPayHistory.edit(v._id))}
              renderInput={(params) => (
                <TextField {...params} label="Search Loan No" placeholder="Choose a loan number" />
              )}
            />
          </Grid>
        )}
        {getResponsibilityValue('select_mobile_no', configs, user) && (
          <Grid item xs={12} md={6} lg={3}>
            <Autocomplete
              sx={customStyle}
              options={filterByBranch(customerOptions)}
              getOptionLabel={(o) => o.label || ''}
              isOptionEqualToValue={(o, v) => o.uniqueKey === v.uniqueKey}
              onChange={(e, val) => {
                if (!val) return;
                const storedBranch = sessionStorage.getItem('selectedBranch');
                let parsed = storedBranch;
                if (storedBranch && storedBranch !== 'all')
                  try {
                    parsed = JSON.parse(storedBranch);
                  } catch {}
                const loanNumbers =
                  Loanissue?.filter(
                    (l) =>
                      l?.customer?._id === val._id &&
                      (storedBranch === 'all' || l?.branch?._id === parsed || l?.branch === parsed)
                  )?.map((l) => l.loanNo) || [];
                if (!loanNumbers.length)
                  return enqueueSnackbar('No loan found for this customer.', { variant: 'error' });
                sessionStorage.setItem(
                  'data',
                  JSON.stringify({ customer: val, filteredLoanNo: loanNumbers })
                );
                router.push(paths.dashboard.loanPayHistory.bulk);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Mobile No"
                  placeholder="Choose a mobile number"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.uniqueKey}>
                  {option.label}
                </li>
              )}
            />
          </Grid>
        )}
        {getResponsibilityValue('select_calculator', configs, user) && (
          <Grid item xs={12} md={6} lg={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              style={{ height: '100%' }}
              startIcon={<Iconify icon="mdi:calculator" width={24} />}
              href={paths.dashboard.goldLoanCalculator}
            >
              Calculator
            </Button>
          </Grid>
        )}
        {getResponsibilityValue('expense_box', configs, user) && (
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Expense"
              total={expense?.totalExpense}
              days={expense?.avgExpensePerDay}
              icon={<Iconify icon="arcticons:expense" width={30} />}
              filter="this_month"
              filterOptions={timeRangeOptions}
              onFilterChange={(val) => handleRangeChange('expenseRange', val)}
              color="error"
            />
          </Grid>
        )}
        {getResponsibilityValue('payment_in_box', configs, user) && (
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Payment In"
              total={paymentIn?.receivableAmt}
              days={paymentIn?.avgReceivablePerDay}
              icon={<Iconify icon="zondicons:arrow-thin-down" width={30} />}
              filter="this_month"
              filterOptions={timeRangeOptions}
              onFilterChange={(val) => handleRangeChange('paymentInRange', val)}
              color="success"
            />
          </Grid>
        )}
        {getResponsibilityValue('payment_out_box', configs, user) && (
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Payment Out"
              total={paymentOut?.payableAmt}
              days={paymentOut?.avgPayablePerDay}
              icon={<Iconify icon="zondicons:arrow-thin-up" width={30} />}
              filter="this_month"
              filterOptions={timeRangeOptions}
              onFilterChange={(val) => handleRangeChange('paymentOutRange', val)}
              color="warning"
            />
          </Grid>
        )}
        {getResponsibilityValue('payment_diff_box', configs, user) && (
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Payment Diff"
              total={difference.receivablePayableDifference}
              days={difference.avgReceivablePayablePerDay}
              icon={<Iconify icon="tabler:arrows-diff" width={30} />}
              filter="this_month"
              filterOptions={timeRangeOptions}
              onFilterChange={(val) => handleRangeChange('differenceRange', val)}
              color="secondary"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={6}>
          <Grid container spacing={3}>
            {getResponsibilityValue('cash_bank_chart', configs, user) && (
              <Grid item xs={12}>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <EcommerceSaleByGender
                    chart={{
                      series: [
                        { label: 'Bank', value: bankamount },
                        { label: 'Cash', value: cashamount },
                      ],
                    }}
                    banks={banks}
                  />
                </Box>
              </Grid>
            )}
            {getResponsibilityValue('interest_summary_box', configs, user) && (
              <Grid item xs={12}>
                <BookingCheckInWidgets
                  chartTitle="Interest Summary"
                  chart={{
                    series: [
                      {
                        label: 'Interest In',
                        icon: <Iconify icon="mynaui:percentage-waves-solid" width={40} />,
                        total: interest?.interest?.interestInMain,
                      },
                      {
                        label: 'Interest Out',
                        icon: <Iconify icon="iconamoon:zoom-out-fill" width={40} />,
                        total: interest?.interest?.interestOutOther,
                      },
                      {
                        label: 'Differance',
                        icon: <Iconify icon="ph:scales-fill" width={40} />,
                        total: interest?.interest?.interestDifference,
                      },
                    ],
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(r) => handleRangeChange('interestRange', r)}
                />
              </Grid>
            )}
            {getResponsibilityValue('scheme_chart', configs, user) && (
              <Grid item xs={12}>
                <AnalyticsConversionRates
                  title="Interest Rate"
                  chart={{
                    series: [
                      {
                        name: 'Loan Amount',
                        data: SchemeLoanSummary?.chartData?.series?.[0]?.data || [],
                      },
                    ],
                    categories: SchemeLoanSummary?.chartData?.categories || [],
                  }}
                  footer={{
                    interestRate: `${SchemeLoanSummary?.global?.avgInterestRate?.toFixed(2) || '0.00'}%`,
                    amount:
                      SchemeLoanSummary?.global?.totalLoanAmount?.toLocaleString('en-IN') || '0',
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(r) => handleRangeChange('schemeLoanSummaryRange', r)}
                />
              </Grid>
            )}
            {getResponsibilityValue('inquiry_chart', configs, user) && (
              <Grid item xs={12} md={6}>
                <AppCurrentDownload
                  title="Inquiry"
                  chart={{ series: InquirySummary?.data || [], total: InquirySummary?.total }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(r) => handleRangeChange('inquiryRange', r)}
                />
              </Grid>
            )}
            {getResponsibilityValue('customer_chart', configs, user) && (
              <Grid item xs={12} md={6}>
                <AppCurrentDownload
                  title="Customer"
                  chart={{
                    series: [
                      {
                        label: 'New Customer',
                        value: customerData?.customerStats?.newCustomerCount,
                      },
                      {
                        label: 'Loan Active Customer',
                        value: customerData?.customerStats?.activeLoanCustomerCount,
                      },
                    ],
                    total: customerData?.customerStats?.totalCustomerCount,
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => handleRangeChange('customerRange', range)}
                />
              </Grid>
            )}
            {getResponsibilityValue('customer_references_chart', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <AnalyticsCurrentVisits
                  title="Current Customer References"
                  chart={{
                    series: referenceData?.references,
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => {
                    handleRangeChange('referenceRange', range);
                  }}
                />
              </Grid>
            )}
            {getResponsibilityValue('charge_summary_box', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <BookingCheckInWidgets
                  chartTitle={'Other Loan GWT/NWT Summary'}
                  chart={{
                    series: [
                      {
                        label: 'Gross Wt',
                        icon: <Iconify icon="uil:gold" width={40} />,
                        total: otherTotalWt?.grossWeight,
                      },
                      {
                        label: 'Net Wt',
                        icon: <Iconify icon="mdi:gold" width={40} />,
                        total: otherTotalWt?.netWeight,
                      },
                    ],
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => {
                    handleRangeChange('otherTotalLoanWt', range);
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Grid container spacing={3}>
            {getResponsibilityValue('portfolio_box', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <AnalyticsTrafficBySite title="Traffic by Site" list={analyticsData} />
              </Grid>
            )}
            {getResponsibilityValue('all_in/out_summary_box', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <BookingCheckInWidgets
                  chartTitle={'All In/Out Summary'}
                  chart={{
                    series: [
                      {
                        label: 'All Entry In',
                        icon: <Iconify icon="mynaui:percentage-waves-solid" width={40} />,
                        total: AllInOutSummary?.allInAmount,
                      },
                      {
                        label: 'All Entry Out',
                        icon: <Iconify icon="iconamoon:zoom-out-fill" width={40} />,
                        total: AllInOutSummary?.allOutAmount,
                      },
                      {
                        label: 'Differance',
                        icon: <Iconify icon="ph:scales-fill" width={40} />,
                        total: AllInOutSummary?.netAmount,
                      },
                    ],
                  }}
                />
              </Grid>
            )}
            {getResponsibilityValue('charge_summary_box', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <BookingCheckInWidgets
                  chartTitle={'Charge Summary'}
                  chart={{
                    series: [
                      {
                        label: 'Charge In',
                        icon: <Iconify icon="mynaui:percentage-waves-solid" width={40} />,
                        total: charges?.charge?.chargeIn,
                      },
                      {
                        label: 'Charge Out',
                        icon: <Iconify icon="iconamoon:zoom-out-fill" width={40} />,
                        total: charges?.charge?.chargeOut,
                      },
                      {
                        label: 'Differance',
                        icon: <Iconify icon="ph:scales-fill" width={40} />,
                        total: charges?.charge?.chargeDifference,
                      },
                    ],
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => {
                    handleRangeChange('chargeRange', range);
                  }}
                />
              </Grid>
            )}
            {getResponsibilityValue('loan_chart', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <AppAreaInstalled title="Loan Graph" chart={LoanChart} />
              </Grid>
            )}
            {getResponsibilityValue('other_loan_chart', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <Stack spacing={3}>
                  <BankingBalanceStatistics title="Other Loan" chart={OtherLoanChart} />
                </Stack>
              </Grid>
            )}
            {getResponsibilityValue('customer_area_chart', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <AnalyticsCurrentVisits
                  title="Current Customer Area"
                  chart={{
                    series: areaData?.areas,
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => {
                    handleRangeChange('areaRange', range);
                  }}
                />
              </Grid>
            )}
            {getResponsibilityValue('charge_summary_box', configs, user) && (
              <Grid item xs={12} md={12} lg={12}>
                <BookingCheckInWidgets
                  chartTitle={'Loan GWT/NWT Summary'}
                  chart={{
                    series: [
                      {
                        label: 'Gross Wt',
                        icon: <Iconify icon="uil:gold" width={40} />,
                        total: totalWt?.grossWeight,
                      },
                      {
                        label: 'Net Wt',
                        icon: <Iconify icon="mdi:gold" width={40} />,
                        total: totalWt?.netWeight,
                      },
                      {
                        label: 'Total Wt',
                        icon: <Iconify icon="carbon:cost-total" width={40} />,
                        total: totalWt?.totalWeight,
                      },
                    ],
                  }}
                  timeRangeOptions={timeRangeOptions}
                  onTimeRangeChange={(range) => {
                    handleRangeChange('totalLoanWt', range);
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
