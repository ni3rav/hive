import { PostEditorPage } from '@/components/tiptap/posteditorpage';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';

export default function Editor() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PostEditorPage className='h-full' />
    </ErrorBoundary>
  );
}
