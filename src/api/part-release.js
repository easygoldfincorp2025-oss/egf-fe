import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';

export function useGetAllPartRelease(loanId) {
  const URL = `${import.meta.env.VITE_BASE_URL}/loans/${loanId}/part-release`;
  const { data, isLoading, error, isValidating, mutate: refetchPartRelease } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      partRelease: data?.data || [],
      partReleaseLoading: isLoading,
      partReleaseError: error,
      partReleaseValidating: isValidating,
      partReleaseEmpty: !isLoading && !data?.data?.length,
      refetchPartRelease,
    }),
    [data?.data, error, isLoading, isValidating, refetchPartRelease]
  );

  return memoizedValue;
}
