export const SUPPORTED_API_VERSIONS = {
  V1: 'v1',
} as const;

type VersionStatus = 'stable' | 'beta' | 'deprecated';

interface VersionConfigItem {
  status: VersionStatus;
  deprecatedAt: string | null;
  sunsetAt: string | null;
  migration: string | null;
}

export const VERSION_CONFIG: Record<string, VersionConfigItem> = {
  v1: {
    status: 'stable',
    deprecatedAt: null,
    sunsetAt: null,
    migration: null,
  },
};

export function isSupportedVersion(version: string): boolean {
  const versions = Object.values(SUPPORTED_API_VERSIONS);
  return versions.includes(version as (typeof versions)[number]);
}

export function getVersionConfig(version: string): VersionConfigItem | null {
  return VERSION_CONFIG[version] || null;
}

export function isDeprecated(version: string): boolean {
  const config = getVersionConfig(version);
  if (!config) return false;
  return config.status === 'deprecated' || config.deprecatedAt !== null;
}

export function getDeprecationHeaders(
  version: string,
): Record<string, string> | null {
  const config = getVersionConfig(version);
  if (!config?.deprecatedAt) return null;

  const headers: Record<string, string> = {
    Deprecation: 'true',
    Sunset: new Date(config.sunsetAt!).toUTCString(),
  };

  if (config.migration) {
    headers['X-API-Suggest'] = config.migration;
  }

  return headers;
}

export function isVersionSunset(version: string): boolean {
  const config = getVersionConfig(version);
  if (!config?.sunsetAt) return false;
  return new Date() > new Date(config.sunsetAt);
}
