import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme } from '../src/theme-context';
import type { Theme } from '../src/types';

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.cookie = 'theme=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(ThemeProvider, null, children);

  it('provides default theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('system');
  });

  it('provides resolved theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('provides setTheme function', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('updates theme when setTheme is called', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('applies theme to document', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('uses custom storage key', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ThemeProvider,
        { storageKey: 'custom-theme' },
        children,
      );

    const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.cookie).toContain('custom-theme=dark');
  });

  it('throws when useTheme is used outside provider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
