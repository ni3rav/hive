/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Diamond as Discord,
  Github,
  Globe,
  Linkedin,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  X,
} from 'lucide-react';

type Preset = {
  id: string;
  label: string;
  type: 'url' | 'email';
  placeholder?: string;
};

const PRESETS: Preset[] = [
  {
    id: 'x',
    label: 'X',
    type: 'url',
    placeholder: 'https://x.com/your-handle',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    type: 'url',
    placeholder: 'https://instagram.com/your-username',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    type: 'url',
    placeholder: 'https://facebook.com/your-profile',
  },
  {
    id: 'discord',
    label: 'Discord',
    type: 'url',
    placeholder: 'https://discord.gg/your-invite-or-profile',
  },
  {
    id: 'github',
    label: 'GitHub',
    type: 'url',
    placeholder: 'https://github.com/your-username',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    type: 'url',
    placeholder: 'https://www.linkedin.com/in/your-id',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'https://your-site.com',
  },
];

type SocialEntry = {
  id: string;
  platform: string;
  link: string;
  error?: string | null;
};

export type SocialLinksValue = Record<string, string>;

export function SocialLinksInput({
  className,
  defaultValue,
  onChange,
  label = 'Social Links (Optional)',
}: {
  className?: string;
  defaultValue?: SocialLinksValue;
  onChange?: (value: SocialLinksValue) => void;
  label?: string;
}) {
  const [rows, setRows] = React.useState<SocialEntry[]>(() => {
    if (!defaultValue)
      return [{ id: crypto.randomUUID(), platform: '', link: '', error: null }];
    const entries = Object.entries(defaultValue).map(([platform, link]) => ({
      id: crypto.randomUUID(),
      platform: normalizeKey(platform),
      link,
      error: null,
    }));
    return entries.length
      ? entries
      : [{ id: crypto.randomUUID(), platform: '', link: '', error: null }];
  });

  const platformIds = React.useMemo(
    () => new Set(rows.map((r) => normalizeKey(r.platform))),
    [rows],
  );

  React.useEffect(() => {
    const obj: SocialLinksValue = {};
    rows.forEach((r) => {
      const key = normalizeKey(r.platform);
      if (!key || !r.link || r.error) return;
      obj[key] = r.link;
    });
    if (Object.keys(obj).length > 0) {
      onChange?.(obj);
    }
  }, [rows, onChange]);

  function addRow() {
    setRows((prev) => {
      const hasEmptyOrError = prev.some((r) => !r.link || r.error);
      if (hasEmptyOrError) return prev;
      return [
        ...prev,
        { id: crypto.randomUUID(), platform: '', link: '', error: null },
      ];
    });
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id: string, patch: Partial<SocialEntry>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (typeof patch.link === 'string') {
          const detected = detectPlatform(patch.link);
          merged.platform = detected.platform;
        }
        merged.error = validateRow(
          merged,
          prev.filter((x) => x.id !== id),
        );
        return merged;
      }),
    );
  }

  function validateRow(row: SocialEntry, others: SocialEntry[]) {
    if (!row.link) return null; // allow empty row without error
    const { platform, normalizedUrl, isEmail } = detectPlatform(row.link);

    if (isEmail) {
      return isValidEmail(row.link) ? null : 'Enter a valid email address';
    }

    // URL validation
    const normalized = normalizedUrl || autoPrefixHttp(row.link);
    if (!isValidUrl(normalized)) return 'Enter a valid URL (https://...)';
    return null;
  }

  function handleNormalizeLink(id: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const { isEmail } = detectPlatform(r.link);
        if (isEmail) return r;
        const normalized = autoPrefixHttp(r.link);
        return { ...r, link: normalized };
      }),
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className='space-y-2'>
        <div className='space-y-2'>
          <div className='flex items-center justify-start gap-4'>
            {label ? (
              <div className='text-lg font-medium text-foreground'>{label}</div>
            ) : (
              <span />
            )}
            <Button
              type='button'
              variant='outline'
              onClick={addRow}
              className='cursor-pointer border'
              disabled={rows.some((r) => !r.link || r.error)}
            >
              + Add Link
            </Button>
          </div>

          {/* per-row error messages (moved to top) */}
          <div className='space-y-1'>
            {rows.map(
              (row) =>
                row.error && (
                  <p key={`err-${row.id}`} className='text-xs text-destructive'>
                    {row.error}
                  </p>
                ),
            )}
          </div>

          {rows.map((row) => {
            const { icon: Icon, platform } = detectPlatform(row.link);
            return (
              <div
                key={row.id}
                className={cn(
                  'flex items-center gap-2 rounded-md bg-card/50 p-2',
                )}
              >
                <span className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-foreground'>
                  <Icon className='h-4 w-4' aria-hidden='true' />
                  <span className='sr-only'>{platform || 'link'}</span>
                </span>

                <Input
                  className='border-0 shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  value={row.link}
                  placeholder='Enter social media URL'
                  onChange={(e) => updateRow(row.id, { link: e.target.value })}
                  onBlur={() => handleNormalizeLink(row.id)}
                  aria-invalid={!!row.error || undefined}
                />

                <Button
                  type='button'
                  variant='ghost'
                  className='h-9 w-9 p-0'
                  onClick={() => removeRow(row.id)}
                  aria-label='Remove link'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Utils

function normalizeKey(input: string) {
  return (input || '').trim().toLowerCase().replace(/\s+/g, '-'); // spaces to dashes
}

function getPresetByKey(key: string): Preset | undefined {
  return PRESETS.find((p) => p.id === key);
}

function isValidEmail(email: string) {
  // simple email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function autoPrefixHttp(value: string) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function inputIdForPlatform(key: string) {
  return `social-link-${key || 'custom'}`;
}

function platformInputId(id: string) {
  return `platform-${id}`;
}

function detectPlatform(raw: string): {
  platform: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isEmail: boolean;
  normalizedUrl?: string;
} {
  const value = (raw || '').trim();
  if (!value) return { platform: '', icon: Globe, isEmail: false };

  // email
  if (isValidEmail(value) || /^mailto:/i.test(value)) {
    return { platform: 'email', icon: Mail, isEmail: true };
  }

  const url = autoPrefixHttp(value);
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    const isHost = (root: string) => host === root || host.endsWith(`.${root}`);

    if (isHost('x.com') || isHost('twitter.com')) {
      return {
        platform: 'x',
        icon: Twitter,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('instagram.com')) {
      return {
        platform: 'instagram',
        icon: Instagram,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('facebook.com') || isHost('fb.com')) {
      return {
        platform: 'facebook',
        icon: Facebook,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('github.com')) {
      return {
        platform: 'github',
        icon: Github,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('linkedin.com') || isHost('lnkd.in')) {
      return {
        platform: 'linkedin',
        icon: Linkedin,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('youtube.com') || host === 'youtu.be') {
      return {
        platform: 'youtube',
        icon: Youtube,
        isEmail: false,
        normalizedUrl: url,
      };
    }
    if (isHost('discord.gg') || isHost('discord.com')) {
      return {
        platform: 'discord',
        icon: Discord,
        isEmail: false,
        normalizedUrl: url,
      };
    }

    // default generic website
    return {
      platform: 'website',
      icon: Globe,
      isEmail: false,
      normalizedUrl: url,
    };
  } catch {
    // not a URL and not an email
    return { platform: '', icon: Globe, isEmail: false };
  }
}

export default SocialLinksInput;
