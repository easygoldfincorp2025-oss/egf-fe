import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from '../auth/hooks/index.js';

export function useGetOtherLoanInterestPay(otherLoanId) {
  const { user } = useAuthContext();

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/other-loans/${otherLoanId}/interest`;
  const {
    data,
    isLoading,
    error,
    isValidating,
    mutate: refetchOtherLoanInterest,
  } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      otherLoanInterest: data?.data || [],
      otherLoanInterestLoading: isLoading,
      otherLoanInterestError: error,
      otherLoanInterestValidating: isValidating,
      otherLoanInterestEmpty: !isLoading && !data?.data?.length,
      refetchOtherLoanInterest,
    }),
    [data?.data, error, isLoading, isValidating, refetchOtherLoanInterest]
  );

  return memoizedValue;
}
