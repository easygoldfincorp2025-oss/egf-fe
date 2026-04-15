import React, { useCallback, useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { getComparator, useTable } from 'src/components/table';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetConfigs } from '../../../api/config';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Unstable_Grid2';
import OtherNewGoldLonListView
  from '../other-loan-daily-reports/other-daily-reports-list-view/new-other-gold-lon-list-view';
import OtherGoldLoanInterestListView
  from '../other-loan-daily-reports/other-daily-reports-list-view/other-gold-loan-interest-list-view';
import OtherGoldLoanCloseListView
  from '../other-loan-daily-reports/other-daily-reports-list-view/other-gold-loan-close-list-view';
import { useGetOtherDailyReport } from 'src/api/other-loan-daily-report';
import OtherDailyReportsTableToolbar
  from '../other-loan-daily-reports/other-daily-reports-table/other-daily-reports-table-toolbar';

// ----------------------------------------------------------------------

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: new Date(),
  endDate: null,
  branch: '',
};

// ----------------------------------------------------------------------

export default function OtherDailyReportsListView() {
  const table = useTable();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const params = new URLSearchParams();
  if (filters.branch._id) params.append('branch', filters.branch._id);
  if (filters.startDate) params.append('date', filters.startDate.toLocaleDateString());
  const date = filters.startDate.toLocaleDateString();
  const { report, reportLoading } = useGetOtherDailyReport(params);
  const [activeTab, setActiveTab] = useState(0);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const dataFiltered = applyFilter({
    inputData: report,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

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

  if (reportLoading) {
    return <LoadingScreen />;
  }

  const data = {
    LoanIssue: report?.loans,
    partPayment: report?.closedLoanDetails,
    interestDetail: report?.interestDetail,
    loanDetails: report?.loans,
    loanIntDetails: report?.interestDetail,
    closedLoanDetails: report?.closedLoanDetails,
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Other Loan Daily Reports"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            { name: 'Other Loan Daily Reports', href: paths.dashboard.reports.root },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card sx={{ pb: 3 }}>
          <OtherDailyReportsTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dataFilter={dataFiltered}
            configs={configs}
            data={data}
          />
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
                      Gold Loan Interest{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.interestDetail.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Gold Loan Close{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({report?.closedLoanDetails.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
              </Tabs>
              {activeTab === 0 && <OtherNewGoldLonListView LoanIssue={report?.loans} />}
              {activeTab === 1 && (
                <OtherGoldLoanInterestListView interestDetail={report?.interestDetail} />
              )}
              {activeTab === 2 && (
                <OtherGoldLoanCloseListView partPayment={report?.closedLoanDetails} />
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
