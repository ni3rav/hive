import { useMemo, useState } from 'react';
import { Plus, Copy, Download, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyContent,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import {
  useCreateWorkspaceApiKey,
  useDeleteWorkspaceApiKey,
  useWorkspaceApiKeys,
} from '@/hooks/useApiKeys';
import { useMembers } from '@/hooks/useMember';
import type {
  WorkspaceApiKey,
  CreateWorkspaceApiKeyResponse,
} from '@/types/api-key';

export default function ApiKeysManager() {
  const workspaceSlug = useWorkspaceSlug();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyPendingDelete, setKeyPendingDelete] =
    useState<WorkspaceApiKey | null>(null);
  const [newKeyResult, setNewKeyResult] =
    useState<CreateWorkspaceApiKeyResponse | null>(null);

  const {
    data: apiKeyData,
    isLoading,
    isError,
  } = useWorkspaceApiKeys(workspaceSlug);
  const apiKeys = apiKeyData ?? [];
  const { data: memberData } = useMembers(workspaceSlug);

  const createKey = useCreateWorkspaceApiKey(workspaceSlug);
  const deleteKey = useDeleteWorkspaceApiKey(workspaceSlug);

  const memberLookup = useMemo(() => {
    const map = new Map<string, string>();
    memberData?.members.forEach((member) => {
      map.set(member.userId, member.name);
    });
    return map;
  }, [memberData]);

  const handleCreateKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) return;

    try {
      const result = await createKey.mutateAsync({ description: trimmed });
      setNewKeyResult(result);
      setDescription('');
      setCreateDialogOpen(false);
    } catch {
      // handled in hook toast
    }
  };

  const handleDeleteRequest = (key: WorkspaceApiKey) => {
    setKeyPendingDelete(key);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!keyPendingDelete) return;
    try {
      await deleteKey.mutateAsync(keyPendingDelete.id);
      setDeleteDialogOpen(false);
      setKeyPendingDelete(null);
    } catch {
      // handled in hook toast
    }
  };

  const handleCopyKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success('API key copied');
    } catch {
      toast.error('Unable to copy key');
    }
  };

  const handleDownloadKey = (payload: CreateWorkspaceApiKeyResponse) => {
    const lines = [
      'Workspace API Key',
      `Description: ${payload.metadata.description}`,
      `Created At: ${formatDate(payload.metadata.createdAt)}`,
      '',
      `API Key: ${payload.apiKey}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `hive-api-key-${payload.metadata.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const hasReachedLimit = apiKeys.length >= 3;

  const handleCreateButtonPress = () => {
    if (hasReachedLimit || !workspaceSlug) {
      if (hasReachedLimit) {
        toast.error(
          'Workspace already has 3 API keys. Delete and existing key to create a new one.',
        );
      }
      return;
    }

    setCreateDialogOpen(true);
  };

  return (
    <div className='px-4 py-4 sm:px-6 sm:py-6'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>API Keys</h1>
            <p className='text-muted-foreground text-sm'>
              Issue workspace-scoped keys for accessing the Content
            </p>
          </div>
          <div
            className='inline-flex'
            role='presentation'
            onClick={handleCreateButtonPress}
          >
            <Button
              disabled={hasReachedLimit || !workspaceSlug}
              className={hasReachedLimit ? 'pointer-events-none' : undefined}
            >
              <Plus className='size-4' />
              Create API Key
            </Button>
          </div>
        </div>

        <Alert variant='default' className='border-dashed'>
          <KeyRound className='text-primary' />
          <AlertTitle>Workspace access only</AlertTitle>
          <AlertDescription>
            Each workspace can have up to three API keys. Keys inherit the
            workspace permissions of the creator and can be revoked at any time.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className='flex min-h-[320px] items-center justify-center rounded-lg border'>
            <Spinner className='size-6 text-muted-foreground' />
          </div>
        ) : isError ? (
          <Alert variant='destructive'>
            <AlertTitle>Failed to load API keys</AlertTitle>
            <AlertDescription>
              Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        ) : apiKeys.length === 0 ? (
          <Empty className='border border-dashed'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <KeyRound className='h-5 w-5' />
              </EmptyMedia>
              <EmptyTitle>No API keys yet</EmptyTitle>
              <EmptyDescription>
                Create your first key to start integrating with the Content
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div
                className='inline-flex'
                role='presentation'
                onClick={handleCreateButtonPress}
              >
                <Button
                  variant='outline'
                  disabled={hasReachedLimit || !workspaceSlug}
                  className={
                    hasReachedLimit ? 'pointer-events-none' : undefined
                  }
                >
                  Create API Key
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='rounded-md bg-card/30 p-1'>
            <div className='flex flex-col'>
              {apiKeys.map((key, index) => (
                <div key={key.id}>
                  <div className='flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                      <p className='text-base font-medium text-foreground'>
                        {key.description || 'Untitled key'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Created {formatDate(key.createdAt)} by{' '}
                        {memberLookup.get(key.createdByUserId) ??
                          'Unknown member'}
                      </p>
                    </div>
                    <Button
                      variant='destructive'
                      onClick={() => handleDeleteRequest(key)}
                      disabled={
                        deleteKey.isPending && keyPendingDelete?.id === key.id
                      }
                    >
                      <Trash2 className='size-4' />
                      Delete
                    </Button>
                  </div>
                  {index < apiKeys.length - 1 && (
                    <Separator className='text-border/60 bg-accent/50' />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Provide a short description so you know how this key is used.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKey} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='api-key-description'>Description</Label>
              <Input
                id='api-key-description'
                placeholder='e.g. Content website feed'
                maxLength={120}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setCreateDialogOpen(false)}
                disabled={createKey.isPending}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={createKey.isPending || !description.trim()}
              >
                {createKey.isPending ? 'Creating...' : 'Create key'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              This will immediately revoke access for{' '}
              <span className='font-medium text-foreground'>
                {keyPendingDelete?.description || 'this key'}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteKey.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteKey.isPending}
            >
              {deleteKey.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!newKeyResult}
        onOpenChange={(open) => {
          if (!open) setNewKeyResult(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>
              Copy or download this key now. You will not be able to view it
              again.
            </DialogDescription>
          </DialogHeader>
          {newKeyResult && (
            <div className='space-y-4'>
              <Alert>
                <AlertTitle>Keep this key secure</AlertTitle>
                <AlertDescription>
                  Treat API keys like passwords. Rotate them if you suspect
                  exposure.
                </AlertDescription>
              </Alert>
              <div className='space-y-2'>
                <Label>API Key</Label>
                <div className='rounded-md border bg-muted/50 p-3 font-mono text-sm break-all'>
                  {newKeyResult.apiKey}
                </div>
              </div>
              <div className='space-y-1 text-sm text-muted-foreground'>
                <p>
                  Description:{' '}
                  <span className='text-foreground'>
                    {newKeyResult.metadata.description}
                  </span>
                </p>
                <p>Created at: {formatDate(newKeyResult.metadata.createdAt)}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleCopyKey(newKeyResult.apiKey)}
                >
                  <Copy className='mr-2 h-4 w-4' />
                  Copy key
                </Button>
                <Button
                  type='button'
                  onClick={() => handleDownloadKey(newKeyResult)}
                >
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
