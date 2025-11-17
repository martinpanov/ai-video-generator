import { Skeleton } from "@/components/ui/skeleton";

export const ItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-2 py-3 px-4">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-6 w-[200px]" />
    </div>
  );
};