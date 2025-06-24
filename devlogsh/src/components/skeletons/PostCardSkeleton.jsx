export default function PostCardSkeleton() {
  return (
    <div className="bg-card dark:bg-darkCard p-4 md:p-6 rounded-xl flex flex-col md:flex-row gap-6 min-h-[220px] cursor-default animate-pulse">
      {/* Cover image placeholder */}
      <div className="w-full md:w-48 h-40 rounded-lg bg-muted dark:bg-zinc-700 flex-shrink-0" />

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title and author */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-2/3 bg-muted dark:bg-zinc-700 rounded" />
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-muted dark:bg-zinc-700" />
              <div className="h-4 w-16 rounded bg-muted dark:bg-zinc-700" />
            </div>
          </div>

          {/* Summary lines */}
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-muted dark:bg-zinc-700 rounded" />
            <div className="h-4 w-5/6 bg-muted dark:bg-zinc-700 rounded" />
            <div className="h-4 w-3/4 bg-muted dark:bg-zinc-700 rounded" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-5 w-14 bg-muted dark:bg-zinc-700 rounded" />
          <div className="h-5 w-14 bg-muted dark:bg-zinc-700 rounded" />
          <div className="h-5 w-14 bg-muted dark:bg-zinc-700 rounded" />
        </div>

        {/* Icons */}
        <div className="flex flex-row justify-between md:justify-start md:items-center text-sm gap-4 text-muted-foreground mb-3">
          <div className="flex flex-row md:items-center text-sm gap-4 text-muted-foreground">
            <div className="h-4 w-8 bg-muted dark:bg-zinc-700 rounded" />
            <div className="h-4 w-8 bg-muted dark:bg-zinc-700 rounded" />
            <div className="h-4 w-8 bg-muted dark:bg-zinc-700 rounded" />
          </div>
          <div className="flex md:hidden items-center gap-1 mt-1 text-sm text-muted-foreground">
            <div className="w-5 h-5 bg-muted dark:bg-zinc-700 rounded-full" />
            <div className="h-4 w-16 bg-muted dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
