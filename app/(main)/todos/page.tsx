import { verifySession } from "@/app/lib/session";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { todosFindByUser } from "@/app/repositories/todosRepository";
import { TodoDialog } from "./components/TodoDialog";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined; }>;

export default async function Todos(props: { searchParams: SearchParams; }) {
  const searchParams = await props.searchParams;
  const userId = await verifySession();
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 20;

  const { todos, totalCount, totalPages, currentPage } = await todosFindByUser(
    userId as string,
    page,
    pageSize
  );

  return (
    <div className="container mx-auto p-10">
      <DataTable
        columns={columns}
        data={todos}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
      <TodoDialog />
    </div>
  );
}