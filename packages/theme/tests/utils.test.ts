import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveTheme,
  applyTheme,
  getSystemTheme,
  createCookieStorage,
  createLocalStorageAdapter,
  getThemeFromQueryParam,
} from '../src/utils';

describe('theme utils', () => {
  describe('resolveTheme', () => {
    it('resolves light theme', () => {
      expect(resolveTheme('light')).toBe('light');
    });

    it('resolves dark theme', () => {
      expect(resolveTheme('dark')).toBe('dark');
    });

    it('resolves system theme to light', () => {
      expect(resolveTheme('system', 'light')).toBe('light');
    });

    it('resolves system theme to dark', () => {
      expect(resolveTheme('system', 'dark')).toBe('dark');
    });
  });

  describe('getSystemTheme', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
    });

    it('returns light when matchMedia returns false', () => {
      expect(getSystemTheme()).toBe('light');
    });

    it('returns dark when matchMedia returns true', () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      expect(getSystemTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      document.documentElement.className = '';
      document.documentElement.removeAttribute('data-theme');
    });

    it('applies light theme', () => {
      applyTheme('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('applies dark theme', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('uses custom attribute', () => {
      applyTheme('light', 'data-mode');
      expect(document.documentElement.getAttribute('data-mode')).toBe('light');
    });

    it('removes previous theme classes', () => {
      document.documentElement.classList.add('dark');
      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });

  describe('createCookieStorage', () => {
    it('creates storage adapter', () => {
      const storage = createCookieStorage();
      expect(storage).toHaveProperty('getItem');
      expect(storage).toHaveProperty('setItem');
      expect(storage).toHaveProperty('removeItem');
    });

    it('sets and gets cookie', () => {
      const storage = createCookieStorage();
      storage.setItem('test-key', 'test-value');
      const value = storage.getItem('test-key');
      expect(value).toBe('test-value');
    });

    it('removes cookie', () => {
      const storage = createCookieStorage();
      storage.setItem('test-key', 'test-value');
      storage.removeItem('test-key');
      const value = storage.getItem('test-key');
      expect(value).toBeNull();
    });
  });

  describe('createLocalStorageAdapter', () => {
    it('creates storage adapter', () => {
      const storage = createLocalStorageAdapter();
      expect(storage).toHaveProperty('getItem');
      expect(storage).toHaveProperty('setItem');
      expect(storage).toHaveProperty('removeItem');
    });

    it('sets and gets item', () => {
      const storage = createLocalStorageAdapter();
      storage.setItem('test-key', 'test-value');
      const value = storage.getItem('test-key');
      expect(value).toBe('test-value');
      localStorage.removeItem('test-key');
    });

    it('removes item', () => {
      const storage = createLocalStorageAdapter();
      storage.setItem('test-key', 'test-value');
      storage.removeItem('test-key');
      const value = storage.getItem('test-key');
      expect(value).toBeNull();
    });
  });

  describe('getThemeFromQueryParam', () => {
    it('returns null when no window', () => {
      expect(getThemeFromQueryParam()).toBeNull();
    });
  });
});
