import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to manage query parameters
 * @param key - The query parameter key
 * @param defaultValue - Default value if the query param doesn't exist
 * @returns [value, setValue] tuple
 */
export function useQueryParam(key: string, defaultValue?: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const value = searchParams.get(key) || defaultValue || '';

  const setValue = (newValue: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newValue === null || newValue === '') {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, newValue);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };

  return [value, setValue] as const;
}

/**
 * Hook to get a query parameter value (read-only)
 * @param key - The query parameter key
 * @param defaultValue - Default value if the query param doesn't exist
 * @returns The query parameter value
 */
export function useQueryParamValue(key: string, defaultValue?: string): string {
  const [searchParams] = useSearchParams();
  return searchParams.get(key) || defaultValue || '';
}

/**
 * Hook to set a query parameter value
 * @param key - The query parameter key
 * @returns A function to set the query parameter value
 */
export function useSetQueryParam(key: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (value: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value);
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });
  };
}
