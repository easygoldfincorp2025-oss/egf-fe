import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomerCreateView, CustomerListView } from '../../sections/customer/view';
import { SettingsPage } from '../../sections/settings/view';
import CustomerEditView from '../../sections/customer/view/customer-edit-view';
import GoldLoanCalculator from '../../sections/goldloancalculator/gold-loan-calculator';
import Notice from '../../sections/loanpayhistory/PDF/notice.jsx';
import OtherDailyReportsListView from 'src/sections/reports/view/other-loan-daily-report';
import DayBookListView from '../../sections/cash-and-bank/day-book/view/day-book-list-view.jsx';
import CustomerRefReportListView from '../../sections/reports/view/customer-ref-report-list-view.jsx';
import OtherInterestEntryReportsListView from '../../sections/reports/view/other-interest-entry-reports-list-view.jsx';
import AllTransactionListView from '../../sections/cash-and-bank/all-transaction/view/all-transaction-list-view.jsx';

// ----------------------------------------------------------------------
const ResetPassword = lazy(() => import('src/pages/auth/jwt/reset'));

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));

// INQUIRY
const InquiryListView = lazy(() => import('../../sections/inquiry/view/inquiry-list-view'));
const InquiryCreateView = lazy(() => import('../../sections/inquiry/view/inquiry-create-view'));
const InquiryEditView = lazy(() => import('../../sections/inquiry/view/inquiry-edit-view'));

//EMPLOYEE
const EmployeeListView = lazy(() => import('../../sections/employee/view/employee-list-view'));
const EmployeeCreateView = lazy(() => import('../../sections/employee/view/employee-create-view'));
const EmployeeEditView = lazy(() => import('../../sections/employee/view/employee-edit-view'));

// SCHEME
const SchemeListView = lazy(() => import('../../sections/scheme/view/scheme-list-view'));
const SchemeCreateView = lazy(() => import('../../sections/scheme/view/scheme-create-view'));
const SchemeEditView = lazy(() => import('../../sections/scheme/view/scheme-edit-view'));
const GoldPriceListView = lazy(() => import('../../sections/scheme/goldprice/goldprice-list.jsx'));

// CARAT
const CaratListView = lazy(() => import('../../sections/carat/view/carat-list-view'));
const CaratCreateView = lazy(() => import('../../sections/carat/view/carat-create-view'));
const CaratEditView = lazy(() => import('../../sections/carat/view/carat-edit-view'));

//PROPERTY
const PropertyEditView = lazy(() => import('../../sections/property/view/property-edit-view'));
const PropertyCreateView = lazy(() => import('../../sections/property/view/property-create-view'));
const PropertyListView = lazy(() => import('../../sections/property/view/property-list-view'));

//LOAN PAY HISTORY
const LoanpayhistoryListView = lazy(
  () => import('../../sections/loanpayhistory/view/loanpayhistory-list-view')
);
const LoanpayhistoryCreateView = lazy(
  () => import('../../sections/loanpayhistory/view/loanpayhistory-create-view')
);
const BulkInterestPay = lazy(
  () => import('../../sections/loanpayhistory/bulk-interest-pay/bulk-interest-pay')
);

//LOAN PAY HISTORY
const OtherLoanpayhistoryListView = lazy(
  () => import('../../sections/other-loanpayhistory/view/other-loanpayhistory-list-view')
);
const OtherLoanpayhistoryCreateView = lazy(
  () => import('../../sections/other-loanpayhistory/view/other-loanpayhistory-create-view')
);
const OtherBulkInterestPay = lazy(
  () => import('../../sections/other-loanpayhistory/bulk-interest-pay/bulk-interest-pay')
);

// PENALTY
const PenaltyListView = lazy(() => import('../../sections/penalty/view/penalty-list-view'));
const PenaltyCreateview = lazy(() => import('../../sections/penalty/view/penalty-create-view'));
const PenaltyEditView = lazy(() => import('../../sections/penalty/view/penalty-edit-view'));

// DISBURSE
const DisburseCreateView = lazy(() => import('../../sections/disburse/view/disburse-create-view'));
const DisburseEditView = lazy(() => import('../../sections/disburse/view/disburse-edit-view.jsx'));
const DisburseListView = lazy(() => import('../../sections/disburse/view/disburse-list-view'));

// REMINDER
const ReminderListView = lazy(() => import('../../sections/reminder/view/reminder-list-view'));

