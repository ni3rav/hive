export function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to your main dashboard content.</p>
      <div className="mt-4 grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content Box 1</div>
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content Box 2</div>
        <div className="bg-muted/50 aspect-video rounded-xl p-4">Content Box 3</div>
      </div>
    </div>
  );
}