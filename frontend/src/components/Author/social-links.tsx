import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { z } from 'zod';
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
import { toast } from 'sonner';

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
  onValidationChange,
  label = 'Social Links (Optional)',
}: {
  className?: string;
  defaultValue?: SocialLinksValue;
  onChange?: (value: SocialLinksValue) => void;
  onValidationChange?: (hasErrors: boolean) => void;
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

  React.useEffect(() => {
    const obj: SocialLinksValue = {};
    const hasErrors = rows.some((r) => r.error !== null);
    const hasEmptyRows = rows.some((r) => r.link.trim() === '');

    rows.forEach((r) => {
      const key = normalizeKey(r.platform);
      if (!key || !r.link || r.error) return;
      obj[key] = r.link;
    });

    if (Object.keys(obj).length > 0) {
      onChange?.(obj);
    }

    onValidationChange?.(hasErrors || hasEmptyRows);
  }, [rows, onChange, onValidationChange]);

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
    setRows((prev) => {
      if (typeof patch.link === 'string') {
        const candidate = patch.link;
        const candidateNorm =
          detectPlatform(candidate).normalizedUrl || autoPrefixHttp(candidate);
        const hasDuplicate = prev.some((r) => {
          if (r.id === id) return false;
          const norm =
            detectPlatform(r.link).normalizedUrl || autoPrefixHttp(r.link);
          return norm === candidateNorm;
        });
        if (hasDuplicate) {
          toast.warning('That link is already added');
          return prev.filter((r) => r.id !== id);
        }
      }

      return prev.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch };
        if (typeof patch.link === 'string') {
          const detected = detectPlatform(patch.link);
          merged.platform = detected.platform;
        }
        merged.error = validateRow(merged);
        return merged;
      });
    });
  }

  function validateRow(row: SocialEntry) {
    if (!row.link) return null;
    const { normalizedUrl, isEmail } = detectPlatform(row.link);

    if (isEmail) {
      return isValidEmail(row.link) ? null : 'Enter a valid email address';
    }

    const normalized = normalizedUrl || autoPrefixHttp(row.link);
    if (!isValidUrl(normalized)) {
      return 'Enter a valid domain (e.g., example.com)';
    }
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

          {rows.map((row) => {
            const { icon: Icon, platform } = detectPlatform(row.link);
            return (
              <div key={row.id} className='space-y-2'>
                <div className='flex items-center gap-2 rounded-md bg-card/50 p-2'>
                  <span className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-foreground'>
                    <Icon className='h-4 w-4' aria-hidden='true' />
                    <span className='sr-only'>{platform || 'link'}</span>
                  </span>

                  <Input
                    className={cn(
                      'border shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      row.error
                        ? 'border-destructive text-destructive focus-visible:ring-destructive'
                        : 'border-transparent',
                    )}
                    value={row.link}
                    placeholder='Enter social media URL'
                    onChange={(e) =>
                      updateRow(row.id, { link: e.target.value })
                    }
                    onBlur={() => handleNormalizeLink(row.id)}
                    aria-invalid={!!row.error || undefined}
                  />

                  <Button
                    type='button'
                    variant='ghost'
                    className='h-9 w-9 shrink-0 p-0'
                    onClick={() => removeRow(row.id)}
                    aria-label='Remove link'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                {row.error && (
                  <p className='text-sm text-destructive pl-11'>{row.error}</p>
                )}
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
  return (input || '').trim().toLowerCase().replace(/\s+/g, '-');
}

const emailSchema = z.email();
const urlSchema = z
  .url()
  .refine((url) => url.startsWith('https://'), 'URL must use HTTPS protocol');

function isValidEmail(email: string) {
  return emailSchema.safeParse(email).success;
}

function isValidUrl(value: string) {
  return urlSchema.safeParse(value).success;
}

function autoPrefixHttp(value: string) {
  if (!value) return value;

  const cleanUrl = value.replace(/^(https?|ftp):\/\//i, '');

  return `https://${cleanUrl}`;
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
