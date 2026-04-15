import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetCustomer() {
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

  const branchQuery = parsedBranch && parsedBranch === 'all'
    ? ''
    : `branch=${parsedBranch}`;

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer?${branchQuery}`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);

  if (error) {
    console.error('Error fetching data:', error);
  }

  const memoizedValue = useMemo(() => {
    const customer = data?.data || [];
    const isLoading = !data && !error;
    return {
      customer,
      customerLoading: isLoading,
      customerError: error,
      customerValidating: isValidating,
      customerEmpty: !isLoading && customer?.length === 0,
      mutate,
    };
  }, [data?.data, error, isValidating, mutate]);

  return memoizedValue;
}

export function useGetSingleCustomer(customerData) {
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

  const branchQuery = parsedBranch && parsedBranch === 'all'
    ? ''
    : `branch=${parsedBranch}`;

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company}/customer/${customerData?.id}?${branchQuery}`;
  const { data, error, isValidating, mutate } = useSWR(URL, fetcher);

  if (error) {
    console.error('Error fetching data:', error);
  }

  const memoizedValue = useMemo(() => {
    const customerSingle = data?.data;
    const isLoading = !data && !error;
    return {
      customerSingle,
      customerSingleLoading: isLoading,
      customerSingleError: error,
      customerSingleValidating: isValidating,
      customerSingleEmpty: !isLoading && customerSingle?.length === 0,
      mutate,
    };
  }, [data?.data, error, isValidating, mutate]);

  return memoizedValue;
}
