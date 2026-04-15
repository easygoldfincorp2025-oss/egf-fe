import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetCompanyDetails() {
  const { user } = useAuthContext();
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);
  if (error) {
    console.error('Error fetching data:', error);
  }
  const memoizedValue = useMemo(() => {
    const companyDetail = data?.data || [];
    const isLoading = !data && !error;
    return {
      companyDetail,
      companyLoading: isLoading,
      companyError: error,
      companyValidating: isValidating,
      companyEmpty: !isLoading && companyDetail.length === 0,
      companyMutate:mutate,
    };
  }, [data?.data, error, isValidating, mutate]);

  return memoizedValue;
}
