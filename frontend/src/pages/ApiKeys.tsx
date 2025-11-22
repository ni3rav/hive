import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ApiKeysPage() {
  return (
    <div className='flex flex-col gap-6 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>API Keys</h1>
          <p className='text-muted-foreground text-sm'>
            Manage your API keys for accessing the Marble API.
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Create New Key
        </Button>
      </div>

      <div className='rounded-md border'>
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='bg-muted/50 mb-4 rounded-full p-3'>
            <div className='bg-muted h-6 w-6 rounded-full' />
          </div>
          <h3 className='text-lg font-semibold'>No API keys found</h3>
          <p className='text-muted-foreground mb-4 text-sm max-w-sm'>
            You haven't created any API keys yet. Create one to get started with the API.
          </p>
          <Button variant='outline'>Create your first key</Button>
        </div>
      </div>
    </div>
  );
}
