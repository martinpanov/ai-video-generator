import { DataTable } from "./data-table";
import { columns } from "./columns";
import { todosFindByUser } from "@/app/repositories/todosRepository";
import { verifySession } from "@/app/lib/session";

type TodosContentProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined; }>;
};

export async function TodosContent({ searchParams }: TodosContentProps) {
  const userId = await verifySession();
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;

  const { todos, totalCount, totalPages, currentPage } = await todosFindByUser(
    userId as string,
    page,
    pageSize
  );

  return (
    <DataTable
      columns={columns}
      data={todos}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}
