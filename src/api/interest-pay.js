import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';

export function useGetAllInterest(loanId) {
  const URL = `${import.meta.env.VITE_BASE_URL}/loans/${loanId}/interest-payment`;
  const { data, isLoading, error, isValidating, mutate: refetchLoanInterest } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      loanInterest: data?.data || [],
      loanInterestLoading: isLoading,
      loanInterestError: error,
      loanInterestValidating: isValidating,
      loanInterestEmpty: !isLoading && !data?.data?.length,
      refetchLoanInterest,
    }),
    [data?.data, error, isLoading, isValidating, refetchLoanInterest]
  );

  return memoizedValue;
}
