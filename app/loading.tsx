export default function Loading() {
  return (
    <main className="space-y-6 p-6">
      {/* Page heading */}
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />

      {/* Search and utility bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:max-w-sm" />
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Products table */}
      <div className="space-y-3">
        {/* Table header */}
        <div className="h-10 animate-pulse rounded-md bg-muted" />

        {/* Product rows */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-md border p-4"
          >
            <div className="size-12 shrink-0 animate-pulse rounded-md bg-muted" />

            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>

            <div className="hidden h-4 w-16 animate-pulse rounded bg-muted sm:block" />
          </div>
        ))}
      </div>
    </main>
  );
}
