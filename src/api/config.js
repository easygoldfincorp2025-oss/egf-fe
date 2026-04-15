import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetConfigs() {
  const { user } = useAuthContext();

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/config`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);

  if (error) {
    console.error('Error fetching data:', error);
  }

  const memoizedValue = useMemo(() => {
    const configs = data?.data[0] || [];
    const isLoading = !data && !error;
    return {
      configs,
      configsLoading: isLoading,
      configsError: error,
      configsValidating: isValidating,
      configsEmpty: !isLoading && configs?.length === 0,
      mutate,
    };
  }, [data?.data[0], error, isValidating, mutate]);

  return memoizedValue;
}
