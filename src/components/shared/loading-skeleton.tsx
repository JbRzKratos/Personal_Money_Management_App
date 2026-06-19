export function CardSkeleton() {
  return (
    <div className="stat-card border border-border bg-card animate-pulse" suppressHydrationWarning>
      <div className="flex justify-between items-start mb-4" suppressHydrationWarning>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-6 w-32 bg-muted rounded"></div>
        </div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between">
        <div className="h-3 w-16 bg-muted rounded"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 animate-pulse" suppressHydrationWarning>
      <div className="h-10 bg-muted rounded-md mb-4" suppressHydrationWarning></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between py-3 border-b border-border" suppressHydrationWarning>
          <div className="h-4 w-1/4 bg-muted rounded" suppressHydrationWarning></div>
          <div className="h-4 w-1/4 bg-muted rounded" suppressHydrationWarning></div>
          <div className="h-4 w-1/6 bg-muted rounded" suppressHydrationWarning></div>
          <div className="h-4 w-1/6 bg-muted rounded" suppressHydrationWarning></div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" suppressHydrationWarning>
      <div className="space-y-2">
        <div className="h-4 w-16 bg-muted rounded"></div>
        <div className="h-10 bg-muted rounded-md w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-10 bg-muted rounded-md w-full"></div>
      </div>
      <div className="pt-4">
        <div className="h-10 bg-muted rounded-md w-full"></div>
      </div>
    </div>
  );
}
