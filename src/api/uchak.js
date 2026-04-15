import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';

export function useGetAllUchakPay(loanId) {
  const URL = `${import.meta.env.VITE_BASE_URL}/loans/${loanId}/uchak-interest-payment`;
  const { data, isLoading, error, isValidating, mutate: refetchUchak } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      uchak: data?.data || [],
      uchakLoading: isLoading,
      uchakError: error,
      uchakValidating: isValidating,
      uchakEmpty: !isLoading && !data?.data?.length,
      refetchUchak,
    }),
    [data?.data, error, isLoading, isValidating, refetchUchak]
  );

  return memoizedValue;
}
