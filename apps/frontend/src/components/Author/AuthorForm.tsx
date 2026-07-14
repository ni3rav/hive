import type { Author, CreateAuthorData } from '@/types/author';
import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SocialLinksInput from './social-links';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface AuthorFormProps {
  initialData?: Author | null;
  onSave: (data: CreateAuthorData | Partial<CreateAuthorData>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function AuthorForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting,
}: AuthorFormProps) {
  const isEditing = !!initialData;
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLTextAreaElement>(null);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.email('Enter a valid email'),
        about: z.string().optional().default(''),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Pick<CreateAuthorData, 'name' | 'email' | 'about'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      about: initialData?.about || '',
    },
    mode: 'onChange',
  });

  const [hasSocialLinksErrors, setHasSocialLinksErrors] = useState(false);
  const [socialLinksError, setSocialLinksError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<Author['socialLinks']>(
    (initialData?.socialLinks as Author['socialLinks']) || undefined,
  );

  const focusFirstError = () => {
    setTimeout(() => {
      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
        emailInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (errors.about && aboutInputRef.current) {
        aboutInputRef.current.focus();
        aboutInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  const handleSocialLinksChange = useCallback(
    (value: Author['socialLinks'] | undefined) => {
      setSocialLinks(value);
    },
    [],
  );

  const handleValidationChange = useCallback((hasErrors: boolean) => {
    setHasSocialLinksErrors(hasErrors);
    if (!hasErrors) {
      setSocialLinksError(null);
    }
  }, []);

  const onSubmit = (
    values: Pick<CreateAuthorData, 'name' | 'email' | 'about'>,
  ) => {
    if (hasSocialLinksErrors) {
      setSocialLinksError(
        'Please fill in all social link fields or remove empty ones',
      );
      return;
    }

    setSocialLinksError(null);

    if (!isEditing) {
      onSave({
        name: values.name,
        email: values.email,
        about: values.about,
        ...(socialLinks ? { socialLinks } : {}),
      });
      return;
    }

    const changedFields: Partial<CreateAuthorData> = {};

    if (values.name !== initialData?.name) {
      changedFields.name = values.name;
    }
    if (values.email !== initialData?.email) {
      changedFields.email = values.email;
    }
    if (values.about !== initialData?.about) {
      changedFields.about = values.about;
    }

    const socialLinksChanged =
      JSON.stringify(socialLinks) !== JSON.stringify(initialData?.socialLinks);
    if (socialLinksChanged) {
      if (socialLinks) {
        changedFields.socialLinks = socialLinks;
      } else if (initialData?.socialLinks) {
        changedFields.socialLinks = {};
      }
    }

    onSave(changedFields);
  };

  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedAbout = watch('about');

  const hasChanges = useMemo(() => {
    if (!isEditing) return true;
    const current = {
      name: watchedName,
      email: watchedEmail,
      about: watchedAbout || '',
    };
    const base = {
      name: initialData?.name || '',
      email: initialData?.email || '',
      about: initialData?.about || '',
    };
    const socialsChanged =
      JSON.stringify(socialLinks) !== JSON.stringify(initialData?.socialLinks);
    return (
      socialsChanged ||
      current.name !== base.name ||
      current.email !== base.email ||
      current.about !== base.about
    );
  }, [
    isEditing,
    initialData,
    socialLinks,
    watchedName,
    watchedEmail,
    watchedAbout,
  ]);

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Author' : 'Create New Author'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update the details for this author profile.'
            : 'Add a new author to your workspace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, () => focusFirstError())}
          className='space-y-6'
        >
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              {...register('name')}
              ref={(e) => {
                register('name').ref(e);
                nameInputRef.current = e;
              }}
              placeholder="Author's full name"
              required
              className={
                errors.name
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.name?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.name.message}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              {...register('email')}
              ref={(e) => {
                register('email').ref(e);
                emailInputRef.current = e;
              }}
              placeholder='author@example.com'
              required
              className={
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.email?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.email.message}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='about'>About</Label>
            <Textarea
              id='about'
              {...register('about')}
              ref={(e) => {
                register('about').ref(e);
                aboutInputRef.current = e;
              }}
              placeholder='Share a brief biography of the author.'
              className={
                errors.about
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.about?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.about.message}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <SocialLinksInput
              label='Social Links (Optional)'
              defaultValue={initialData?.socialLinks}
              onChange={handleSocialLinksChange}
              onValidationChange={handleValidationChange}
            />
            {socialLinksError && (
              <p className='text-sm text-destructive'>{socialLinksError}</p>
            )}
          </div>
          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting ||
                hasSocialLinksErrors ||
                (isEditing && !hasChanges)
              }
            >
              {isSubmitting ? 'Saving...' : 'Save Author'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
