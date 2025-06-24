import { Skeleton } from "@/components/ui/skeleton";

export default function UserSkeleton() {
  return (
    <section className="bg-lightBg dark:bg-darkBg text-black dark:text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-[1300px]">
        <div className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          <Skeleton className="w-48 h-10 mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Avatar & stats */}
          <div className="md:col-span-1 flex flex-col items-center">
            <Skeleton className="w-64 h-64 rounded-full" />

            <div className="mt-4 flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="mt-3 flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="mt-3">
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>

            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
