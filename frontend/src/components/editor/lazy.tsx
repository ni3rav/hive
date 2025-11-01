import React from 'react';

// Lazy a named export: const { Foo } = await import('./Foo'); -> lazyImport(() => import('./Foo'), 'Foo')
export function lazyImport<
  TModule extends Record<string, unknown>,
  TKey extends keyof TModule,
>(factory: () => Promise<TModule>, name: TKey) {
  return React.lazy(async () => {
    const mod = await factory();
    const Comp = mod[name] as unknown;
    if (!Comp || typeof Comp !== 'function') {
      throw new Error(`Export "${String(name)}" not found or not a component`);
    }
    return { default: Comp as React.ComponentType<unknown> };
  });
}

// Lazy a default export: lazyDefault(() => import('./Foo'))
export function lazyDefault<TComp extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: TComp }>,
) {
  return React.lazy(async () => {
    const mod = await factory();
    if (!mod?.default) throw new Error('Default export not found');
    return { default: mod.default };
  });
}

// Vite glob map for pages; keys are compile-time safe and avoid ad-hoc string paths
const pages: Record<string, () => Promise<unknown>> = import.meta.glob(
  '/src/pages/**/*.tsx',
);

// Vite glob map for components
const components: Record<string, () => Promise<unknown>> = import.meta.glob(
  '/src/components/**/*.tsx',
);

// Lazy from a known page path with optional named export
export function lazyPage<TProps = unknown>(
  path: keyof typeof pages,
  exportName: 'default' | string = 'default',
): React.LazyExoticComponent<React.ComponentType<TProps>> {
  const loader = pages[path];
  if (!loader) throw new Error(`Page not found: ${String(path)}`);
  return React.lazy(async () => {
    const mod = (await loader()) as Record<string, unknown> & {
      default?: React.ComponentType<TProps>;
    };
    const pick =
      exportName === 'default' ? mod.default : (mod[exportName] as unknown);
    if (!pick || typeof pick !== 'function') {
      throw new Error(
        `Export "${exportName}" not found or not a component in ${String(path)}`,
      );
    }
    return { default: pick as React.ComponentType<TProps> };
  });
}

// Lazy from a known component path with optional named export
export function lazyComponent<TProps = unknown>(
  path: keyof typeof components,
  exportName: 'default' | string = 'default',
): React.LazyExoticComponent<React.ComponentType<TProps>> {
  const loader = components[path];
  if (!loader) throw new Error(`Component not found: ${String(path)}`);
  return React.lazy(async () => {
    const mod = (await loader()) as Record<string, unknown> & {
      default?: React.ComponentType<TProps>;
    };
    const pick =
      exportName === 'default' ? mod.default : (mod[exportName] as unknown);
    if (!pick || typeof pick !== 'function') {
      throw new Error(
        `Export "${exportName}" not found or not a component in ${String(path)}`,
      );
    }
    return { default: pick as React.ComponentType<TProps> };
  });
}
