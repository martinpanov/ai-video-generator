import { Spinner } from "@/components/ui/spinner";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Spinner className="size-10" />
    </div>
  );
};