import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';

export function useGetAllSecurePartPayment(loanId) {
  const URL = `${import.meta.env.VITE_BASE_URL}/loans/${loanId}/secured-loan-part-payment`;
  const { data, isLoading, error, isValidating, mutate: refetchPartPayment } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      partPayment: data?.data || [],
      partPaymentLoading: isLoading,
      partPaymentError: error,
      partPaymentValidating: isValidating,
      partPaymentEmpty: !isLoading && !data?.data?.length,
      refetchPartPayment,
    }),
    [data?.data, error, isLoading, isValidating, refetchPartPayment]
  );

  return memoizedValue;
}
