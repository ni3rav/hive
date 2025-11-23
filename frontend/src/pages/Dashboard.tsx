import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardHeatmap } from '@/hooks/useDashboardHeatmap';
import type { DashboardRecentPost } from '@/types/dashboard';
import { useAuth } from '@/hooks/useAuth';
import { PingingDotChart } from '@/components/ui/pinging-dot-chart';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function StatsSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='rounded-md border border-border/40 bg-muted/10 p-6 space-y-4'
        >
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
        </div>
      ))}
    </div>
  );
}

function HeatmapSkeleton() {
  return (
    <div className='rounded-md border border-dashed border-border/40 bg-background/80 px-8 py-16 space-y-4 shadow-sm'>
      <Skeleton className='h-6 w-48 mx-auto' />
      <div className='flex flex-wrap gap-2 justify-center'>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className='h-6 w-6 rounded-md' />
        ))}
      </div>
    </div>
  );
}

function RecentPostsSkeleton() {
  return (
    <Card className='border border-border/40 shadow-none rounded-md'>
      <CardContent className='divide-y px-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className='py-6 space-y-2'>
            <Skeleton className='h-5 w-48' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-full' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const greeting = getGreeting();
  const workspaceSlug = useWorkspaceSlug();
  const { data: user, isLoading: userLoading } = useAuth();
  const { data, isLoading } = useDashboardStats(workspaceSlug);
  const { data: heatmapData, isLoading: heatmapLoading } =
    useDashboardHeatmap(workspaceSlug);

  const workspaceName = data?.workspaceName ?? 'workspace';
  const username = user?.name ?? '';
  const stats = data?.stats ?? [];
  const recentPosts = data?.recentPosts ?? [];
  const activitySummary =
    heatmapData?.activitySummary ?? 'Heatmap component placeholder';
  const heatmap = heatmapData?.heatmap ?? [];

  const renderRecentPost = (post: DashboardRecentPost) => (
    <div key={post.id ?? post.title} className='py-6 space-y-2'>
      <div className='flex flex-wrap items-center gap-2 text-base font-semibold'>
        {post.title}
        <Separator orientation='vertical' className='h-4' />
        <span className='text-xs uppercase tracking-wide text-muted-foreground'>
          {post.status}
        </span>
      </div>
      <p className='text-sm text-muted-foreground'>{post.publishedAt}</p>
      <p className='text-sm leading-relaxed text-muted-foreground/80'>
        {post.excerpt}
      </p>
    </div>
  );

  return (
    <ScrollArea className='h-full p-8'>
      <div className='flex flex-col gap-10 pb-16 pr-4'>
        <section className='space-y-2 px-4'>
          <p className='text-3xl font-semibold tracking-tight'>
            {greeting}{' '}
            {userLoading ? (
              <Skeleton className='w-24 h-8 rounded-md' />
            ) : (
              username
            )}
            !
          </p>
          <p className='text-base text-muted-foreground'>
            Here’s what’s happening in{' '}
            {userLoading ? (
              <Skeleton className='w-24 h-8 rounded-md' />
            ) : (
              workspaceName
            )}
          </p>
        </section>

        <section className='space-y-4 px-4'>
          <p className='text-sm font-medium text-muted-foreground'>
            {workspaceName} has:
          </p>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              {stats.map((item) => (
                <div
                  key={item.label}
                  className='rounded-3xl border border-border/50 bg-muted/20 p-6'
                >
                  <div className='text-4xl font-semibold leading-tight'>
                    {item.value}
                  </div>
                  <div className='text-sm uppercase tracking-widest text-muted-foreground mt-3'>
                    {item.label}
                  </div>
                </div>
              ))}
              {stats.length === 0 && (
                <p className='text-sm text-muted-foreground col-span-full'>
                  No stats available yet.
                </p>
              )}
            </div>
          )}
        </section>

        <section className='space-y-4 px-4'>
          <p className='text-sm font-medium text-muted-foreground'>
            Activity heatmap of {workspaceName}:
          </p>
          {heatmapLoading ? (
            <HeatmapSkeleton />
          ) : (
            <div className='rounded-md border border-border/50 bg-background/80 p-1 shadow-sm'>
              <PingingDotChart
                data={heatmap}
                title={`Activity in ${workspaceName}`}
                description={activitySummary}
              />
            </div>
          )}
        </section>

        <section className='space-y-4 px-4'>
          <p className='text-sm font-medium text-muted-foreground'>
            Recent Posts in {workspaceName}:
          </p>
          {isLoading ? (
            <RecentPostsSkeleton />
          ) : (
            <Card className='border border-border/50 shadow-none rounded-md'>
              <CardContent className='divide-y px-4'>
                {recentPosts.map((post) => renderRecentPost(post))}
                {recentPosts.length === 0 && (
                  <div className='py-6 text-sm text-muted-foreground text-center'>
                    No recent posts found.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </ScrollArea>
  );
}
