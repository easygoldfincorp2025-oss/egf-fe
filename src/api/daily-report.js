import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetDailyReport(params = {}) {
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

  // Convert incoming params object to query string
  const extraParams = new URLSearchParams(params).toString();

  const branchQuery =
    parsedBranch && parsedBranch !== 'all'
      ? `branchId=${parsedBranch}`
      : '';

  // Combine all query strings
  const queryString = [branchQuery, extraParams]
    .filter(Boolean)
    .join('&');

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/daily-report${queryString ? `?${queryString}` : ''}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      report: data?.data || [],
      reportLoading: isLoading,
      reportError: error,
      reportValidating: isValidating,
      reportEmpty: !isLoading && !data?.data?.length,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
