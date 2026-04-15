import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetOtherLoanReports(restOfClosedLoan, closedLoan) {
  const { user } = useAuthContext();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  let parsedBranch = storedBranch;

  if (storedBranch !== 'all') {
    try {
      parsedBranch = JSON.parse(storedBranch);
    } catch (error) {
      console.error('Error parsing storedBranch:', error);
    }
  }

  const branchQuery = parsedBranch && parsedBranch === 'all'
    ? ''
    : `branch=${parsedBranch}`;

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loan-summary?${branchQuery}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const filteredData = useMemo(() => {
    if (closedLoan) {
      return data?.data?.filter((item) => item.status === 'Closed') || [];
    }
    if (restOfClosedLoan) {
      return data?.data?.filter((item) => item.status !== 'Closed') || [];
    }
    return data?.data || [];
  }, [data?.data, closedLoan, restOfClosedLoan]);

  const memoizedValue = useMemo(
    () => ({
      otherLoanReports: filteredData,
      otherLoanReportsLoading: isLoading,
      otherLoanReportsError: error,
      otherLoanReportsValidating: isValidating,
      otherLoanReportsEmpty: !isLoading && !filteredData.length,
      mutate,
    }),
    [filteredData, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
