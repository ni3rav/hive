import { cn } from '@/lib/utils';

export function ResizeHandle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-500/50',
        className,
      )}
      {...props}
    />
  );
}
