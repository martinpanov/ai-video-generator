import { verifySession } from "@/app/lib/session";
import { clipFindByUser } from "@/app/repositories/clipRepository";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type ClipsContentProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined; }>;
};

export async function ClipsContent({ searchParams }: ClipsContentProps) {
  const params = await searchParams;
  const userId = await verifySession();
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;

  const { clips, totalCount, totalPages, currentPage } = await clipFindByUser(
    userId as string,
    page,
    pageSize
  );

  return (
    <DataTable
      columns={columns}
      data={clips}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}