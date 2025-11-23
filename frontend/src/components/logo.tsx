import { cn } from '@/lib/utils';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src='/hive.png'
      alt='Hive logo'
      className={cn('h-8 w-8 rounded-md aspect-square', className)}
      width={32}
      height={32}
    />
  );
}
