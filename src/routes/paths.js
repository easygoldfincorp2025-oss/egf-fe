import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];
const MOCK_TITLE = _postTitles[2];
const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
    supabase: {
      login: `${ROOTS.AUTH}/supabase/login`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      register: `${ROOTS.AUTH}/supabase/register`,
      newPassword: `${ROOTS.AUTH}/supabase/new-password`,
      forgotPassword: `${ROOTS.AUTH}/supabase/forgot-password`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  resetPassword: {
    resetPassword: `/jwt/reset-password/:token`,
  },
  dashboard: {
    root: ROOTS.DASHBOARD,
    forgotPassword: `${ROOTS.DASHBOARD}/forgot-password`,
    setting: `${ROOTS.DASHBOARD}/setting`,
    goldLoanCalculator: `${ROOTS.DASHBOARD}/gold-loan-calculator`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    inquiry: {
      root: `${ROOTS.DASHBOARD}/inquiry`,
      new: `${ROOTS.DASHBOARD}/inquiry/new`,
      list: `${ROOTS.DASHBOARD}/inquiry/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/inquiry/${id}/edit`,
    },
    employee: {
      root: `${ROOTS.DASHBOARD}/employee`,
      new: `${ROOTS.DASHBOARD}/employee/new`,
      list: `${ROOTS.DASHBOARD}/employee/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/employee/${id}/edit`,
    },
    scheme: {
      root: `${ROOTS.DASHBOARD}/scheme`,
      new: `${ROOTS.DASHBOARD}/scheme/new`,
      list: `${ROOTS.DASHBOARD}/scheme/list`,
      goldpricelist: `${ROOTS.DASHBOARD}/scheme/goldpricelist`,
      edit: (id) => `${ROOTS.DASHBOARD}/scheme/${id}/edit`,
    },
    carat: {
      root: `${ROOTS.DASHBOARD}/carat`,
      new: `${ROOTS.DASHBOARD}/carat/new`,
      list: `${ROOTS.DASHBOARD}/carat/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/carat/${id}/edit`,
    },
    property: {
      root: `${ROOTS.DASHBOARD}/property`,
      new: `${ROOTS.DASHBOARD}/property/new`,
      list: `${ROOTS.DASHBOARD}/property/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/property/${id}/edit`,
    },
    penalty: {
      root: `${ROOTS.DASHBOARD}/penalty`,
      new: `${ROOTS.DASHBOARD}/penalty/new`,
      list: `${ROOTS.DASHBOARD}/penalty/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/penalty/${id}/edit`,
    },
    customer: {
      root: `${ROOTS.DASHBOARD}/customer`,
      new: `${ROOTS.DASHBOARD}/customer/new`,
      list: `${ROOTS.DASHBOARD}/customer/list`,
      cards: `${ROOTS.DASHBOARD}/customer/cards`,
      profile: `${ROOTS.DASHBOARD}/customer/profile`,
      account: `${ROOTS.DASHBOARD}/customer/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/customer/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/customer/${MOCK_ID}/edit`,
      },
    },
    loanissue: {
      root: `${ROOTS.DASHBOARD}/loanissue`,
      new: `${ROOTS.DASHBOARD}/loanissue/new`,
      list: `${ROOTS.DASHBOARD}/loanissue/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/loanissue/${id}/edit`,
    },
    secureloanPayHistory: {
      root: `${ROOTS.DASHBOARD}/secureloanPayHistory`,
      list: `${ROOTS.DASHBOARD}/secureloanPayHistory/list`,
      bulk: `${ROOTS.DASHBOARD}/secureloanPayHistory/bulkInterest/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/secureloanPayHistory/${id}/new`,
    },
    unsecureloanPayHistory: {
      root: `${ROOTS.DASHBOARD}/unsecureloanPayHistory`,
      list: `${ROOTS.DASHBOARD}/unsecureloanPayHistory/list`,
      bulk: `${ROOTS.DASHBOARD}/unsecureloanPayHistory/bulkInterest/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/unsecureloanPayHistory/${id}/new`,
    },
    other_loanissue: {
      root: `${ROOTS.DASHBOARD}/other-loanissue`,
      new: `${ROOTS.DASHBOARD}/other-loanissue/new`,
      list: `${ROOTS.DASHBOARD}/other-loanissue/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/other-loanissue/${id}/edit`,
    },
    disburse: {
      root: `${ROOTS.DASHBOARD}/disburse`,
      list: `${ROOTS.DASHBOARD}/disburse/list`,
      new: (id) => `${ROOTS.DASHBOARD}/disburse/${id}/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/disburse/${id}/edit`,
    },
    reminder: {
      list: `${ROOTS.DASHBOARD}/reminder/list`,
    },
    reminder_details: {
      list: (id) => `${ROOTS.DASHBOARD}/reminder-details/${id}/list`,
    },
    loanPayHistory: {
      root: `${ROOTS.DASHBOARD}/loanpayhistory`,
      list: `${ROOTS.DASHBOARD}/loanpayhistory/list`,
      bulk: `${ROOTS.DASHBOARD}/loanpayhistory/bulkInterest/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/loanpayhistory/${id}/new`,
    },
    other_loanPayHistory: {
      root: `${ROOTS.DASHBOARD}/other-loanpayhistory`,
      list: `${ROOTS.DASHBOARD}/other-loanpayhistory/list`,
      bulk: `${ROOTS.DASHBOARD}/other-loanpayhistory/bulkInterest/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/other-loanpayhistory/${id}/new`,
    },
    reports: {
      root: `${ROOTS.DASHBOARD}/reports`,
      'loan-list': `${ROOTS.DASHBOARD}/reports/loan-list`,
      'closed-loan-list': `${ROOTS.DASHBOARD}/reports/closed-loan-list`,
      'daily-reports': `${ROOTS.DASHBOARD}/reports/daily-reports`,
      'loan-details': `${ROOTS.DASHBOARD}/reports/loan-details`,
      'interest-reports': `${ROOTS.DASHBOARD}/reports/interest-reports`,
      'interest-entry-reports': `${ROOTS.DASHBOARD}/reports/interest-entry-reports`,
      'customer-statement': `${ROOTS.DASHBOARD}/reports/customer-statement`,
      'loan-issue-reports': `${ROOTS.DASHBOARD}/reports/loan-issue-reports`,
      'customer-refrance-report': `${ROOTS.DASHBOARD}/reports/customer-refrance-reports`,
    },
    otherReports: {
      root: `${ROOTS.DASHBOARD}/other-reports`,
      'other-loan-all-branch-reports': `${ROOTS.DASHBOARD}/other-reports/other-loan-all-branch-reports`,
      'other-loan-close-reports': `${ROOTS.DASHBOARD}/other-reports/other-loan-close-reports`,
      'other-loan-interest-reports': `${ROOTS.DASHBOARD}/other-reports/other-loan-interest-reports`,
      'other-interest-entry-reports': `${ROOTS.DASHBOARD}/other-reports/other-interest-entry-reports`,
      'other-loan-daily-reports': `${ROOTS.DASHBOARD}/other-reports/other-loan-daily-reports`,
      'total-all-in-out-loan-reports': `${ROOTS.DASHBOARD}/other-reports/total-all-in-out-loan-reports`,
    },
    cashAndBank: {
      root: `${ROOTS.DASHBOARD}/cash-and-bank`,
      cashIn: `${ROOTS.DASHBOARD}/cash-and-bank/cash-in`,
      bankAccount: `${ROOTS.DASHBOARD}/cash-and-bank/bank-account`,
      expense: {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/expense/list`,
        new: `${ROOTS.DASHBOARD}/cash-and-bank/expense/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/cash-and-bank/expense/${id}/edit`,
      },
      'payment-in-out': {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/payment-in-out/list`,
        new: `${ROOTS.DASHBOARD}/cash-and-bank/payment-in-out/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/cash-and-bank/payment-in-out/${id}/edit`,
      },
      'day-book': {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/day-book/list`,
      },
      'all-transaction': {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/all-transaction/list`,
      },
      chargeInOut: {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/charge-in-out/list`,
        new: `${ROOTS.DASHBOARD}/cash-and-bank/charge-in-out/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/cash-and-bank/charge-in-out/${id}/edit`,
      },
      otherInOut: {
        list: `${ROOTS.DASHBOARD}/cash-and-bank/other-in-out/list`,
        new: `${ROOTS.DASHBOARD}/cash-and-bank/other-in-out/new`,
        edit: (id) => `${ROOTS.DASHBOARD}/cash-and-bank/other-in-out/${id}/edit`,
      },
    },
  },
};
