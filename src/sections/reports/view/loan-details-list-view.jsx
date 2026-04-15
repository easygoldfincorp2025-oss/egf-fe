import isEqual from 'lodash/isEqual';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useGetConfigs } from '../../../api/config';
import LoanInterestDetailsListView from '../loan-details/loan-details-list-view/loan-interest-details-list-view';
import LoanPartReleaseDetailsListView from '../loan-details/loan-details-list-view/loan-part-release-details-list-view';
import LoanUchakPayDetailsListView from '../loan-details/loan-details-list-view/loan-uchakPay-details-list-view';
import LoanPartPaymentDetailsListView from '../loan-details/loan-details-list-view/loan-part-payment-details-list-view';
import LoanCloseDetailsListView from '../loan-details/loan-details-list-view/loan-close-details-list-view';
import LoanDetailTableToolbarTableToolbar
  from '../loan-details/loan-details-table/loan-detail-table-toolbar-table-toolbar';
import { LoadingScreen } from '../../../components/loading-screen/index.js';
import Grid from '@mui/material/Unstable_Grid2';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';

// ----------------------------------------------------------------------

const defaultFilters = {
  username: '',
  status: 'All',
  startDate: null,
  endDate: null,
  branch: '',
  loan: '',
};

// ----------------------------------------------------------------------

export default function LoanDetailsListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const { user } = useAuthContext();
  const { configs } = useGetConfigs();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [filters, setFilters] = useState(defaultFilters);
  const loan = filters?.loan;
  const [activeTab, setActiveTab] = useState(0);
  const [loanDetail, setLoanDetail] = useState({});
  const [loanDetailLoading, setLoanDetailLoading] = useState(false);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchReports = async () => {
    if (!filters.loan) return;

    try {
      setLoanDetailLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/${user?.company}/loan-detail/${loan}`
      );
      setLoanDetail(res?.data?.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoanDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters.loan]);

  const dataFiltered = applyFilter({
    inputData: loanDetail,
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

  if (loanDetailLoading) {
    return <LoadingScreen />;
  }

  const data = {
    intDetails: loanDetail?.interestDetail,
    partReleaseDetails: loanDetail?.partReleaseDetail,
    uchakPayDetails: loanDetail?.uchakInterestDetail,
    partPaymentDetails: loanDetail?.partPaymentDetail,
    loanCloseDetails: loanDetail?.loanCloseDetail,
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Loan Details Report"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Reports', href: paths.dashboard.reports.root },
            { name: 'Loan Details Reports', href: paths.dashboard.reports.root },
            { name: ' List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card sx={{ pb: 3 }}>
          <LoanDetailTableToolbarTableToolbar
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
                      Loan Interest{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({loanDetail?.interestDetail?.length || 0})
                      </strong>
                    </>
                  }
                />
                <Tab
                  label={
                    <>
                      Loan part Release{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({loanDetail?.partReleaseDetail?.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Loan Uchak Pay{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({loanDetail?.uchakInterestDetail?.length || 0})
                      </strong>
                    </>
                  }
                />{' '}
                <Tab
                  label={
                    <>
                      Loan part Payment{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({loanDetail?.partPaymentDetail?.length || 0})
                      </strong>
                    </>
                  }
                />
                <Tab
                  label={
                    <>
                      Loan Close{' '}
                      <strong style={{ marginLeft: '8px' }}>
                        ({loanDetail?.loanCloseDetail?.length || 0})
                      </strong>
                    </>
                  }
                />
              </Tabs>
              {activeTab === 0 && (
                <LoanInterestDetailsListView
                  interestDetail={loanDetail?.interestDetail || []}
                  dataFilters={filters}
                />
              )}
              {activeTab === 1 && (
                <LoanPartReleaseDetailsListView
                  partReleaseDetail={loanDetail?.partReleaseDetail || []}
                  dataFilters={filters}
                />
              )}
              {activeTab === 2 && (
                <LoanUchakPayDetailsListView
                  uchakInterestDetail={loanDetail?.uchakInterestDetail || []}
                  dataFilters={filters}
                />
              )}
              {activeTab === 3 && (
                <LoanPartPaymentDetailsListView
                  partPaymentDetail={loanDetail?.partPaymentDetail || []}
                  dataFilters={filters}
                />
              )}{' '}
              {activeTab === 4 && (
                <LoanCloseDetailsListView
                  loanCloseDetail={loanDetail?.loanCloseDetail || []}
                  dataFilters={filters}
                />
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
