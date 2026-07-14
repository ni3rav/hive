import { type FallbackProps } from 'react-error-boundary';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { LucideAlertCircle } from 'lucide-react';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle className='text-destructive flex items-center gap-2'>
              <LucideAlertCircle className='w-6 h-6 text-destructive' />
              Something went wrong
            </CardTitle>
            <CardDescription>
              An unexpected error has occurred. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className='whitespace-pre-wrap text-destructive bg-destructive/10 rounded p-3 mb-4 text-sm'>
              {error?.message}
            </pre>
            <Button
              onClick={resetErrorBoundary}
              className='w-full'
              variant='default'
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
