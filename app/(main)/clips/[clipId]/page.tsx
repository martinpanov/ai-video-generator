import { Suspense } from "react";
import { ClipContent } from "./components/ClipContent";
import { PageLoader } from "@/app/components/PageLoader";

type Params = Promise<{ clipId: string; }>;

export default function PlayClip({ params }: { params: Params; }) {
  return (
    <div className="w-full">
      <Suspense fallback={<PageLoader />}>
        <ClipContent params={params} />
      </Suspense>
    </div>
  );
}
