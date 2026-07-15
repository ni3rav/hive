export function getUrlQueryParam(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URLSearchParams(window.location.search).get(key);
}

export function getUrlQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function setUrlQueryParam(key: string, value: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.replaceState({}, '', url.toString());
}

export function setUrlQueryParams(
  params: Record<string, string | null>,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.replaceState({}, '', url.toString());
}

export function toggleUrlQueryParam(
  key: string,
  activeValue: string,
  inactiveValue: string | null = null,
): void {
  const current = getUrlQueryParam(key);
  if (current === activeValue) {
    setUrlQueryParam(key, inactiveValue);
  } else {
    setUrlQueryParam(key, activeValue);
  }
}

export function deleteUrlQueryParam(key: string): void {
  setUrlQueryParam(key, null);
}

export function deleteUrlQueryParams(keys: string[]): void {
  const params: Record<string, null> = {};
  keys.forEach((key) => {
    params[key] = null;
  });
  setUrlQueryParams(params);
}