// LOAN ISSUE
const LoanissueEditView = lazy(() => import('../../sections/loanissue/view/loanissue-edit-view'));
const LoanissueCreateView = lazy(
  () => import('../../sections/loanissue/view/loanissue-create-view')
);
const LoanissueListView = lazy(() => import('../../sections/loanissue/view/loanissue-list-view'));

// OTHER LOAN ISSUE
const OtherLoanissueEditView = lazy(
  () => import('../../sections/other-loanissue/view/other-loanissue-edit-view')
);
const OtherLoanissueCreateView = lazy(
  () => import('../../sections/other-loanissue/view/other-loanissue-create-view')
);
const OtherLoanissueListView = lazy(
  () => import('../../sections/other-loanissue/view/other-loanissue-list-view')
);

// REMINDER-DETAILS
const ReminderDetailsListView = lazy(
  () => import('../../sections/reminder/view/reminder-details-list-view')
);

//REPORTS
const AllBranchLoanSummaryListView = lazy(
  () => import('../../sections/reports/view/all-branch-loan-summary-list-view')
);
const BranchViseLoanClosingListView = lazy(
  () => import('../../sections/reports/view/branch-vise-loan-closing-list-view')
);
const DailyReportsListView = lazy(
  () => import(`../../sections/reports/view/daily-reports-list-view`)
);
const InterestReportsListView = lazy(
  () => import(`../../sections/reports/view/interest-reports-list-view.jsx`)
);
const InterestEntryReportsListView = lazy(
  () => import(`../../sections/reports/view/interest-entry-reports-list-view.jsx`)
);
const LoanDetailListView = lazy(() => import('../../sections/reports/view/loan-details-list-view'));
const CustomerStatement = lazy(
  () => import('../../sections/reports/view/customer-statement-list-view.jsx')
);
const LoanIssueReports = lazy(
  () => import('../../sections/reports/view/loan-issue-reports-list-view.jsx')
);
const OtherLoanAllBranchReports = lazy(
  () => import('../../sections/reports/view/all-branch-other-loan-summary-list-view.jsx')
);
const OtherLoanCloseReports = lazy(
  () => import('../../sections/reports/view/other-loan-close-summary-list-view.jsx')
);
const OtherLoanInterestReports = lazy(
  () => import('../../sections/reports/view/other-loan-interest-list-view.jsx')
);
const TotalAllinOutLoanReports = lazy(
  () => import('../../sections/reports/view/total-all-in-out-loan-reports-list-view.jsx')
);

// CASH_AND_BANK
const CashInListView = lazy(
  () => import('../../sections/cash-and-bank/cash-in/view/cash-in-list-view.jsx')
);
const BankAccountListView = lazy(
  () => import('../../sections/cash-and-bank/bank-account/view/bank-account-list-view.jsx')
);
const PaymentInOutListView = lazy(
  () => import('../../sections/cash-and-bank/payment-in-out/view/payment-in-out-list-view.jsx')
);
const PaymentInOutCreatetView = lazy(
  () => import('../../sections/cash-and-bank/payment-in-out/view/payment-in-out-create-view.jsx')
);
const PaymentInOutEditView = lazy(
  () => import('../../sections/cash-and-bank/payment-in-out/view/payment-in-out-edit-view.jsx')
);
const ExpenseListView = lazy(
  () => import('../../sections/cash-and-bank/other-in-out/view/expence-list-view.jsx')
);
const ExpenseCreateView = lazy(
  () => import('../../sections/cash-and-bank/other-in-out/view/expence-create-view.jsx')
);
const ExpenseEditView = lazy(
  () => import('../../sections/cash-and-bank/other-in-out/view/expense-edit-view.jsx')
);
const ChargeInOutListView = lazy(
  () => import('../../sections/cash-and-bank/charge-in-out/view/charge-in-out-list-view.jsx')
);
const ChargeInOutCreateView = lazy(
  () => import('../../sections/cash-and-bank/charge-in-out/view/charge-in-out-create-view.jsx')
);
const ChargeInOutEditView = lazy(
  () => import('../../sections/cash-and-bank/charge-in-out/view/charge-in-out-edit-view.jsx')
);

