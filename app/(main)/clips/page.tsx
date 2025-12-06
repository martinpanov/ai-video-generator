import { verifySession } from "@/app/lib/session";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { clipFindByUser } from "@/app/repositories/clipRepository";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined; }>;

export default async function Clips(props: { searchParams: SearchParams; }) {
  const searchParams = await props.searchParams;
  const userId = await verifySession();
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 20;

  const { clips, totalCount, totalPages, currentPage } = await clipFindByUser(
    userId as string,
    page,
    pageSize
  );

  return (
    <div className="container mx-auto p-10">
      <DataTable
        columns={columns}
        data={clips}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}