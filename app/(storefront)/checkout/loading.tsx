import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-brand-border bg-white p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function CheckoutLoading() {
  return (
    <div className="container-site py-8 md:py-12 max-w-3xl">
      <Skeleton className="h-9 w-32 mb-8" />
      <div className="space-y-6">
        <SectionSkeleton lines={2} />
        <SectionSkeleton lines={4} />
        <SectionSkeleton lines={1} />
      </div>
    </div>
  );
}
