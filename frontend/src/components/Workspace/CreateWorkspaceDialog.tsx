import { useEffect, useRef } from 'react';
import {
  useCreateWorkspace,
  useCheckSlugAvailability,
} from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema } from '@/lib/validations/workspace';
import type { CreateWorkspaceData } from '@/types/workspace';
import { FolderPlus, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function sanitizeSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const createWorkspace = useCreateWorkspace();
  const slugManuallyEditedRef = useRef(false);

  const form = useForm<CreateWorkspaceData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      workspaceName: '',
      workspaceSlug: '',
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = form;

  const nameValue = watch('workspaceName');
  const slugValue = watch('workspaceSlug');

  useEffect(() => {
    if (!slugManuallyEditedRef.current && nameValue) {
      const sanitized = sanitizeSlug(nameValue);
      setValue('workspaceSlug', sanitized, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      slugManuallyEditedRef.current = false;
    }
  }, [open, reset]);

  const debouncedSlug = useDebounce(slugValue, 500);
  const { data: slugCheck, isLoading: isCheckingSlug } =
    useCheckSlugAvailability(
      slugValue && !errors.workspaceSlug ? debouncedSlug : null,
    );

  const isSlugAvailable = slugCheck?.available === true;
  const isSlugTaken = slugCheck?.available === false;

  const canSubmit =
    isValid && !isCheckingSlug && isSlugAvailable && !createWorkspace.isPending;

  const onSubmit = handleSubmit(async (data) => {
    if (!isSlugAvailable) {
      return;
    }

    try {
      const response = await createWorkspace.mutateAsync(data);

      if (response?.slug) {
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Failed to create workspace';
      toast.error(errorMessage);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <FolderPlus className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Create a workspace to organize your content
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className='space-y-5 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='workspaceName'>Workspace Name</Label>
              <Input
                id='workspaceName'
                {...register('workspaceName')}
                placeholder='e.g., My Team'
                autoComplete='off'
                className={
                  errors.workspaceName
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
                autoFocus
              />
              {errors.workspaceName && (
                <p className='text-sm font-medium text-destructive'>
                  {errors.workspaceName.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='workspaceSlug'>Workspace Slug</Label>
              <Input
                id='workspaceSlug'
                {...register('workspaceSlug', {
                  onChange: () => {
                    slugManuallyEditedRef.current = true;
                  },
                })}
                placeholder='e.g., my-team'
                autoComplete='off'
                className={
                  errors.workspaceSlug || isSlugTaken
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
              />
              <div className='min-h-[20px] space-y-1'>
                {errors.workspaceSlug && (
                  <div className='flex items-center gap-2 text-sm font-medium text-destructive'>
                    <XCircle className='h-4 w-4' />
                    <span>{errors.workspaceSlug.message}</span>
                  </div>
                )}
                {!errors.workspaceSlug && isCheckingSlug && (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Checking availability...</span>
                  </div>
                )}
                {!errors.workspaceSlug &&
                  !isCheckingSlug &&
                  isSlugAvailable && (
                    <div className='flex items-center gap-2 text-sm font-medium text-primary'>
                      <CheckCircle2 className='h-4 w-4' />
                      <span>Available</span>
                    </div>
                  )}
                {!errors.workspaceSlug && !isCheckingSlug && isSlugTaken && (
                  <div className='flex items-center gap-2 text-sm font-medium text-destructive'>
                    <XCircle className='h-4 w-4' />
                    <span>This slug is already taken</span>
                  </div>
                )}
                {!errors.workspaceSlug &&
                  !slugManuallyEditedRef.current &&
                  slugValue && (
                    <p className='text-xs text-muted-foreground'>
                      Your workspace will be accessible at:{' '}
                      <code className='rounded bg-muted px-1.5 py-0.5 text-xs font-mono'>
                        /dashboard/{slugValue}
                      </code>
                    </p>
                  )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className='mr-2 h-4 w-4' />
                  Create Workspace
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
