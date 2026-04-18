import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="container-site py-8 md:py-12 max-w-4xl">
      <Skeleton className="h-8 w-36 mb-8" />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-brand-border mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 mb-[-1px]" />
        ))}
      </div>

      {/* Profile section */}
      <div className="rounded-lg border border-brand-border bg-white p-6 space-y-5">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
