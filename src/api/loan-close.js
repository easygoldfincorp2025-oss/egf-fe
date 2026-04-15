import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';

export function useGetCloseLoan(loanId) {
  const URL = `${import.meta.env.VITE_BASE_URL}/loans/${loanId}/loan-close`;
  const { data, isLoading, error, isValidating, mutate: refetchLoanClose } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      loanClose: data?.data || [],
      loanCloseLoading: isLoading,
      loanCloseError: error,
      loanCloseValidating: isValidating,
      loanCloseEmpty: !isLoading && !data?.data?.length,
      refetchLoanClose,
    }),
    [data?.data, error, isLoading, isValidating, refetchLoanClose]
  );

  return memoizedValue;
}
