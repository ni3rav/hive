import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryParam(
  key: string,
  defaultValue?: string,
): readonly [string, (value: string | null) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    const paramValue = searchParams.get(key);
    return paramValue ?? defaultValue ?? '';
  }, [searchParams, key, defaultValue]);

  const setValue = useCallback(
    (newValue: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newValue === null || newValue === '') {
          next.delete(key);
        } else {
          next.set(key, newValue);
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams, key],
  );

  return [value, setValue] as const;
}

export function useQueryParamValue(
  key: string,
  defaultValue?: string,
): string {
  const [searchParams] = useSearchParams();
  return useMemo(() => {
    const value = searchParams.get(key);
    return value ?? defaultValue ?? '';
  }, [searchParams, key, defaultValue]);
}

export function useSetQueryParam(
  key: string,
): (value: string | null) => void {
  const [, setSearchParams] = useSearchParams();

  return useCallback(
    (newValue: string | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newValue === null || newValue === '') {
          next.delete(key);
        } else {
          next.set(key, newValue);
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams, key],
  );
}
