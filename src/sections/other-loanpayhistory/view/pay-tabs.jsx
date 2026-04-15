import React, { useState } from 'react';
import Card from '@mui/material/Card';
import { Tab, Tabs } from '@mui/material';
import InterestPayDetailsForm from './interest-pay-details-form';
import LoanCloseForm from './loan-close-form';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { useGetConfigs } from '../../../api/config';

function PayTabs({ mutate, currentOtherLoan }) {
  const [activeTab, setActiveTab] = useState(0);
  const { configs } = useGetConfigs();
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <>
      <Grid container spacing={3} sx={{ mt: 1.5 }}>
        <Grid item xs={12} p={0}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, px: 2 }}>
            Loan Pay Details
          </Typography>
        </Grid>
        <Grid item xs={12} P={0}>
          <Card sx={{ py: 0, px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 1.5, '.css-1obiyde-MuiTabs-indicator': { bottom: 8 } }}
            >
              <Tab label="Interest Pay Details" />
              <Tab label="Loan Close" />
            </Tabs>
            {activeTab === 0 && currentOtherLoan && (
              <InterestPayDetailsForm
                currentOtherLoan={currentOtherLoan}
                mutate={mutate}
                configs={configs}
              />
            )}
            {activeTab === 1 && currentOtherLoan && (
              <LoanCloseForm currentOtherLoan={currentOtherLoan} mutate={mutate} />
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default PayTabs;
