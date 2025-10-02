import type { Author } from '@/types/author';
import { useState } from 'react';
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

interface AuthorFormProps {
  initialData?: Author | null;
  onSave: (data: Author | Partial<Author>) => void;
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

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    about: initialData?.about || '',
    socialLinks: initialData?.socialLinks as Author['socialLinks'],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // for creating new authors, send all data
    if (!isEditing) {
      onSave({
        name: formData.name,
        email: formData.email,
        about: formData.about,
        socialLinks: formData.socialLinks,
      });
      return;
    }

    // for editing, send only changed fields
    const changedFields: Partial<Author> = {};

    if (formData.name !== initialData?.name) {
      changedFields.name = formData.name;
    }
    if (formData.email !== initialData?.email) {
      changedFields.email = formData.email;
    }
    if (formData.about !== initialData?.about) {
      changedFields.about = formData.about;
    }

    // deep comparison for socialLinks
    const socialLinksChanged =
      JSON.stringify(formData.socialLinks) !==
      JSON.stringify(initialData?.socialLinks);
    if (socialLinksChanged) {
      changedFields.socialLinks = formData.socialLinks;
    }

    onSave(changedFields);
  };

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
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder="Author's full name"
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='author@example.com'
              required
            />
          </div>
          <div className='space-y-2'>
            {/* "(Optional)" removed from label */}
            <Label htmlFor='about'>About</Label>
            <Textarea
              id='about'
              name='about'
              value={formData.about}
              onChange={handleChange}
              placeholder='Share a brief biography of the author.'
            />
          </div>
          <div className='space-y-2'>
            <SocialLinksInput
              label='Social Links (Optional)'
              defaultValue={initialData?.socialLinks}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  socialLinks: value,
                }))
              }
            />
          </div>
          <div className='flex justify-end gap-3'>
            <Button type='button' variant='ghost' onClick={onCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Author'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
