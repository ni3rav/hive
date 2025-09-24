'use client';

import React, {
  useEffect,
  useRef,
  type ReactNode,
  type ElementType,
  type ReactElement,
} from 'react';
import { cn } from '@/lib/utils';

/* Allow CSS custom properties like --ag-delay without TS error */
interface CSSVars extends React.CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

export type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing'
  | 'blur'
  | 'blur-slide';

interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  preset?: PresetType;
  as?: ElementType;
  stagger?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  delayOffset?: number;
}

export function AnimatedGroup({
  children,
  className,
  preset = 'blur-slide',
  as: Comp = 'div',
  stagger = 120,
  once = true,
  threshold = 0.15,
  rootMargin = '0px',
  delayOffset = 0,
}: AnimatedGroupProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('ag-visible');
            if (once) io.disconnect();
          } else if (!once) {
            el.classList.remove('ag-visible');
          }
        });
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold, rootMargin]);

  const kids = React.Children.toArray(children);

  return (
    <Comp
      ref={ref}
      className={cn('ag-group', className)}
      data-preset={preset}
    >
      {kids.map((child, i) => {
        const delay = delayOffset + i * stagger;
        const style: CSSVars = { ['--ag-delay']: `${delay}ms` };

        if (React.isValidElement(child)) {
          const childElement = child as ReactElement<{ style?: CSSVars; className?: string }>;
          return React.cloneElement(childElement, {
            className: cn(childElement.props.className, 'ag-item', `ag-${preset}`),
            style: { ...(childElement.props.style || {}), ...style },
            key: childElement.key ?? i,
          });
        }

        return (
          <div
            key={i}
            className={cn('ag-item', `ag-${preset}`)}
            style={style}
          >
            {child}
          </div>
        );
      })}
    </Comp>
  );
}

export default AnimatedGroup;
