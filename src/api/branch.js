import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetBranch() {
  const { user } = useAuthContext();
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/branch`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);
  if (error) {
    console.error('Error fetching data:', error);
  }
  const memoizedValue = useMemo(() => {
    const branch = data?.data || [];
    const isLoading = !data && !error;
    return {
      branch,
      branchLoading: isLoading,
      branchError: error,
      branchValidating: isValidating,
      branchEmpty: !isLoading && branch.length === 0,
      mutate,
    };
  }, [data?.data, error, isValidating, mutate]);

  return memoizedValue;
}
