import { DeleteDialog } from "@/app/components/DeleteDialog";
import { TodoDialog } from "./components/TodoDialog";
import { TodosContent } from "./components/TodosContent";
import { Suspense } from "react";
import { DIALOG_IDS } from "@/app/constants";
import { deleteTodos } from "@/app/actions/todo";
import { PageLoader } from "@/app/components/PageLoader";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined; }>;

export default function Todos({ searchParams }: { searchParams: SearchParams; }) {
  return (
    <div className="container mx-auto p-10">
      <Suspense fallback={<PageLoader />}>
        <TodosContent searchParams={searchParams} />
      </Suspense>
      <TodoDialog />
      <DeleteDialog
        dialogId={DIALOG_IDS.DELETE_TODO_DIALOG}
        deleteAction={deleteTodos}
        itemName="todo"
      />
    </div>
  );
}
