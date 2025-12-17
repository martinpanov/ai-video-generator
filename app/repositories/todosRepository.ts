import { prisma } from "../lib/db";

export async function todosFindByUser(
  userId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const skip = (page - 1) * pageSize;

  const [todos, totalCount] = await Promise.all([
    prisma.todos.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.todos.count({
      where: { userId }
    })
  ]);

  return {
    todos,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    currentPage: page
  };
}