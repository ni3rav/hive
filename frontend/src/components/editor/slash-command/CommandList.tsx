import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/react';
import type { Range } from '@tiptap/react';

export interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (props: { editor: Editor; range: Range }) => void;
  searchTerms?: string[];
}

export interface CommandListProps {
  items: CommandItemProps[];
  command: (item: CommandItemProps) => void;
  editor: Editor;
  range: Range;
}

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length,
          );
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    return (
      <div className='z-50 w-72 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
        <div className='flex flex-col gap-0.5'>
          {props.items.length ? (
            props.items.map((item, index) => (
              <button
                key={index}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
                onClick={() => selectItem(index)}
              >
                <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                  <item.icon className='h-4 w-4' />
                </div>
                <div className='flex flex-col items-start'>
                  <span className='font-medium'>{item.title}</span>
                  <span className='text-xs text-muted-foreground'>
                    {item.description}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
              No results
            </div>
          )}
        </div>
      </div>
    );
  },
);

CommandList.displayName = 'CommandList';
