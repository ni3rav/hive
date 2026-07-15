import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUrlQueryParam,
  getUrlQueryParams,
  setUrlQueryParam,
  setUrlQueryParams,
  toggleUrlQueryParam,
  deleteUrlQueryParam,
  deleteUrlQueryParams,
} from '../src/vanilla';

describe('vanilla query param utilities', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  describe('getUrlQueryParam', () => {
    it('returns null when no query params', () => {
      expect(getUrlQueryParam('key')).toBeNull();
    });

    it('returns value when query param exists', () => {
      window.history.replaceState({}, '', '/?key=value');
      expect(getUrlQueryParam('key')).toBe('value');
    });

    it('returns null for non-existent key', () => {
      window.history.replaceState({}, '', '/?other=value');
      expect(getUrlQueryParam('key')).toBeNull();
    });
  });

  describe('getUrlQueryParams', () => {
    it('returns empty object when no query params', () => {
      expect(getUrlQueryParams()).toEqual({});
    });

    it('returns all query params', () => {
      window.history.replaceState({}, '', '/?key1=value1&key2=value2');
      expect(getUrlQueryParams()).toEqual({ key1: 'value1', key2: 'value2' });
    });
  });

  describe('setUrlQueryParam', () => {
    it('sets query param', () => {
      setUrlQueryParam('key', 'value');
      expect(window.location.search).toContain('key=value');
    });

    it('removes query param when value is null', () => {
      window.history.replaceState({}, '', '/?key=value');
      setUrlQueryParam('key', null);
      expect(window.location.search).not.toContain('key=value');
    });

    it('updates existing query param', () => {
      window.history.replaceState({}, '', '/?key=old');
      setUrlQueryParam('key', 'new');
      expect(window.location.search).toContain('key=new');
      expect(window.location.search).not.toContain('key=old');
    });
  });

  describe('setUrlQueryParams', () => {
    it('sets multiple query params', () => {
      setUrlQueryParams({ key1: 'value1', key2: 'value2' });
      expect(window.location.search).toContain('key1=value1');
      expect(window.location.search).toContain('key2=value2');
    });

    it('removes multiple query params', () => {
      window.history.replaceState({}, '', '/?key1=value1&key2=value2');
      setUrlQueryParams({ key1: null, key2: null });
      expect(window.location.search).not.toContain('key1=value1');
      expect(window.location.search).not.toContain('key2=value2');
    });
  });

  describe('toggleUrlQueryParam', () => {
    it('sets value when not active', () => {
      toggleUrlQueryParam('key', 'active');
      expect(window.location.search).toContain('key=active');
    });

    it('removes value when active', () => {
      window.history.replaceState({}, '', '/?key=active');
      toggleUrlQueryParam('key', 'active');
      expect(window.location.search).not.toContain('key=active');
    });

    it('uses custom inactive value', () => {
      window.history.replaceState({}, '', '/?key=active');
      toggleUrlQueryParam('key', 'active', 'inactive');
      expect(window.location.search).toContain('key=inactive');
    });
  });

  describe('deleteUrlQueryParam', () => {
    it('removes query param', () => {
      window.history.replaceState({}, '', '/?key=value');
      deleteUrlQueryParam('key');
      expect(window.location.search).not.toContain('key=value');
    });
  });

  describe('deleteUrlQueryParams', () => {
    it('removes multiple query params', () => {
      window.history.replaceState({}, '', '/?key1=value1&key2=value2');
      deleteUrlQueryParams(['key1', 'key2']);
      expect(window.location.search).not.toContain('key1=value1');
      expect(window.location.search).not.toContain('key2=value2');
    });
  });
});
