import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from '../auth/hooks/index.js';

export function useGetOtherCloseLoan(otherLoanId) {
  const { user } = useAuthContext();
  const URL = `${import.meta.env.VITE_BASE_URL}/${user.company}/other-loans/${otherLoanId}/loan-close`;
  const {
    data,
    isLoading,
    error,
    isValidating,
    mutate: refetchOtherLoanClose,
  } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      otherLoanClose: data?.data || [],
      otherLoanCloseLoading: isLoading,
      otherLoanCloseError: error,
      otherLoanCloseValidating: isValidating,
      otherLoanCloseEmpty: !isLoading && !data?.data?.length,
      refetchOtherLoanClose,
    }),
    [data?.data, error, isLoading, isValidating, refetchOtherLoanClose]
  );

  return memoizedValue;
}
