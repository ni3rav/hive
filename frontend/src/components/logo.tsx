import { cn } from '@/lib/utils';

export const LogoMark = ({ className = '' }: { className?: string }) => (
  <div
    className={cn(
      'h-8 w-8 rounded-md grid place-items-center relative overflow-hidden',
      className,
    )}
  >
    <span className='absolute inset-0 rounded-md bg-[linear-gradient(140deg,#FFC93822,#FFD84B11)] ring-1 ring-yellow-500/35' />
    <span className='relative text-[10px] font-bold text-yellow-400 tracking-wider'>
      H
    </span>
  </div>
);

export function Logo({ className = '' }: { className?: string }) {
  return (
    <img
      src='/hive.png'
      alt='Hive logo'
      className={cn('h-8 w-8 rounded-md', className)}
      width={32}
      height={32}
    />
  );
}
