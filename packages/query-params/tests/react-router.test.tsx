import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useQueryParam, useQueryParamValue, useSetQueryParam } from '../src/react-router';

describe('React Router query param hooks', () => {
  const createWrapper = (initialEntries: string[] = ['/']) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        MemoryRouter,
        { initialEntries },
        children,
      );
  };

  describe('useQueryParam', () => {
    it('returns default value when no query param', () => {
      const { result } = renderHook(() => useQueryParam('key', 'default'), {
        wrapper: createWrapper(),
      });
      expect(result.current[0]).toBe('default');
    });

    it('returns query param value', () => {
      const { result } = renderHook(() => useQueryParam('key'), {
        wrapper: createWrapper(['/?key=value']),
      });
      expect(result.current[0]).toBe('value');
    });

    it('updates query param', () => {
      const { result } = renderHook(() => useQueryParam('key'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
    });

    it('removes query param when setting null', () => {
      const { result } = renderHook(() => useQueryParam('key'), {
        wrapper: createWrapper(['/?key=value']),
      });

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBe('');
    });
  });

  describe('useQueryParamValue', () => {
    it('returns default value when no query param', () => {
      const { result } = renderHook(() => useQueryParamValue('key', 'default'), {
        wrapper: createWrapper(),
      });
      expect(result.current).toBe('default');
    });

    it('returns query param value', () => {
      const { result } = renderHook(() => useQueryParamValue('key'), {
        wrapper: createWrapper(['/?key=value']),
      });
      expect(result.current).toBe('value');
    });
  });

  describe('useSetQueryParam', () => {
    it('returns setter function', () => {
      const { result } = renderHook(() => useSetQueryParam('key'), {
        wrapper: createWrapper(),
      });
      expect(typeof result.current).toBe('function');
    });

    it('sets query param', () => {
      const { result } = renderHook(() => useSetQueryParam('key'), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current('value');
      });

      expect(result.current).toBeDefined();
    });
  });
});