//SECURE LOAN PAY HISTORY
const SecureBulkInterestPay = lazy(
  () =>
    import('src/sections/secure-loan-pay-history/bulk-interest-pay/secure-bulk-interest-pay.jsx')
);
const SecureLoanpayhistoryCreateView = lazy(
  () => import('src/sections/secure-loan-pay-history/view/secure-loanpayhistory-create-view.jsx')
);
const SecureLoanpayhistoryListView = lazy(
  () => import('src/sections/secure-loan-pay-history/view/secure-loanpayhistory-list-view.jsx')
);

//UNSECURE LOAN PAY HISTORY
const UnsecureBulkInterestPay = lazy(
  () =>
    import(
      'src/sections/unsecure-loan-pay-history/bulk-interest-pay/unsecure-bulk-interest-pay.jsx'
    )
);
const UnsecureLoanpayhistoryCreateView = lazy(
  () =>
    import('src/sections/unsecure-loan-pay-history/view/unsecure-loanpayhistory-create-view.jsx')
);
const UnsecureLoanpayhistoryListView = lazy(
  () => import('src/sections/unsecure-loan-pay-history/view/unsecure-loanpayhistory-list-view.jsx')
);

//MYPROFILE
const MyProfile = lazy(() => import('src/sections/settings/view/my-profile-create-view'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'inquiry',
        children: [
          { element: <InquiryListView />, index: true },
          { path: 'list', element: <InquiryListView /> },
          { path: 'new', element: <InquiryCreateView /> },
          { path: ':id/edit', element: <InquiryEditView /> },
        ],
      },
      {
        path: 'scheme',
        children: [
          { element: <SchemeListView />, index: true },
          { path: 'list', element: <SchemeListView /> },
          { path: 'goldpricelist', element: <GoldPriceListView /> },
          { path: 'new', element: <SchemeCreateView /> },
          { path: ':id/edit', element: <SchemeEditView /> },
          { path: ':id/edit', element: <InquiryEditView /> },
        ],
      },
      {
        path: 'carat',
        children: [
          { element: <CaratListView />, index: true },
          { path: 'list', element: <CaratListView /> },
          { path: 'new', element: <CaratCreateView /> },
          { path: ':id/edit', element: <CaratEditView /> },
        ],
      },
      {
        path: 'property',
        children: [
          { element: <PropertyListView />, index: true },
          { path: 'list', element: <PropertyListView /> },
          { path: 'new', element: <PropertyCreateView /> },
          { path: ':id/edit', element: <PropertyEditView /> },
        ],
      },
      {
        path: 'penalty',
        children: [
          { element: <PenaltyListView />, index: true },
          { path: 'list', element: <PenaltyListView /> },
          { path: 'new', element: <PenaltyCreateview /> },
          { path: ':id/edit', element: <PenaltyEditView /> },
        ],
      },
      {
        path: 'disburse',
        children: [
          { element: <DisburseListView />, index: true },
          { path: 'list', element: <DisburseListView /> },
          { path: ':id/new', element: <DisburseCreateView /> },
          { path: ':id/edit', element: <DisburseEditView /> },
        ],
      },
      {
        path: 'reminder',
        children: [
          { path: 'list', element: <ReminderListView /> },
          { path: 'notice', element: <Notice /> },
        ],
      },
      {
        path: 'reminder-details',
        children: [
          { element: <ReminderDetailsListView />, index: true },
          { path: ':id/list', element: <ReminderDetailsListView /> },
        ],
      },
      {
        path: 'employee',
        children: [
          { element: <EmployeeListView />, index: true },
          { path: 'list', element: <EmployeeListView /> },
          { path: 'new', element: <EmployeeCreateView /> },
          { path: ':id/edit', element: <EmployeeEditView /> },
        ],
      },
      {
        path: 'loanissue',
        children: [
          { element: <LoanissueListView />, index: true },
          { path: 'list', element: <LoanissueListView /> },
          { path: 'new', element: <LoanissueCreateView /> },
          { path: ':id/edit', element: <LoanissueEditView /> },
        ],
      },
      {
        path: 'secureloanpayhistory',
        children: [
          { element: <SecureLoanpayhistoryListView />, index: true },
          { path: 'list', element: <SecureLoanpayhistoryListView /> },
          { path: ':id/new', element: <SecureLoanpayhistoryCreateView /> },
          { path: 'bulkInterest/new', element: <SecureBulkInterestPay /> },
        ],
      },
      {
        path: 'unsecureloanpayhistory',
        children: [
          { element: <UnsecureLoanpayhistoryListView />, index: true },
          { path: 'list', element: <UnsecureLoanpayhistoryListView /> },
          { path: ':id/new', element: <UnsecureLoanpayhistoryCreateView /> },
          { path: 'bulkInterest/new', element: <UnsecureBulkInterestPay /> },
        ],
      },
      {
        path: 'other-loanissue',
        children: [
          { element: <OtherLoanissueListView />, index: true },
          { path: 'list', element: <OtherLoanissueListView /> },
          { path: 'new', element: <OtherLoanissueCreateView /> },
          { path: ':id/edit', element: <OtherLoanissueEditView /> },
        ],
      },
      {
        path: 'loanpayhistory',
        children: [
          { element: <LoanpayhistoryListView />, index: true },
          { path: 'list', element: <LoanpayhistoryListView /> },
          { path: ':id/new', element: <LoanpayhistoryCreateView /> },
          { path: 'bulkInterest/new', element: <BulkInterestPay /> },
        ],
      },
      {
        path: 'other-loanPayHistory',
        children: [
          { element: <OtherLoanpayhistoryListView />, index: true },
          { path: 'list', element: <OtherLoanpayhistoryListView /> },
          { path: ':id/new', element: <OtherLoanpayhistoryCreateView /> },
          { path: 'bulkInterest/new', element: <OtherBulkInterestPay /> },
        ],
      },
      {
        path: 'customer',
        children: [
          { element: <CustomerListView />, index: true },
          { path: 'list', element: <CustomerListView /> },
          { path: 'new', element: <CustomerCreateView /> },
          { path: ':id/edit', element: <CustomerEditView /> },
          { path: 'profile', element: <MyProfile /> },
        ],
      },
      {
        path: 'reports',
        children: [
          { element: <AllBranchLoanSummaryListView />, index: true },
          { path: 'loan-list', element: <AllBranchLoanSummaryListView /> },
          { path: 'closed-loan-list', element: <BranchViseLoanClosingListView /> },
          { path: 'daily-reports', element: <DailyReportsListView /> },
          { path: 'loan-details', element: <LoanDetailListView /> },
          { path: 'interest-reports', element: <InterestReportsListView /> },
          { path: 'interest-entry-reports', element: <InterestEntryReportsListView /> },
          { path: 'customer-statement', element: <CustomerStatement /> },
          { path: 'loan-issue-reports', element: <LoanIssueReports /> },
          { path: 'customer-refrance-reports', element: <CustomerRefReportListView /> },
        ],
      },
      {
        path: 'other-reports',
        children: [
          { element: <OtherLoanAllBranchReports />, index: true },
          { path: 'other-loan-all-branch-reports', element: <OtherLoanAllBranchReports /> },
          { path: 'other-loan-close-reports', element: <OtherLoanCloseReports /> },
          { path: 'other-loan-interest-reports', element: <OtherLoanInterestReports /> },
          { path: 'other-interest-entry-reports', element: <OtherInterestEntryReportsListView /> },
          { path: 'other-loan-daily-reports', element: <OtherDailyReportsListView /> },
          { path: 'total-all-in-out-loan-reports', element: <TotalAllinOutLoanReports /> },
        ],
      },
      {
        path: 'cash-and-bank',
        children: [
          { element: <CashInListView />, index: true },
          { path: 'cash-in', element: <CashInListView /> },
          { path: 'bank-account', element: <BankAccountListView /> },
          { path: 'payment-in-out/list', element: <PaymentInOutListView /> },
          { path: 'payment-in-out/new', element: <PaymentInOutCreatetView /> },
          { path: 'payment-in-out/:id/edit', element: <PaymentInOutEditView /> },
          { path: 'expense/list', element: <ExpenseListView /> },
          { path: 'expense/new', element: <ExpenseCreateView /> },
          { path: 'expense/:id/edit', element: <ExpenseEditView /> },
          { path: 'charge-in-out/list', element: <ChargeInOutListView /> },
          { path: 'charge-in-out/new', element: <ChargeInOutCreateView /> },
          { path: 'charge-in-out/:id/edit', element: <ChargeInOutEditView /> },
          { path: 'day-book/list', element: <DayBookListView /> },
          { path: 'all-transaction/list', element: <AllTransactionListView /> },
        ],
      },
      { path: 'setting', element: <SettingsPage /> },
      { path: 'gold-loan-calculator', element: <GoldLoanCalculator /> },
    ],
  },
  { path: 'jwt/reset-password/:token', element: <ResetPassword /> },
];
