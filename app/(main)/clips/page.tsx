import { Suspense } from "react";
import { ClipsContent } from "./components/ClipsContent";
import { DeleteDialog } from "@/app/components/DeleteDialog";
import { DIALOG_IDS } from "@/app/constants";
import { deleteMultipleClips } from "@/app/actions/clips";
import { PageLoader } from "@/app/components/PageLoader";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined; }>;

export default function Clips({ searchParams }: { searchParams: SearchParams; }) {
  return (
    <div className="container mx-auto p-10">
      <Suspense fallback={<PageLoader />}>
        <ClipsContent searchParams={searchParams} />
      </Suspense>
      <DeleteDialog
        dialogId={DIALOG_IDS.DELETE_CLIP_DIALOG}
        deleteAction={deleteMultipleClips}
        itemName="clip"
      />
    </div>
  );
}
