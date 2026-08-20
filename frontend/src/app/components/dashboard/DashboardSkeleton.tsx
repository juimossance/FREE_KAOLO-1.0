interface DashboardSkeletonProps {
  variant?: "enterprise" | "freelancer";
}

export function DashboardSkeleton({
  variant = "enterprise",
}: DashboardSkeletonProps) {
  return (
    <div className="p-6 space-y-6 animate-pulse">

      <div className="h-48 rounded-3xl bg-slate-200" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-96 rounded-2xl bg-slate-200" />
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-200" />
      </div>

    </div>
  );
}