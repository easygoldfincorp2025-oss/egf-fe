import React, { useCallback, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PayTabs from '../view/pay-tabs';
import UnsecureLoanpayhistoryNewEditForm from '../unsecure-loanpayhistory-new-edit-form.jsx';
import { Box } from '@mui/system';
import { LoadingScreen } from '../../../components/loading-screen';
import { useGetUnsecureLoan } from '../../../api/unsecure-loanissue.js';

function UnsecureBulkInterestPay() {
  const loanPayHistory = true;
  const { unSecureLoan, mutate, unSecureLoanLoading } = useGetUnsecureLoan(loanPayHistory);
  const [data, setData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchDataFromSession = () => {
      const storedData = sessionStorage.getItem('data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.filteredLoanNo && unSecureLoan) {
          const filteredLoanIssue = unSecureLoan.filter((item) =>
            parsedData.filteredLoanNo.includes(item.loanNo)
          );
          if (filteredLoanIssue.length > 0) {
            setData({ loans: filteredLoanIssue });
          }
        }
      }
    };
    fetchDataFromSession();
  }, [unSecureLoan, mutate]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  if (unSecureLoanLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: 3 }}>
          {data &&
            data.loans?.map((tab, index) => (
              <Tab key={tab.loanNo} value={index} label={tab.loanNo} />
            ))}
        </Tabs>
        {data && data.loans && data.loans[currentTab] && (
          <div>
            <UnsecureLoanpayhistoryNewEditForm
              tabloanNo={data.loans[currentTab]?.loanNo}
              currentLoan={data.loans[currentTab]}
              mutate={mutate}
            />
            <PayTabs currentLoan={data.loans[currentTab]} mutate={mutate} />
          </div>
        )}
      </Box>
    </>
  );
}

export default UnsecureBulkInterestPay;
