'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { DashboardHeatmapPoint } from '@/types/dashboard';

export interface PingingDotChartProps {
  data: DashboardHeatmapPoint[];
  config?: ChartConfig;
  title?: string;
  description?: string;
  trend?: string;
}

export function PingingDotChart({
  data,
  config,
  title = 'Activity',
  description = 'Last 30 days',
  trend,
}: PingingDotChartProps) {
  const chartConfig =
    config ||
    ({
      activity: {
        label: 'Activity',
        color: 'var(--primary)',
      },
    } satisfies ChartConfig);

  return (
    <Card className='h-full shadow-none border-border/50 bg-transparent'>
      <CardHeader>
        <CardTitle>
          {title}
          {trend && (
            <Badge
              variant='outline'
              className='text-primary bg-primary/10 border-none ml-2'
            >
              <TrendingUp className='h-4 w-4' />
              <span>{trend}</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[200px] w-full'>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray='3 3'
              stroke='hsl(var(--border))'
              opacity={0.4}
            />
            <XAxis
              dataKey='day'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              stroke='hsl(var(--muted-foreground))'
            />
            <ChartTooltip cursor={false} content={<ActivityTooltip />} />
            <Line
              dataKey='activity'
              type='monotone'
              stroke='var(--color-activity)'
              strokeWidth={2}
              strokeDasharray='4 4'
              dot={<CustomizedDot />}
              activeDot={{
                r: 6,
                fill: 'var(--color-activity)',
                stroke: 'var(--background)',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const ActivityTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: DashboardHeatmapPoint;
    value?: number;
  }>;
}) => {
  if (!active || !payload || !payload.length || !payload[0]?.payload) {
    return null;
  }

  const data = payload[0].payload;
  const activities = [
    { label: 'Posts', value: data.posts, key: 'posts' },
    { label: 'Authors', value: data.authors, key: 'authors' },
    { label: 'Categories', value: data.categories, key: 'categories' },
    { label: 'Tags', value: data.tags, key: 'tags' },
  ].filter((item) => item.value > 0);

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className='border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl'>
      <div className='font-medium'>{data.day}</div>
      <div className='grid gap-1.5'>
        {activities.map((activity) => (
          <div
            key={activity.key}
            className='flex w-full items-center justify-between gap-2'
          >
            <span className='text-muted-foreground'>{activity.label}</span>
            <span className='text-foreground font-mono font-medium tabular-nums'>
              {activity.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomizedDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx, cy, stroke } = props;

  return (
    <g>
      {/* Main dot */}
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
      {/* Ping animation circles */}
      <circle
        cx={cx}
        cy={cy}
        r={3}
        stroke={stroke}
        fill='none'
        strokeWidth='1'
        opacity='0.8'
      >
        <animate
          attributeName='r'
          values='3;10'
          dur='1s'
          repeatCount='indefinite'
        />
        <animate
          attributeName='opacity'
          values='0.8;0'
          dur='1s'
          repeatCount='indefinite'
        />
      </circle>
    </g>
  );
};
