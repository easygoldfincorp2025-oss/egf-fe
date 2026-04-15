import isEqual from 'lodash/isEqual';
import React, { useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { getComparator, useTable } from 'src/components/table';
import { useAuthContext } from '../../../auth/hooks';
import { LoadingScreen } from '../../../components/loading-screen';
import { fDate } from '../../../utils/format-time';
import { useGetConfigs } from '../../../api/config';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import NewGoldLonListView from '../daily-reports/daily-reports-list-view/new-gold-lon-list-view';
import GoldLoanInterestListView from '../daily-reports/daily-reports-list-view/gold-loan-interest-list-view';
import GoldLoanPartCloseListView from '../daily-reports/daily-reports-list-view/gold-loan-part-close-list-view.jsx';
import GoldLoanUchakPartListView from '../daily-reports/daily-reports-list-view/gold-loan-uchak-part-list-view';
import DailyReportsTableToolbar from '../daily-reports/daily-reports-table/daily-reports-table-toolbar.jsx';
import { useGetDailyReport } from '../../../api/daily-report';
import Grid from '@mui/material/Unstable_Grid2';
import GoldLoanPartPaymentListView from '../daily-reports/daily-reports-list-view/gold-loan-part-payment-list-view.jsx';
import LoanCloseListView from '../daily-reports/daily-reports-list-view/loan-close-list-view.jsx';
import DailyReportTableFiltersResult from '../daily-reports/daily-reports-table/daily-report-table-filters-result.jsx';

// ----------------------------------------------------------------------

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: new Date(),
  endDate: null,
  branch: '',
};

// ----------------------------------------------------------------------

export default function DailyReportsListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const params = new URLSearchParams();
  if (filters?.branch?._id) params.append('branch', filters?.branch?._id);
  if (filters.startDate) params.append('date', fDate(filters.startDate));
  const date = filters.startDate.toLocaleDateString();
  const { report, reportLoading } = useGetDailyReport(params);
  const [activeTab, setActiveTab] = useState(0);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const dataFiltered = applyFilter({
    inputData: report,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  if (reportLoading) {
    return <LoadingScreen />;
  }

  const data = {
    loanDetails: report?.loans,
    loanIntDetails: report?.interestDetail,
    partReleaseDetails: report?.partReleaseDetail,
    partPaymentDetails: report?.partPaymentDetail,
    uchakIntDetails: report?.uchakInterestDetail,
    closedLoans: report?.closedLoans,
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Daily Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            { name: 'Daily Reports', href: paths.dashboard.reports.root },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card sx={{ pb: 3 }}>
          <DailyReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            data={data}
          />
          {canReset && (
            <DailyReportTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <Grid container spacing={3} sx={{ mt: 1.5 }}>
            <Grid item xs={12} P={0}>
              <Tabs
                value={activeTab}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 3, mb: 1.5, '.css-1obiyde-MuiTabs-indicator': { bottom: 8 } }}
              >
                <Tab
                  label={
                    <>
                      New Gold Loan{' '}
                      <strong style={{ marginLeft: '8px' }}>({report?.loans.length || 0})</strong>
                    </>
                  }
                />
                <Tab
                  label={
                    <>
                      Loan Interest{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.interestDetail.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Loan Part Close
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.partReleaseDetail.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Loan Part Payment{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.partPaymentDetail.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Uchak Pay Int.
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.uchakInterestDetail.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Loan close
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.closedLoans.length || 0})
                      </strong>
                    </>
                  }
                />
              </Tabs>
              {activeTab === 0 && (
                <NewGoldLonListView LoanIssue={report?.loans} branch={filters.branch} />
              )}
              {activeTab === 1 && (
                <GoldLoanInterestListView
                  interestDetail={report?.interestDetail}
                  branch={filters.branch}
                />
              )}
              {activeTab === 2 && (
                <GoldLoanPartCloseListView
                  partClose={report?.partReleaseDetail}
                  branch={filters.branch}
                />
              )}
              {activeTab === 3 && (
                <GoldLoanPartPaymentListView
                  partPayment={report?.partPaymentDetail}
                  branch={filters.branch}
                />
              )}
              {activeTab === 4 && (
                <GoldLoanUchakPartListView
                  uchakPayment={report?.uchakInterestDetail}
                  branch={filters.branch}
                />
              )}{' '}
              {activeTab === 5 && (
                <LoanCloseListView closedLoans={report?.closedLoans} branch={filters.branch} />
              )}
            </Grid>
          </Grid>
        </Card>
      </Container>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters, dateError }) {
  return inputData;
}
